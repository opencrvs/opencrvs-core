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
 * Codemod: Convert JS client/login config files to TypeScript and update Hapi route handlers.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/convert-config-files-to-ts.ts
 *
 * Phase 1 — JS → TS conversion (for each of the four config files in src/):
 *   - client-config.js        → client-config.ts        (exports clientConfig)
 *   - client-config.prod.js   → client-config.prod.ts   (exports clientConfigProd)
 *   - login-config.js         → login-config.ts         (exports loginConfig)
 *   - login-config.prod.js    → login-config.prod.ts    (exports loginConfigProd)
 *
 *   For each file:
 *   - Extracts the `window.config = { ... }` object (handles both direct and IIFE patterns)
 *   - Removes keys not present in the ClientConfig / LoginConfig schema
 *   - Converts LANGUAGES from a comma-separated string to an array of strings
 *   - Adds placeholder for REGISTER_BACKGROUND / LOGIN_BACKGROUND if absent
 *   - Wraps the config in defineClientConfig() / defineLoginConfig()
 *   - Deletes the original .js file
 *
 *   For login config files specifically:
 *   - Imports applicationConfig from src/api/application/application-config
 *   - Sources USER_NOTIFICATION_DELIVERY_METHOD, INFORMANT_NOTIFICATION_DELIVERY_METHOD,
 *     and PHONE_NUMBER_PATTERN from applicationConfig rather than hardcoding them
 *
 * Phase 2 — Route handler replacement:
 *   - Finds every Hapi route object whose `path` is '/client-config.js' or '/login-config.js'
 *   - Replaces the handler (or options.handler) with:
 *       const config = process.env.NODE_ENV === 'production' ? <prod> : <base>
 *       return h.response(`window.config = ${JSON.stringify(config)}`).type('application/javascript')
 *   - Adds the required config imports to the route file
 *
 * Phase 3 — Wrap applicationConfig with defineApplicationConfig:
 *   - Finds src/api/application/application-config.ts
 *   - If the exported applicationConfig is a plain object literal, wraps it with
 *     defineApplicationConfig() from '@opencrvs/toolkit/application-config'
 *   - Adds the defineApplicationConfig import if not already present
 */

import * as fs from 'fs'
import {
  Project,
  SyntaxKind,
  ObjectLiteralExpression,
  Node,
  SourceFile,
  PropertyAssignment
} from 'ts-morph'
import nodePath from 'path'
import { getCwd } from '.'

// ─── Schema-valid keys per config type ───────────────────────────────────────

const CLIENT_VALID_KEYS = new Set([
  'COUNTRY',
  'LANGUAGES',
  'SENTRY',
  'REGISTER_BACKGROUND',
  'DASHBOARDS',
  'FEATURES'
])

const LOGIN_VALID_KEYS = new Set([
  'COUNTRY',
  'LANGUAGES',
  'USER_NOTIFICATION_DELIVERY_METHOD',
  'INFORMANT_NOTIFICATION_DELIVERY_METHOD',
  'PHONE_NUMBER_PATTERN',
  'LOGIN_BACKGROUND',
  'SENTRY'
])

// Keys defined in ApplicationConfig from packages/commons/src/application-config.ts
const APPLICATION_CONFIG_VALID_KEYS = new Set([
  'APPLICATION_NAME',
  'COUNTRY_LOGO',
  'SYSTEM_IANA_TIMEZONE',
  'CURRENCY',
  'ADMIN_STRUCTURE',
  'PHONE_NUMBER_PATTERN',
  'USER_NOTIFICATION_DELIVERY_METHOD',
  'INFORMANT_NOTIFICATION_DELIVERY_METHOD',
  'SEARCH_DEFAULT_CRITERIA'
])

// ─── Config group definitions ─────────────────────────────────────────────────

interface ConfigGroup {
  /** Base name without extension, e.g. 'client-config' */
  baseName: string
  /** Prod name without extension, e.g. 'client-config.prod' */
  prodName: string
  /** ts-morph define function name */
  defineFn: 'defineClientConfig' | 'defineLoginConfig'
  /** Import source for defineXxx */
  importFrom: string
  /** Schema-valid keys */
  validKeys: Set<string>
  /**
   * Keys that MUST be present but may be absent in old files.
   * Value is the placeholder initializer text to emit.
   */
  requiredPlaceholders: Record<string, string>
  /**
   * Keys whose values are always sourced from `applicationConfig` rather than
   * copied from the original JS file or filled with a placeholder.
   * When set, an import for applicationConfig is added to the generated file.
   */
  applicationConfigKeys?: string[]
  /**
   * Module specifier for the applicationConfig import, relative to src/.
   * e.g. './api/application/application-config'
   */
  applicationConfigImportPath?: string
  /** Export variable names keyed by base/prod name */
  exportNames: Record<string, string>
  /** The Hapi route path whose handler will be replaced */
  routePath: string
}

const CONFIG_GROUPS: ConfigGroup[] = [
  {
    baseName: 'client-config',
    prodName: 'client-config.prod',
    defineFn: 'defineClientConfig',
    importFrom: '@opencrvs/toolkit/application-config',
    validKeys: CLIENT_VALID_KEYS,
    requiredPlaceholders: {
      // BackgroundConfig requires backgroundColor or backgroundImage
      REGISTER_BACKGROUND: "{ backgroundColor: '#F4F4F7' }"
    },
    exportNames: {
      'client-config': 'clientConfig',
      'client-config.prod': 'clientConfigProd'
    },
    routePath: '/client-config.js'
  },
  {
    baseName: 'login-config',
    prodName: 'login-config.prod',
    defineFn: 'defineLoginConfig',
    importFrom: '@opencrvs/toolkit/application-config',
    validKeys: LOGIN_VALID_KEYS,
    requiredPlaceholders: {},
    // These keys are always sourced from applicationConfig rather than
    // copied from the old JS file or filled with a placeholder value.
    // LOGIN_BACKGROUND lives in applicationConfig and is not part of the
    // ApplicationConfig schema, so Phase 3 will inline its value and remove
    // it from applicationConfig automatically.
    applicationConfigKeys: [
      'LOGIN_BACKGROUND',
      'USER_NOTIFICATION_DELIVERY_METHOD',
      'INFORMANT_NOTIFICATION_DELIVERY_METHOD',
      'PHONE_NUMBER_PATTERN'
    ],
    applicationConfigImportPath: './api/application/application-config',
    exportNames: {
      'login-config': 'loginConfig',
      'login-config.prod': 'loginConfigProd'
    },
    routePath: '/login-config.js'
  }
]

// ─── HTTP verb set (for route detection) ─────────────────────────────────────

const HTTP_VERBS = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
  '*'
])

// ─── Phase 1 helpers ──────────────────────────────────────────────────────────

/**
 * Parses a JS config file and returns the ObjectLiteralExpression that is the
 * right-hand side of the `window.config = { ... }` assignment.
 * Handles both direct assignment and IIFE-wrapped assignment.
 */
function extractWindowConfig(
  jsFilePath: string
): ObjectLiteralExpression | null {
  const jsProject = new Project({
    compilerOptions: { allowJs: true, checkJs: false }
    // addFilesFromTsConfig: false
  })

  let sourceFile
  try {
    sourceFile = jsProject.addSourceFileAtPath(jsFilePath)
  } catch {
    console.warn(`  Could not parse ${jsFilePath}`)
    return null
  }

  for (const binary of sourceFile.getDescendantsOfKind(
    SyntaxKind.BinaryExpression
  )) {
    if (binary.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) continue

    const left = binary.getLeft()
    if (!Node.isPropertyAccessExpression(left)) continue
    if (left.getExpression().getText() !== 'window') continue
    if (left.getName() !== 'config') continue

    const right = binary.getRight()
    if (Node.isObjectLiteralExpression(right)) return right
  }

  return null
}

/**
 * Converts a LANGUAGES string initializer like `'en,fr'` into an array literal
 * like `['en', 'fr']`.  If the initializer is already an array, returns its
 * text unchanged.
 */
function convertLanguages(init: Node): string {
  if (Node.isStringLiteral(init)) {
    const langs = init
      .getLiteralValue()
      .split(',')
      .map((l) => `'${l.trim()}'`)
      .join(', ')
    return `[${langs}]`
  }
  // Already an array or something else — keep as-is
  return init.getText()
}

/**
 * Extracts the plain URL string from a string literal or a no-substitution
 * template literal (i.e. a backtick string with no ${…} expressions).
 * Returns null for anything more complex.
 */
function extractStaticUrlString(init: Node): string | null {
  if (Node.isStringLiteral(init)) {
    return init.getLiteralValue()
  }
  if (init.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
    // getText() returns the text including surrounding backticks — strip them
    const raw = init.getText()
    return raw.slice(1, -1)
  }
  return null
}

/**
 * For prod files, rewrites a DASHBOARDS[].url initializer so that the origin
 * (protocol + host + optional port) is replaced with `${scheme}//metabase.${hostname}`
 * and the path/query/hash is preserved verbatim.
 *
 * Returns the original text unchanged for dev files or when the URL cannot be
 * parsed.
 */
function transformDashboardUrl(init: Node, isProd: boolean): string {
  if (!isProd) return init.getText()

  const urlString = extractStaticUrlString(init)
  if (!urlString) return init.getText()

  try {
    const parsed = new URL(urlString)
    const rest = parsed.pathname + parsed.search + parsed.hash
    // Escape the template literal so the OUTPUT file contains real ${} expressions
    return `\`\${scheme}//metabase.\${hostname}${rest}\``
  } catch {
    return init.getText()
  }
}

/**
 * For prod files, recursively rewrites every `url` property inside the
 * DASHBOARDS array using transformDashboardUrl.
 * For dev files, returns the initializer text unchanged.
 */
function transformDashboardsValue(init: Node, isProd: boolean): string {
  if (!isProd || !Node.isArrayLiteralExpression(init)) {
    return init.getText()
  }

  const elementParts: string[] = []

  for (const el of init.getElements()) {
    if (!Node.isObjectLiteralExpression(el)) {
      elementParts.push(el.getText())
      continue
    }

    const propParts: string[] = []
    for (const prop of el.getProperties()) {
      if (!Node.isPropertyAssignment(prop)) {
        propParts.push(prop.getText())
        continue
      }
      const propName = prop.getName()
      const propInit = prop.getInitializer()
      if (!propInit) {
        propParts.push(prop.getText())
        continue
      }
      if (propName === 'url') {
        propParts.push(`url: ${transformDashboardUrl(propInit, isProd)}`)
      } else {
        propParts.push(`${propName}: ${propInit.getText()}`)
      }
    }

    elementParts.push(
      `  {\n${propParts.map((p) => `    ${p}`).join(',\n')}\n  }`
    )
  }

  return `[\n${elementParts.join(',\n')}\n]`
}

/**
 * Generates the full TypeScript source for a converted config file.
 *
 * Prod files (isProd = true):
 *   - Import `env` from './environment'
 *   - Define `scheme = 'https'`, `hostname = env.DOMAIN`, `sentry = env.SENTRY_DSN`
 *   - Use `sentry` for the SENTRY property
 *   - Rewrite DASHBOARDS[].url origins to use scheme/hostname template expressions
 *
 * Dev files (isProd = false):
 *   - No env import
 *   - Define `scheme = 'http'`, `hostname = 'localhost'`
 *   - Keep SENTRY and DASHBOARDS URLs as-is from the original JS file
 */
function generateTsContent(
  configObj: ObjectLiteralExpression,
  exportName: string,
  group: ConfigGroup,
  isProd: boolean
): string {
  // ── Config properties ────────────────────────────────────────────────────────
  const propertyLines: string[] = []
  const seenKeys = new Set<string>()

  const appConfigKeySet = new Set(group.applicationConfigKeys ?? [])

  for (const prop of configObj.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) continue

    const name = prop.getName()
    if (!group.validKeys.has(name)) continue
    // Keys sourced from applicationConfig are always emitted separately below
    if (appConfigKeySet.has(name)) continue
    seenKeys.add(name)

    const init = prop.getInitializer()
    if (!init) continue

    if (name === 'LANGUAGES') {
      propertyLines.push(`  LANGUAGES: ${convertLanguages(init)}`)
    } else if (name === 'SENTRY' && isProd) {
      propertyLines.push(`  SENTRY: sentry`)
    } else if (name === 'DASHBOARDS') {
      propertyLines.push(
        `  DASHBOARDS: ${transformDashboardsValue(init, isProd)}`
      )
    } else {
      propertyLines.push(`  ${name}: ${init.getText()}`)
    }
  }

  // Add placeholder lines for required keys that were absent in the JS file
  for (const [key, placeholder] of Object.entries(group.requiredPlaceholders)) {
    if (!seenKeys.has(key)) {
      propertyLines.push(
        `  // TODO: configure ${key} — replace this placeholder`,
        `  ${key}: ${placeholder}`
      )
    }
  }

  // Always emit applicationConfig-sourced keys last, regardless of whether
  // they appeared in the original JS file
  for (const key of appConfigKeySet) {
    propertyLines.push(`  ${key}: applicationConfig.${key}`)
  }

  const body = propertyLines.join(',\n')

  const headerLines: string[] = []

  headerLines.push(`import * as fs from 'fs'`)
  headerLines.push(`import { join } from 'path'`)

  if (isProd) {
    headerLines.push(`import { env } from './environment'`)
  }
  headerLines.push(`import { ${group.defineFn} } from '${group.importFrom}'`)
  if (group.applicationConfigImportPath) {
    headerLines.push(
      `import { applicationConfig } from '${group.applicationConfigImportPath}'`
    )
  }
  headerLines.push('')

  if (isProd) {
    headerLines.push(`const scheme = 'https'`)
    headerLines.push(`const hostname = env.DOMAIN`)
    headerLines.push(`const sentry = env.SENTRY_DSN`)
  } else {
    headerLines.push(`const scheme = 'http'`)
    headerLines.push(`const hostname = 'localhost'`)
  }

  return [
    ...headerLines,
    '',
    `export const ${exportName} = ${group.defineFn}({`,
    body,
    '})',
    ''
  ].join('\n')
}

/**
 * Converts a single JS config file to TypeScript.
 * Returns true if a file was written.
 */
function convertFile(
  name: string,
  group: ConfigGroup,
  srcDir: string
): boolean {
  const jsFilePath = nodePath.join(srcDir, `${name}.js`)
  const tsFilePath = nodePath.join(srcDir, `${name}.ts`)

  if (!fs.existsSync(jsFilePath)) {
    console.log(`  Skipping ${name}.js — file not found`)
    return false
  }

  if (fs.existsSync(tsFilePath)) {
    console.log(`  Skipping ${name}.js — ${name}.ts already exists`)
    return false
  }

  const configObj = extractWindowConfig(jsFilePath)
  if (!configObj) {
    console.warn(
      `  [${name}.js] Could not locate window.config assignment — skipping`
    )
    return false
  }

  const isProd = name.endsWith('.prod')
  const exportName = group.exportNames[name]
  const content = generateTsContent(configObj, exportName, group, isProd)

  fs.writeFileSync(tsFilePath, content, 'utf8')
  fs.unlinkSync(jsFilePath)

  console.log(`  Converted ${name}.js → ${name}.ts (export: ${exportName})`)
  return true
}

// ─── Phase 2 helpers ──────────────────────────────────────────────────────────

/**
 * Returns true when an ObjectLiteralExpression is a Hapi route config, i.e. it
 * has both a `method` property (a recognised HTTP verb or array of verbs) and a
 * `path` property that is a string literal.
 */
function isRouteConfig(obj: ObjectLiteralExpression): boolean {
  const methodProp = obj.getProperty('method')
  if (!methodProp || !Node.isPropertyAssignment(methodProp)) return false

  const methodInit = methodProp.getInitializer()
  if (!methodInit) return false

  if (Node.isStringLiteral(methodInit)) {
    if (!HTTP_VERBS.has(methodInit.getLiteralValue().toUpperCase()))
      return false
  } else if (Node.isArrayLiteralExpression(methodInit)) {
    const allVerbs = methodInit
      .getElements()
      .every(
        (el) =>
          Node.isStringLiteral(el) &&
          HTTP_VERBS.has(el.getLiteralValue().toUpperCase())
      )
    if (!allVerbs) return false
  } else {
    return false
  }

  const pathProp = obj.getProperty('path')
  if (!pathProp || !Node.isPropertyAssignment(pathProp)) return false

  const pathInit = pathProp.getInitializer()
  return !!pathInit && Node.isStringLiteral(pathInit)
}

/**
 * Returns the string value of a route config's `path` property, or null if not
 * available.
 */
function getRoutePath(obj: ObjectLiteralExpression): string | null {
  const pathProp = obj.getProperty('path')
  if (!pathProp || !Node.isPropertyAssignment(pathProp)) return null
  const pathInit = pathProp.getInitializer()
  if (!pathInit || !Node.isStringLiteral(pathInit)) return null
  return pathInit.getLiteralValue()
}

/**
 * Finds the PropertyAssignment for the handler function inside a route config.
 * Looks at both `handler` (top-level) and `options.handler` (nested).
 */
function findHandlerProperty(
  routeObj: ObjectLiteralExpression
): PropertyAssignment | null {
  // Top-level handler
  const directHandler = routeObj.getProperty('handler')
  if (directHandler && Node.isPropertyAssignment(directHandler)) {
    return directHandler
  }

  // options.handler
  const optionsProp = routeObj.getProperty('options')
  if (optionsProp && Node.isPropertyAssignment(optionsProp)) {
    const optionsInit = optionsProp.getInitializer()
    if (optionsInit && Node.isObjectLiteralExpression(optionsInit)) {
      const nestedHandler = optionsInit.getProperty('handler')
      if (nestedHandler && Node.isPropertyAssignment(nestedHandler)) {
        return nestedHandler
      }
    }
  }

  return null
}

/**
 * Ensures the source file has named imports for both the base and prod config
 * exports, adding the import declarations if they are not already present.
 */
function ensureConfigImports(
  sourceFile: SourceFile,
  group: ConfigGroup,
  srcDir: string
): void {
  const routeFileDir = nodePath.dirname(sourceFile.getFilePath())

  for (const name of [group.baseName, group.prodName]) {
    const exportName = group.exportNames[name]
    const absoluteConfigPath = nodePath.join(srcDir, name)
    const rel = nodePath
      .relative(routeFileDir, absoluteConfigPath)
      .replace(/\\/g, '/')
    const moduleSpecifier = rel.startsWith('.') ? rel : `./${rel}`

    const alreadyImported = sourceFile
      .getImportDeclarations()
      .some(
        (d) =>
          d.getModuleSpecifierValue() === moduleSpecifier ||
          d.getNamedImports().some((ni) => ni.getName() === exportName)
      )

    if (!alreadyImported) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: [exportName]
      })
    }
  }
}

/**
 * Processes all TypeScript source files for route handler replacements.
 * Returns the total number of handlers replaced.
 */
function updateRouteHandlers(
  sourceFiles: SourceFile[],
  group: ConfigGroup,
  srcDir: string,
  relCwd: (fp: string) => string
): number {
  const baseExport = group.exportNames[group.baseName]
  const prodExport = group.exportNames[group.prodName]

  // The new handler body — note the escaped template literal so that the
  // output file contains a real template literal, not an interpolation here.
  const newHandlerText = `async (request, h) => {
  const config =
    process.env.NODE_ENV === 'production' ? ${prodExport} : ${baseExport}
  return h
    .response(\`window.config = \${JSON.stringify(config)}\`)
    .type('application/javascript')
}`

  let replacedCount = 0

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()

    const candidates = sourceFile.getDescendantsOfKind(
      SyntaxKind.ObjectLiteralExpression
    )

    for (const obj of candidates) {
      if (!isRouteConfig(obj)) continue
      if (getRoutePath(obj) !== group.routePath) continue

      const handlerProp = findHandlerProperty(obj)
      if (!handlerProp) {
        console.warn(
          `  [${relCwd(filePath)}] Found route '${group.routePath}' but could not locate handler property — skipping`
        )
        continue
      }

      handlerProp.setInitializer(newHandlerText)
      ensureConfigImports(sourceFile, group, srcDir)
      replacedCount++

      console.log(
        `  [${relCwd(filePath)}] Replaced handler for route '${group.routePath}'`
      )
    }
  }

  return replacedCount
}

// ─── Phase 3 helper ──────────────────────────────────────────────────────────

/**
 * Resolves a chain of property accesses on an ObjectLiteralExpression.
 * E.g. given path ['BIRTH', 'LATE_REGISTRATION_TARGET'] and an object
 * `{ BIRTH: { LATE_REGISTRATION_TARGET: 45 } }`, returns the text '45'.
 * Returns null if any segment of the path cannot be resolved.
 */
function resolveConfigChain(
  configObj: ObjectLiteralExpression,
  path: string[]
): string | null {
  let current: Node = configObj
  for (const key of path) {
    if (!Node.isObjectLiteralExpression(current)) return null
    const prop = current.getProperty(key)
    if (!prop || !Node.isPropertyAssignment(prop)) return null
    const initNode = (prop as PropertyAssignment).getInitializer()
    if (!initNode) return null
    current = initNode
  }
  return current.getText()
}

/**
 * When inlining a value from `application-config.ts` into a file in a
 * different directory, `__dirname`-based paths (e.g. for reading image
 * assets) must be adjusted so they continue to resolve to the original
 * location — the referenced files themselves are NOT moved.
 *
 * Rewrites `join(__dirname, ...)` / `path.join(__dirname, ...)` /
 * `resolve(__dirname, ...)` / `path.resolve(__dirname, ...)` by inserting
 * the relative path from the target directory back to the source directory
 * as an extra leading argument.
 *
 * Example: inlining from `src/api/application/` into `src/login-config.ts`
 *   join(__dirname, 'login-bg.jpg')
 *     → join(__dirname, 'api/application', 'login-bg.jpg')
 */
function rewriteDirnameRefs(text: string, relDir: string): string {
  if (!relDir || relDir === '.') return text
  const relForward = relDir.replace(/\\/g, '/')
  return text.replace(
    /\b((?:path\.)?(?:join|resolve))\s*\(\s*__dirname\s*,/g,
    `$1(__dirname, '${relForward}',`
  )
}

/**
 * Ensures the source file has a namespace `fs` import (`import * as fs from 'fs'`).
 * No-op if a namespace or default `fs` import is already present.
 */
function ensureFsImport(sf: SourceFile): void {
  const hasFs = sf
    .getImportDeclarations()
    .some(
      (d) =>
        d.getModuleSpecifierValue() === 'fs' &&
        (d.getNamespaceImport() || d.getDefaultImport())
    )
  if (hasFs) return
  sf.addImportDeclaration({
    moduleSpecifier: 'fs',
    namespaceImport: 'fs'
  })
}

/**
 * Ensures the source file has a named `join` import from 'path'.
 * Merges into an existing 'path' import if present, otherwise adds a new
 * `import { join } from 'path'` declaration.
 */
function ensureJoinImport(sf: SourceFile): void {
  const pathImports = sf
    .getImportDeclarations()
    .filter((d) => d.getModuleSpecifierValue() === 'path')

  if (
    pathImports.some((d) =>
      d.getNamedImports().some((ni) => ni.getName() === 'join')
    )
  ) {
    return
  }

  if (pathImports.length > 0) {
    pathImports[0].addNamedImport('join')
    return
  }

  sf.addImportDeclaration({
    moduleSpecifier: 'path',
    namedImports: ['join']
  })
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function main() {
  const srcDir = nodePath.join(getCwd(), 'src')
  const relCwd = (fp: string) => nodePath.relative(getCwd(), fp)

  // ── Phase 1: Convert JS config files to TypeScript ────────────────────────
  console.log('Phase 1: Converting JS config files to TypeScript...\n')

  let convertedCount = 0

  for (const group of CONFIG_GROUPS) {
    for (const name of [group.baseName, group.prodName]) {
      if (convertFile(name, group, srcDir)) {
        convertedCount++
      }
    }
  }

  if (convertedCount === 0) {
    console.log('  No JS config files needed conversion.\n')
  } else {
    console.log(`\n  Converted ${convertedCount} file(s).\n`)
  }

  // ── Phase 3: Wrap applicationConfig with defineApplicationConfig ──────────
  console.log(
    'Phase 3: Wrapping applicationConfig with defineApplicationConfig...\n'
  )

  const appConfigRelPath = 'api/application/application-config.ts'
  const appConfigAbsPath = nodePath.join(srcDir, appConfigRelPath)

  if (!fs.existsSync(appConfigAbsPath)) {
    console.log(`  Skipping Phase 3 — ${appConfigRelPath} not found in src/\n`)
  } else {
    const appConfigProject = new Project({
      tsConfigFilePath: nodePath.resolve(srcDir, '../tsconfig.json'),
      skipAddingFilesFromTsConfig: false
    })

    const appConfigFile =
      appConfigProject.getSourceFile(appConfigAbsPath) ??
      appConfigProject.addSourceFileAtPath(appConfigAbsPath)

    let wrapped = false

    for (const varDecl of appConfigFile.getVariableDeclarations()) {
      if (varDecl.getName() !== 'applicationConfig') continue

      const init = varDecl.getInitializer()
      if (!init || !Node.isObjectLiteralExpression(init)) continue

      // Remove properties not defined in the ApplicationConfig schema
      const propsToRemove = init.getProperties().filter((prop) => {
        if (!Node.isPropertyAssignment(prop)) return false
        const name = prop
          .getNameNode()
          .getText()
          .replace(/^['"]|['"]$/g, '')
        return !APPLICATION_CONFIG_VALID_KEYS.has(name)
      })

      if (propsToRemove.length > 0) {
        // Before removing, inline every cross-file reference to each unknown key.
        // Example: applicationConfig.BIRTH.LATE_REGISTRATION_TARGET  →  45
        const filesToSaveAfterInlining = new Set<SourceFile>()
        const appConfigDir = nodePath.dirname(appConfigAbsPath)

        for (const removedProp of propsToRemove) {
          const key = (removedProp as PropertyAssignment).getName()

          for (const sf of appConfigProject.getSourceFiles()) {
            // Skip the config file itself, files outside src/, and node_modules
            if (sf.getFilePath() === appConfigAbsPath) continue
            if (!sf.getFilePath().includes('/src/')) continue
            if (sf.getFilePath().includes('/node_modules/')) continue

            // Relative path from the target file's directory back to the
            // applicationConfig's directory. Used to adjust `__dirname`-based
            // paths in the inlined value (e.g. image asset references) since
            // those assets are not moved.
            const targetDir = nodePath.dirname(sf.getFilePath())
            const relDirFromTarget = nodePath.relative(targetDir, appConfigDir)

            // Break-and-restart after each replacement because replaceWithText()
            // invalidates existing node references in the ts-morph tree
            let madeReplacement = true
            while (madeReplacement) {
              madeReplacement = false
              for (const identNode of sf.getDescendantsOfKind(
                SyntaxKind.Identifier
              )) {
                if (identNode.getText() !== 'applicationConfig') continue

                // Walk up the property-access chain from this identifier
                let node: Node = identNode
                const accessPath: string[] = []

                while (true) {
                  const parent = node.getParent()
                  if (!Node.isPropertyAccessExpression(parent)) break
                  if (parent.getExpression() !== node) break
                  accessPath.push(parent.getName())
                  node = parent
                }

                if (accessPath.length === 0 || accessPath[0] !== key) continue

                const resolvedValue = resolveConfigChain(init, accessPath)
                if (resolvedValue === null) {
                  console.log(
                    `  Cannot resolve applicationConfig.${accessPath.join('.')} — skipping inline replacement`
                  )
                  continue
                }

                const adjustedValue = rewriteDirnameRefs(
                  resolvedValue,
                  relDirFromTarget
                )

                node.replaceWithText(adjustedValue)

                // If the inlined value references `fs` or `join`, ensure the
                // target file has the corresponding imports — these are
                // commonly used to read image assets from disk.
                if (/\bfs\s*\./.test(adjustedValue)) {
                  ensureFsImport(sf)
                }
                if (/\bjoin\s*\(/.test(adjustedValue)) {
                  ensureJoinImport(sf)
                }

                console.log(
                  `  Inlined applicationConfig.${accessPath.join('.')} → ${adjustedValue} in ${nodePath.relative(getCwd(), sf.getFilePath())}`
                )
                filesToSaveAfterInlining.add(sf)
                madeReplacement = true
                break // restart — tree has changed
              }
            }
          }
        }

        // Persist files that received inline replacements
        for (const sf of Array.from(filesToSaveAfterInlining)) {
          await sf.save()
          console.log(
            `  Saved (inlined): ${nodePath.relative(getCwd(), sf.getFilePath())}`
          )
        }

        // Remove in reverse order to avoid index shifting
        for (const prop of [...propsToRemove].reverse()) {
          const propName = (prop as PropertyAssignment).getName()
          console.log(
            `  Removing unknown key '${propName}' from applicationConfig (not in ApplicationConfig schema)`
          )
          prop.remove()
        }
      }

      // Wrap the plain object literal with defineApplicationConfig(...)
      varDecl.setInitializer(`defineApplicationConfig(${init.getText()})`)

      // Upsert the defineApplicationConfig named import
      const TOOLKIT_MODULE = '@opencrvs/toolkit/application-config'
      const existing = appConfigFile.getImportDeclaration(
        (d) => d.getModuleSpecifierValue() === TOOLKIT_MODULE
      )
      if (existing) {
        const names = new Set(
          existing.getNamedImports().map((ni) => ni.getName())
        )
        if (!names.has('defineApplicationConfig')) {
          existing.addNamedImport('defineApplicationConfig')
        }
      } else {
        appConfigFile.addImportDeclaration({
          moduleSpecifier: TOOLKIT_MODULE,
          namedImports: ['defineApplicationConfig']
        })
      }

      wrapped = true
      console.log(
        `  Wrapped applicationConfig with defineApplicationConfig in ${appConfigRelPath}`
      )
      break
    }

    if (!wrapped) {
      console.log(
        `  Skipping Phase 3 — applicationConfig plain object not found (already wrapped?)\n`
      )
    } else {
      await appConfigFile.save()
      console.log(`  Saved: ${appConfigRelPath}\n`)
    }
  }

  // ── Phase 2: Update Hapi route handlers ───────────────────────────────────
  console.log('Phase 2: Updating Hapi route handlers...\n')

  const project = new Project({
    tsConfigFilePath: nodePath.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`  Analysing ${sourceFiles.length} source file(s).\n`)

  let totalReplaced = 0

  for (const group of CONFIG_GROUPS) {
    totalReplaced += updateRouteHandlers(sourceFiles, group, srcDir, relCwd)
  }

  if (totalReplaced === 0) {
    console.log('  No route handlers matched — nothing to update in Phase 2.\n')
  }

  // ── Save modified TS files ────────────────────────────────────────────────
  const modified = sourceFiles.filter((sf) => sf.wasForgotten() === false)
  const toSave = modified.filter(
    (sf) =>
      sf.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression).length > 0
  )

  // Only save files that actually had route handler changes
  let savedCount = 0
  for (const sf of project.getSourceFiles()) {
    if (sf.isSaved()) continue
    await sf.save()
    console.log(`  Saved: ${relCwd(sf.getFilePath())}`)
    savedCount++
  }

  if (savedCount === 0 && totalReplaced === 0) {
    console.log('Nothing was changed.')
    return
  }

  console.log(
    `\nDone. Converted ${convertedCount} config file(s), replaced ${totalReplaced} route handler(s).`
  )
}
