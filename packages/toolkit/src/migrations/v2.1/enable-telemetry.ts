/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

/**
 * Codemod: bring v2.1 daily-usage telemetry to a country config.
 *
 * v2.1 adds a `POST /trigger/telemetry` endpoint the events service posts to,
 * which forwards to the OpenCRVS status service via `@opencrvs/toolkit`. A v2.0
 * country config has none of this, so this step:
 *   - writes `src/api/telemetry/handler.ts` (the forwarding handler),
 *   - adds the telemetry env vars to `src/environment.ts`
 *     (`TELEMETRY_ENABLED`, `COUNTRY_CODE`, `ENVIRONMENT_NAME`, `ORGANISATION`),
 *   - registers the route and the startup notice in `src/index.ts`.
 *
 * It first asks whether to enable telemetry (default yes); the answer only sets
 * the `TELEMETRY_ENABLED` default — the endpoint is wired in either way so it
 * can be turned on later. Anything already present is left untouched, and any
 * step whose structure cannot be found is skipped with a warning listing what
 * to wire by hand.
 */

import {
  IndentationText,
  Node,
  ObjectLiteralExpression,
  Project,
  QuoteKind,
  SourceFile,
  SyntaxKind
} from 'ts-morph'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'

const HANDLER_FILE = 'src/api/telemetry/handler.ts'
const ENVIRONMENT_FILE = 'src/environment.ts'
const INDEX_FILE = 'src/index.ts'
const HANDLER_MODULE = './api/telemetry/handler'

const skipped: string[] = []

function warnSkipped(message: string) {
  skipped.push(message)
  console.warn(`  ⚠️  ${message}`)
}

// ─── The handler source written into the country config ──────────────────────

const TELEMETRY_HANDLER_SOURCE = `/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { Request, ResponseToolkit } from '@hapi/hapi'
import * as Joi from 'joi'
import { sendTelemetry, TelemetryReport } from '@opencrvs/toolkit/telemetry'
import { env } from '@countryconfig/environment'
import { logger } from '@countryconfig/logger'
import { applicationConfig } from '@countryconfig/api/application/application-config'

/** Report the events service posts to \`/trigger/telemetry\`. */
export const telemetrySchema = Joi.object({
  reported_at: Joi.string().isoDate().required(),
  app_version: Joi.string().optional(),
  metrics: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives(Joi.number(), Joi.string(), Joi.boolean())
    )
    .required()
})

interface IncomingReport {
  reported_at: string
  app_version?: string
  metrics: Record<string, number | string | boolean>
}

/** Logged once at countryconfig startup while telemetry is disabled. */
export const TELEMETRY_DISABLED_NOTICE =
  'Telemetry is disabled. Help improve OpenCRVS by sharing anonymous, ' +
  'aggregate usage metrics (registration and certificate counts, active ' +
  'users, uptime) — no personal, health, or otherwise protected record data ' +
  'ever leaves your instance. Enable it by setting TELEMETRY_ENABLED=true on ' +
  'the countryconfig service.'

/**
 * Receives a usage report from the events service and, when telemetry is
 * enabled for this instance, stamps the instance identity onto it and forwards
 * it to the status service via the toolkit's \`sendTelemetry\` (which owns the
 * endpoint and payload schema). The events service is unaware of whether
 * telemetry is enabled or of the country code / domain / environment reported.
 */
export async function telemetryHandler(request: Request, h: ResponseToolkit) {
  // Only accept OpenCRVS *system* tokens (the events service's service
  // token has userType 'system'). A logged-in user's token is a 'user' token,
  // so a user cannot submit telemetry with their own credentials — and the
  // service-token endpoint is not reachable through the public gateway.
  const credentials = request.auth.credentials as
    | { userType?: string }
    | undefined
  if (credentials?.userType !== 'system') {
    logger.warn('Telemetry: rejected a request that is not from a system token')
    return h.response({ error: 'forbidden' }).code(403)
  }

  if (!env.TELEMETRY_ENABLED) {
    // The encouraging notice is logged once at startup (see index.ts); keep the
    // per-report path quiet.
    return h.response({ status: 'skipped' }).code(200)
  }

  const incoming = request.payload as IncomingReport

  // Only production instances report; staging, QA and local build the report
  // but never reach the status service. (This gate used to live in the
  // toolkit's sendTelemetry; each country config now owns it.)
  if (!env.isProduction) {
    logger.info(
      \`Telemetry: report for \${incoming.reported_at} was not sent — only production instances report\`
    )
    return h.response({ status: 'skipped' }).code(200)
  }

  const report: TelemetryReport = {
    reported_at: incoming.reported_at,
    country_code: env.COUNTRY_CODE,
    organisation: env.ORGANISATION,
    // env.DOMAIN defaults to a wildcard for CORS in some setups; treat that as
    // "no domain" rather than reporting a literal "*".
    domain: env.DOMAIN && env.DOMAIN !== '*' ? env.DOMAIN : null,
    instance: {
      application_name: applicationConfig.APPLICATION_NAME,
      environment: env.ENVIRONMENT_NAME,
      app_version: incoming.app_version
    },
    metrics: incoming.metrics
  }

  let result
  try {
    result = await sendTelemetry(report)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(\`Telemetry: forwarding to status service failed: \${message}\`)
    return h.response({ status: 'error' }).code(502)
  }

  if (result.outcome === 'rejected') {
    logger.error(
      \`Telemetry: status service rejected report (HTTP \${result.status}): \${result.detail ?? ''}\`
    )
    return h.response({ status: 'error' }).code(502)
  }

  logger.info(
    \`Telemetry: forwarded report for \${report.reported_at} to the status service\`
  )
  return h.response({ status: 'forwarded' }).code(202)
}
`

// ─── Prompt ──────────────────────────────────────────────────────────────────

interface TelemetryConfig {
  enabled: boolean
  countryCode: string
  organisation: string
}

const TELEMETRY_DISABLED: TelemetryConfig = {
  enabled: false,
  countryCode: '',
  organisation: ''
}

/**
 * Asks whether to enable telemetry and, when enabled, for the country code and
 * organisation reported with it — both mandatory, re-asking until supplied.
 * Non-interactive upgrades cannot answer, so telemetry stays disabled there.
 */
async function promptTelemetryConfig(): Promise<TelemetryConfig> {
  if (!process.stdin.isTTY) {
    return TELEMETRY_DISABLED
  }

  const { confirm, input } = await import('@inquirer/prompts')

  const enabled = await confirm({
    message:
      'Enable anonymous usage telemetry to help improve OpenCRVS? Only ' +
      'aggregate metrics are shared — no personal or protected data.',
    default: true
  })

  if (!enabled) {
    return TELEMETRY_DISABLED
  }

  const countryCode = (
    await input({
      message: 'Country code (ISO alpha-3, e.g. FAR):',
      validate: (value) =>
        /^[A-Za-z]{3}$/.test(value.trim()) ||
        'Enter a 3-letter ISO alpha-3 code.'
    })
  )
    .trim()
    .toUpperCase()

  const organisation = (
    await input({
      message: 'Organisation running this instance:',
      validate: (value) =>
        value.trim() !== '' || 'Enter an organisation name.'
    })
  ).trim()

  return { enabled: true, countryCode, organisation }
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function writeTelemetryHandler(cwd: string) {
  const handlerPath = path.join(cwd, HANDLER_FILE)
  if (existsSync(handlerPath)) {
    console.log(`  ${HANDLER_FILE} already present; left unchanged`)
    return
  }

  mkdirSync(path.dirname(handlerPath), { recursive: true })
  writeFileSync(handlerPath, TELEMETRY_HANDLER_SOURCE)
  console.log(`  ✓ ${HANDLER_FILE}`)
}

/**
 * Adds `name: <initializer>` after the last entry of `object`, indented to
 * match its neighbours. Text insertion (rather than `addPropertyAssignment`)
 * keeps ts-morph from re-indenting the whole object. Returns false when the
 * object is empty.
 */
function appendProperty(
  sourceFile: SourceFile,
  object: ObjectLiteralExpression,
  name: string,
  valueLines: string[]
) {
  const properties = object.getProperties()
  const lastProperty = properties[properties.length - 1]
  if (!lastProperty) return false

  const indent = lastProperty.getIndentationText()
  const entry = valueLines
    .map((line, index) => `${indent}${index === 0 ? `${name}: ${line}` : line}`)
    .join('\n')

  sourceFile.insertText(lastProperty.getEnd(), `,\n${entry}`)
  return true
}

function ensureEnvalidNamedImports(sourceFile: SourceFile, names: string[]) {
  const importDeclaration = sourceFile
    .getImportDeclarations()
    .find((declaration) => declaration.getModuleSpecifierValue() === 'envalid')

  if (!importDeclaration) {
    warnSkipped(
      `Could not find the 'envalid' import in ${ENVIRONMENT_FILE}; import { ${names.join(', ')} } by hand`
    )
    return
  }

  const existing = new Set(
    importDeclaration.getNamedImports().map((named) => named.getName())
  )
  for (const name of names) {
    if (!existing.has(name)) {
      importDeclaration.addNamedImport(name)
    }
  }
}

function getCleanEnvObject(sourceFile: SourceFile) {
  const options = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((call) => call.getExpression().getText() === 'cleanEnv')
    ?.getArguments()[1]
  return options && Node.isObjectLiteralExpression(options)
    ? options
    : undefined
}

/**
 * Ensures an env var exists in the cleanEnv config with the given default.
 *
 * - `update: true` sets the default even when the var already exists (used for
 *   the values the operator just supplied).
 * - `update: false` only adds the var when missing, never touching an existing
 *   one (so disabling never clobbers a country's own values).
 *
 * Every call re-resolves the config object: a prior `insertText` invalidates
 * nodes previously read from the file.
 */
function upsertEnvVar(
  sourceFile: SourceFile,
  name: string,
  kind: 'bool' | 'str',
  defaultExpr: string,
  desc: string,
  update: boolean
) {
  const object = getCleanEnvObject(sourceFile)
  if (!object) return

  const existing = object.getProperty(name)
  if (existing && Node.isPropertyAssignment(existing)) {
    if (!update) return

    const options = existing
      .getInitializerIfKind(SyntaxKind.CallExpression)
      ?.getArguments()[0]
    if (options && Node.isObjectLiteralExpression(options)) {
      const defaultProperty = options.getProperty('default')
      if (defaultProperty && Node.isPropertyAssignment(defaultProperty)) {
        defaultProperty.setInitializer(defaultExpr)
      } else {
        options.insertPropertyAssignment(0, {
          name: 'default',
          initializer: defaultExpr
        })
      }
      console.log(`  ✓ ${ENVIRONMENT_FILE}: ${name} default set`)
    }
    return
  }

  if (
    appendProperty(sourceFile, object, name, [
      `${kind}({`,
      `  default: ${defaultExpr},`,
      `  desc: ${JSON.stringify(desc)}`,
      '})'
    ])
  ) {
    console.log(`  ✓ ${ENVIRONMENT_FILE}: ${name}`)
  }
}

function addEnvironmentVariables(
  project: Project,
  cwd: string,
  config: TelemetryConfig
) {
  const sourceFile = project.addSourceFileAtPathIfExists(
    path.join(cwd, ENVIRONMENT_FILE)
  )
  if (!sourceFile) {
    warnSkipped(
      `${ENVIRONMENT_FILE} not found; add the telemetry env vars by hand`
    )
    return
  }

  if (!getCleanEnvObject(sourceFile)) {
    warnSkipped(
      `Could not find the cleanEnv(...) config object in ${ENVIRONMENT_FILE}; add the telemetry env vars by hand`
    )
    return
  }

  ensureEnvalidNamedImports(sourceFile, ['bool', 'str'])

  // Reflect the operator's choice in the on/off default.
  upsertEnvVar(
    sourceFile,
    'TELEMETRY_ENABLED',
    'bool',
    config.enabled ? 'true' : 'false',
    'When true, usage telemetry received from the events service is forwarded to the OpenCRVS status service.',
    true
  )

  // When enabled, bake the supplied identity into the defaults; when disabled,
  // only seed placeholders if the vars are missing (never overwrite).
  upsertEnvVar(
    sourceFile,
    'COUNTRY_CODE',
    'str',
    config.enabled ? JSON.stringify(config.countryCode) : `'FAR'`,
    'ISO-style country code of this instance, reported with telemetry.',
    config.enabled
  )
  upsertEnvVar(
    sourceFile,
    'ORGANISATION',
    'str',
    config.enabled ? JSON.stringify(config.organisation) : `''`,
    'Organisation running this instance, reported with telemetry. Empty by default.',
    config.enabled
  )
  upsertEnvVar(
    sourceFile,
    'ENVIRONMENT_NAME',
    'str',
    `'development'`,
    'Environment name (e.g. "production", "staging") reported as the telemetry environment.',
    false
  )
}

function wireIndex(project: Project, cwd: string) {
  const sourceFile = project.addSourceFileAtPathIfExists(
    path.join(cwd, INDEX_FILE)
  )
  if (!sourceFile) {
    warnSkipped(
      `${INDEX_FILE} not found; register POST /trigger/telemetry and the startup notice by hand`
    )
    return
  }

  // 1. import
  if (
    !sourceFile
      .getImportDeclarations()
      .some((d) => d.getModuleSpecifierValue() === HANDLER_MODULE)
  ) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: HANDLER_MODULE,
      namedImports: [
        'telemetryHandler',
        'telemetrySchema',
        'TELEMETRY_DISABLED_NOTICE'
      ]
    })
    console.log(`  ✓ ${INDEX_FILE}: import ${HANDLER_MODULE}`)
  }

  // 2. route, inserted after the last server.route(...) call
  if (!sourceFile.getText().includes("path: '/trigger/telemetry'")) {
    const lastRouteStatement = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getText() === 'server.route')
      .map((call) =>
        call.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)
      )
      .filter((statement): statement is NonNullable<typeof statement> =>
        Boolean(statement)
      )
      .pop()

    if (!lastRouteStatement) {
      warnSkipped(
        `Could not find a server.route(...) call in ${INDEX_FILE}; register POST /trigger/telemetry by hand`
      )
    } else {
      const indent = lastRouteStatement.getIndentationText()
      const route = [
        `server.route({`,
        `  method: 'POST',`,
        `  path: '/trigger/telemetry',`,
        `  handler: telemetryHandler,`,
        `  options: {`,
        `    tags: ['api', 'triggers'],`,
        `    validate: {`,
        `      payload: telemetrySchema`,
        `    },`,
        `    description:`,
        `      'Receives a usage report from the events service and forwards it to the status service when telemetry is enabled'`,
        `  }`,
        `})`
      ]
        .map((line) => (line ? `${indent}${line}` : line))
        .join('\n')

      sourceFile.insertText(lastRouteStatement.getEnd(), `\n\n${route}`)
      console.log(`  ✓ ${INDEX_FILE}: POST /trigger/telemetry`)
    }
  }

  // 3. startup notice, inserted after the "Server successfully started" log.
  // Guard on the usage, not the name — the import added above also mentions it.
  if (
    !sourceFile.getText().includes('logger.info(TELEMETRY_DISABLED_NOTICE)')
  ) {
    const startedLog = sourceFile
      .getDescendantsOfKind(SyntaxKind.ExpressionStatement)
      .find((statement) =>
        statement.getText().includes('Server successfully started')
      )

    if (!startedLog) {
      warnSkipped(
        `Could not find the startup log in ${INDEX_FILE}; log TELEMETRY_DISABLED_NOTICE when TELEMETRY_ENABLED is false by hand`
      )
    } else {
      const indent = startedLog.getIndentationText()
      const notice = [
        `if (!env.TELEMETRY_ENABLED) {`,
        `  logger.info(TELEMETRY_DISABLED_NOTICE)`,
        `}`
      ]
        .map((line) => (line ? `${indent}${line}` : line))
        .join('\n')

      sourceFile.insertText(startedLog.getEnd(), `\n\n${notice}`)
      console.log(`  ✓ ${INDEX_FILE}: telemetry-disabled startup notice`)

      if (
        !sourceFile
          .getImportDeclarations()
          .some((d) => d.getModuleSpecifierValue() === './environment')
      ) {
        warnSkipped(
          `The startup notice reads env.TELEMETRY_ENABLED but ${INDEX_FILE} does not import env from './environment'; import it by hand`
        )
      }
    }
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const cwd = process.cwd()

  const config = await promptTelemetryConfig()

  console.log(
    `\nAdding daily usage telemetry (${config.enabled ? `enabled for ${config.countryCode}` : 'disabled'} by default)...\n`
  )

  writeTelemetryHandler(cwd)

  const project = new Project({
    // ts-morph indents inserted code with four spaces and double-quotes strings
    // by default, both of which the country config's prettier run would undo.
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single
    }
  })

  addEnvironmentVariables(project, cwd, config)
  wireIndex(project, cwd)

  await project.save()

  if (skipped.length > 0) {
    console.warn(
      `\n⚠️  ${skipped.length} telemetry step(s) were skipped. Wire the following by hand:`
    )
    for (const message of skipped) {
      console.warn(`  - ${message}`)
    }
  }
}

export { main }
