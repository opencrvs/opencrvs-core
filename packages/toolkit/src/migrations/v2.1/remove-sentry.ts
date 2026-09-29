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
 * Codemod: remove the Sentry wiring from a country config.
 *
 * Sentry is gone from OpenCRVS core: nothing reads `SENTRY_DSN` or
 * `window.config.SENTRY` any more, and neither `ClientConfig` nor
 * `LoginConfig` in `@opencrvs/commons` declares a `SENTRY` field. A v2.0
 * country config that still sets it no longer compiles against the v2.1
 * toolkit, so this step drops:
 *   - the `SENTRY` key from `src/client-config.ts`, `src/client-config.prod.ts`,
 *     `src/login-config.ts` and `src/login-config.prod.ts`,
 *   - `SENTRY_DSN` from `src/environment.ts` and `src/constants.ts`,
 *   - the `hapi-sentry` plugin registration and the `onRequest` scope
 *     extension from `src/index.ts`, along with their imports,
 *   - `SENTRY` from `IApplicationConfig` in `src/utils/index.ts`,
 *   - `hapi-sentry` and any `@sentry/*` package from `package.json`, and
 *   - `typings/hapi-sentry.d.ts`, the ambient declaration the untyped plugin
 *     needed.
 *
 * Any `SENTRY_DSN` left in the environment is simply ignored from here on.
 * Anything already absent is left alone, and every step is independent — one
 * that cannot find the structure it edits warns and lets the rest run.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import {
  IndentationText,
  ImportDeclaration,
  Node,
  Project,
  QuoteKind,
  SourceFile,
  SyntaxKind
} from 'ts-morph'

const CONFIG_FILES = [
  'src/client-config.ts',
  'src/client-config.prod.ts',
  'src/login-config.ts',
  'src/login-config.prod.ts'
]
const ENVIRONMENT_FILE = 'src/environment.ts'
const CONSTANTS_FILE = 'src/constants.ts'
const INDEX_FILE = 'src/index.ts'
const UTILS_FILE = 'src/utils/index.ts'
const PACKAGE_JSON_FILE = 'package.json'
const TYPINGS_FILE = 'typings/hapi-sentry.d.ts'

const SENTRY_PLUGIN = 'hapi-sentry'

const skipped: string[] = []

function warnSkipped(message: string) {
  skipped.push(message)
  console.warn(`  ⚠️  ${message}`)
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

/**
 * True when `name` appears in the file outside of import declarations, i.e.
 * when something still uses what was imported under that name.
 */
function isReferenced(sourceFile: SourceFile, name: string) {
  return sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .some(
      (identifier) =>
        identifier.getText() === name &&
        !identifier.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
    )
}

/** Drop an import declaration once nothing it brings in is used any more. */
function removeIfUnused(
  sourceFile: SourceFile,
  importDeclaration: ImportDeclaration
) {
  const names = [
    importDeclaration.getDefaultImport()?.getText(),
    importDeclaration.getNamespaceImport()?.getText(),
    ...importDeclaration.getNamedImports().map((named) => named.getName())
  ].filter((name): name is string => Boolean(name))

  if (
    names.length > 0 &&
    names.every((name) => !isReferenced(sourceFile, name))
  ) {
    importDeclaration.remove()
    return true
  }

  return false
}

/**
 * Remove the named import `name` from the declaration importing
 * `moduleSpecifier`, dropping the whole declaration when nothing is left.
 */
function removeNamedImport(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  name: string
) {
  const importDeclaration = sourceFile
    .getImportDeclarations()
    .find(
      (declaration) => declaration.getModuleSpecifierValue() === moduleSpecifier
    )
  if (!importDeclaration) return false

  const named = importDeclaration
    .getNamedImports()
    .find((namedImport) => namedImport.getName() === name)
  if (!named) return false

  named.remove()

  if (
    importDeclaration.getNamedImports().length === 0 &&
    !importDeclaration.getDefaultImport() &&
    !importDeclaration.getNamespaceImport()
  ) {
    importDeclaration.remove()
  }

  return true
}

// ─── The four config files ───────────────────────────────────────────────────

/**
 * Drop `SENTRY: ...` from `defineClientConfig` / `defineLoginConfig`. The prod
 * login config reads `env.SENTRY_DSN` and has no other use for `env`, so the
 * now-dangling `./environment` import goes with it.
 */
function removeSentryFromConfigs(project: Project, cwd: string) {
  for (const file of CONFIG_FILES) {
    const sourceFile = project.addSourceFileAtPathIfExists(path.join(cwd, file))
    if (!sourceFile) continue

    const property = sourceFile
      .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
      .find((assignment) => assignment.getName() === 'SENTRY')
    if (!property) continue

    // What the value read — `env` for `env.SENTRY_DSN ?? ''`, nothing for a
    // literal. Those are the only imports removing the key can strand.
    const usedNames = new Set(
      property
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .map((identifier) => identifier.getText())
    )

    property.remove()

    for (const importDeclaration of [...sourceFile.getImportDeclarations()]) {
      const imported = [
        importDeclaration.getDefaultImport()?.getText(),
        importDeclaration.getNamespaceImport()?.getText(),
        ...importDeclaration.getNamedImports().map((named) => named.getName())
      ].filter((name): name is string => Boolean(name))

      if (imported.some((name) => usedNames.has(name))) {
        removeIfUnused(sourceFile, importDeclaration)
      }
    }

    console.log(`  ✓ ${file}: SENTRY`)
  }
}

// ─── environment.ts / constants.ts ───────────────────────────────────────────

function removeEnvironmentVariable(project: Project, cwd: string) {
  const sourceFile = project.addSourceFileAtPathIfExists(
    path.join(cwd, ENVIRONMENT_FILE)
  )
  if (!sourceFile) return

  const options = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((call) => call.getExpression().getText() === 'cleanEnv')
    ?.getArguments()[1]

  if (!options || !Node.isObjectLiteralExpression(options)) {
    warnSkipped(
      `Could not find the cleanEnv(...) config object in ${ENVIRONMENT_FILE}; remove SENTRY_DSN by hand`
    )
    return
  }

  const property = options.getProperty('SENTRY_DSN')
  if (!property) return

  property.remove()
  console.log(`  ✓ ${ENVIRONMENT_FILE}: SENTRY_DSN`)
}

/**
 * Drop the constant re-exporting the DSN. Matched by name and by initializer,
 * so a country that renamed `SENTRY_DSN` but still reads `env.SENTRY_DSN` is
 * cleaned up too.
 */
function removeConstant(project: Project, cwd: string) {
  const sourceFile = project.addSourceFileAtPathIfExists(
    path.join(cwd, CONSTANTS_FILE)
  )
  if (!sourceFile) return

  for (const statement of [...sourceFile.getVariableStatements()]) {
    const declarations = statement.getDeclarations()
    const matching = declarations.filter(
      (declaration) =>
        declaration.getName() === 'SENTRY_DSN' ||
        /\benv\.SENTRY_DSN\b/.test(
          declaration.getInitializer()?.getText() ?? ''
        )
    )
    if (matching.length === 0) continue

    const names = matching.map((declaration) => declaration.getName())

    if (matching.length === declarations.length) {
      statement.remove()
    } else {
      for (const declaration of matching) {
        declaration.remove()
      }
    }

    console.log(`  ✓ ${CONSTANTS_FILE}: ${names.join(', ')}`)
  }
}

// ─── index.ts ────────────────────────────────────────────────────────────────

/**
 * Unregister the plugin and the request hook it fed:
 *   - `if (SENTRY_DSN) { plugins.push({ plugin: Sentry, ... }) }`
 *   - `server.ext({ type: 'onRequest', method(request: ... sentryScope ...) })`
 * and then the imports both relied on.
 */
function unwireIndex(project: Project, cwd: string) {
  const sourceFile = project.addSourceFileAtPathIfExists(
    path.join(cwd, INDEX_FILE)
  )
  if (!sourceFile) return

  const pluginImport = sourceFile
    .getImportDeclarations()
    .find(
      (declaration) => declaration.getModuleSpecifierValue() === SENTRY_PLUGIN
    )

  // `import * as Sentry from 'hapi-sentry'` in the template, but the local
  // name is the country's to choose.
  const pluginName =
    pluginImport?.getNamespaceImport()?.getText() ??
    pluginImport?.getDefaultImport()?.getText() ??
    'Sentry'

  const registration = sourceFile
    .getDescendantsOfKind(SyntaxKind.IfStatement)
    .find(
      (statement) =>
        /\bSENTRY_DSN\b/.test(statement.getExpression().getText()) &&
        new RegExp(`\\bplugin:\\s*${pluginName}\\b`).test(statement.getText())
    )

  if (registration) {
    registration.remove()
    console.log(`  ✓ ${INDEX_FILE}: hapi-sentry plugin registration`)
  } else if (sourceFile.getText().includes(SENTRY_PLUGIN)) {
    warnSkipped(
      `Could not find the hapi-sentry plugin registration in ${INDEX_FILE}; remove it by hand`
    )
  }

  const scopeExtension = sourceFile
    .getDescendantsOfKind(SyntaxKind.ExpressionStatement)
    .find(
      (statement) =>
        statement.getText().includes('sentryScope') &&
        statement.getText().startsWith('server.ext')
    )

  if (scopeExtension) {
    scopeExtension.remove()
    console.log(`  ✓ ${INDEX_FILE}: onRequest Sentry scope extension`)
  } else if (sourceFile.getText().includes('sentryScope')) {
    warnSkipped(
      `Found 'sentryScope' in ${INDEX_FILE} outside a server.ext(...) call; remove it by hand`
    )
  }

  if (pluginImport && removeIfUnused(sourceFile, pluginImport)) {
    console.log(`  ✓ ${INDEX_FILE}: import '${SENTRY_PLUGIN}'`)
  }

  // The DSN is imported from the constants module, whose specifier countries
  // write either as a path alias or relatively.
  if (!isReferenced(sourceFile, 'SENTRY_DSN')) {
    for (const declaration of [...sourceFile.getImportDeclarations()]) {
      const specifier = declaration.getModuleSpecifierValue()
      if (removeNamedImport(sourceFile, specifier, 'SENTRY_DSN')) {
        console.log(`  ✓ ${INDEX_FILE}: import SENTRY_DSN from '${specifier}'`)
        break
      }
    }
  }
}

// ─── utils/index.ts ──────────────────────────────────────────────────────────

/** Drop `SENTRY` from the country config's own `IApplicationConfig`. */
function removeApplicationConfigField(project: Project, cwd: string) {
  const sourceFile = project.addSourceFileAtPathIfExists(
    path.join(cwd, UTILS_FILE)
  )
  if (!sourceFile) return

  const property = sourceFile
    .getInterface('IApplicationConfig')
    ?.getProperty('SENTRY')
  if (!property) return

  property.remove()
  console.log(`  ✓ ${UTILS_FILE}: IApplicationConfig.SENTRY`)
}

// ─── package.json ────────────────────────────────────────────────────────────

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

function isSentryPackage(name: string) {
  return name === SENTRY_PLUGIN || name.startsWith('@sentry/')
}

function removeDependencies(cwd: string) {
  const packageJsonPath = path.join(cwd, PACKAGE_JSON_FILE)
  if (!existsSync(packageJsonPath)) return

  const raw = readFileSync(packageJsonPath, 'utf8')

  let parsed: PackageJson
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    warnSkipped(
      `${PACKAGE_JSON_FILE} could not be parsed (${(error as Error).message}); remove the Sentry dependencies by hand`
    )
    return
  }

  const removed: string[] = []

  for (const bucket of ['dependencies', 'devDependencies'] as const) {
    const dependencies = parsed[bucket]
    if (!dependencies) continue

    for (const name of Object.keys(dependencies)) {
      if (isSentryPackage(name)) {
        delete dependencies[name]
        removed.push(name)
      }
    }
  }

  if (removed.length === 0) return

  // Keep the file's trailing newline, if it had one.
  const trailingNewline = raw.endsWith('\n') ? '\n' : ''
  writeFileSync(
    packageJsonPath,
    `${JSON.stringify(parsed, null, 2)}${trailingNewline}`
  )
  console.log(`  ✓ ${PACKAGE_JSON_FILE}: ${removed.join(', ')}`)
}

// ─── typings/hapi-sentry.d.ts ────────────────────────────────────────────────

/**
 * `hapi-sentry` ships no types, so country configs declare the module
 * themselves. Delete that declaration — but only when it is all the file says,
 * in case a country has folded other ambient declarations into it.
 */
function removeTypings(cwd: string) {
  const typingsPath = path.join(cwd, TYPINGS_FILE)
  if (!existsSync(typingsPath)) return

  const declarations = readFileSync(typingsPath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .trim()

  if (!/^declare module ['"]hapi-sentry['"];?$/.test(declarations)) {
    warnSkipped(
      `${TYPINGS_FILE} declares more than the 'hapi-sentry' module; remove the declaration by hand`
    )
    return
  }

  rmSync(typingsPath)
  console.log(`  ✓ ${TYPINGS_FILE}: deleted`)
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const cwd = process.cwd()

  console.log('\nRemoving Sentry...\n')

  const project = new Project({
    // ts-morph indents with four spaces and double-quotes strings by default,
    // both of which the country config's prettier run would undo.
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single
    }
  })

  removeSentryFromConfigs(project, cwd)
  removeEnvironmentVariable(project, cwd)
  removeConstant(project, cwd)
  unwireIndex(project, cwd)
  removeApplicationConfigField(project, cwd)

  await project.save()

  removeDependencies(cwd)
  removeTypings(cwd)

  if (skipped.length > 0) {
    console.warn(
      `\n⚠️  ${skipped.length} Sentry removal step(s) were skipped. Handle the following by hand:`
    )
    for (const message of skipped) {
      console.warn(`  - ${message}`)
    }
  }
}

export { main }
