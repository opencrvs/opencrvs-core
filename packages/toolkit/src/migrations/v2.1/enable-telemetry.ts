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
 * Codemod: ask whether to enable anonymous usage telemetry and, if so, flip the
 * `TELEMETRY_ENABLED` env var default to `true` in the country config's
 * `src/environment.ts`. The template ships it defaulting to `false`.
 */

import { IndentationText, Node, Project, SyntaxKind } from 'ts-morph'
import { existsSync } from 'fs'
import path from 'path'

const ENVIRONMENT_FILE = 'src/environment.ts'

/**
 * Asks whether to enable telemetry. Defaults to yes, and answers yes without
 * prompting when not attached to a terminal (e.g. non-interactive upgrades).
 */
async function promptEnableTelemetry(): Promise<boolean> {
  if (!process.stdin.isTTY) {
    return true
  }

  const inquirer = await import('@inquirer/prompts')
  return inquirer.confirm({
    message:
      'Enable anonymous usage telemetry to help improve OpenCRVS? Only ' +
      'aggregate metrics are shared — no personal or protected data.',
    default: true
  })
}

async function main() {
  const cwd = process.cwd()

  const enable = await promptEnableTelemetry()
  if (!enable) {
    console.log('  Telemetry left disabled.')
    return
  }

  const environmentPath = path.join(cwd, ENVIRONMENT_FILE)
  if (!existsSync(environmentPath)) {
    console.warn(
      `  ⚠️  ${ENVIRONMENT_FILE} not found; enable telemetry by setting TELEMETRY_ENABLED to default true by hand.`
    )
    return
  }

  const project = new Project({
    // ts-morph indents inserted code with four spaces by default, which the
    // country config's prettier run would immediately undo.
    manipulationSettings: { indentationText: IndentationText.TwoSpaces }
  })
  const sourceFile = project.addSourceFileAtPath(environmentPath)

  const telemetryProperty = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((property) => property.getName() === 'TELEMETRY_ENABLED')

  const options = telemetryProperty
    ?.getInitializerIfKind(SyntaxKind.CallExpression)
    ?.getArguments()[0]

  if (!options || !Node.isObjectLiteralExpression(options)) {
    console.warn(
      `  ⚠️  Could not find the TELEMETRY_ENABLED definition in ${ENVIRONMENT_FILE}; enable telemetry by setting its default to true by hand.`
    )
    return
  }

  const defaultProperty = options.getProperty('default')
  if (defaultProperty && Node.isPropertyAssignment(defaultProperty)) {
    defaultProperty.setInitializer('true')
  } else {
    options.insertPropertyAssignment(0, {
      name: 'default',
      initializer: 'true'
    })
  }

  await project.save()
  console.log(`  ✓ ${ENVIRONMENT_FILE}: TELEMETRY_ENABLED now defaults to true`)
}

export { main }
