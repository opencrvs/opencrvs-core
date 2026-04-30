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
 * Codemod: Remove environment variables that are no longer consumed by
 * country config code in v2.0.
 *
 * Targets:
 *   - APPLICATION_CONFIG_URL
 *   - FHIR_URL
 *   - CONFIRM_REGISTRATION_URL
 *
 * What it does:
 *   1. In `src/environment.ts`, removes the matching properties from the
 *      `cleanEnv(process.env, { ... })` schema object.
 *   2. In `src/constants.ts`, removes the matching top-level `const`
 *      declarations — by name OR by `env.<NAME>` reference (so that
 *      country forks that renamed the constant but still read the same env
 *      var are also cleaned up).
 *
 * Caveats:
 *   - Removing these constants may produce TypeScript errors at usage
 *     sites elsewhere in `src/` (e.g. files that imported `FHIR_URL` from
 *     `@countryconfig/constants`). Those usages are intentionally left
 *     for the developer to resolve, since the right replacement is
 *     country-specific.
 *   - The codemod is a no-op when the target files or properties don't
 *     exist (e.g. the country config has already removed them).
 */

import path from 'path'
import { Node, Project, SyntaxKind } from 'ts-morph'

const UNUSED_ENV_VARS = new Set([
  'APPLICATION_CONFIG_URL',
  'FHIR_URL',
  'CONFIRM_REGISTRATION_URL'
])

const ENVIRONMENT_FILE_RELATIVE = 'src/environment.ts'
const CONSTANTS_FILE_RELATIVE = 'src/constants.ts'

/**
 * Strip matching properties from the `cleanEnv(process.env, { ... })` call
 * in `src/environment.ts`. Returns the names that were removed.
 */
function cleanEnvironmentFile(project: Project, filePath: string): string[] {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return []

  const removed: string[] = []

  // IMPORTANT: never iterate all call expressions while mutating this object.
  // Removing a property deletes nested `url(...)` nodes, and touching those
  // forgotten nodes later causes `InvalidOperationError`.
  const cleanEnvCall = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).find((call) => {
    const expr = call.getExpression()
    return Node.isIdentifier(expr) && expr.getText() === 'cleanEnv'
  })
  if (!cleanEnvCall) return removed

  const schemaArg = cleanEnvCall
    .getArguments()[1]
    ?.asKind(SyntaxKind.ObjectLiteralExpression)
  if (!schemaArg) return removed

  // Remove by explicit property-name lookup to avoid iterating over a live
  // node list while mutating the object literal.
  for (const name of UNUSED_ENV_VARS) {
    const prop = schemaArg.getProperty(name)
    if (!prop) continue

    if (
      prop.isKind(SyntaxKind.PropertyAssignment) ||
      prop.isKind(SyntaxKind.ShorthandPropertyAssignment)
    ) {
      prop.remove()
      removed.push(name)
    }
  }

  return removed
}

/**
 * Match `env.<NAME>` in an initializer (allowing surrounding parens / `as`
 * casts that ts-morph emits in `getText()` as e.g. `(env.X as string)`).
 * Returns the env var name if matched, or null.
 */
function extractEnvAccess(initText: string | undefined): string | null {
  if (!initText) return null
  const match = /\benv\.([A-Z][A-Z0-9_]*)\b/.exec(initText)
  return match ? match[1] : null
}

/**
 * Strip top-level `const` declarations in `src/constants.ts` whose name is
 * in `UNUSED_ENV_VARS` OR whose initializer reads `env.<NAME>` for one of
 * those names. Returns the declaration names that were removed.
 */
function cleanConstantsFile(project: Project, filePath: string): string[] {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return []

  const removed: string[] = []

  for (const stmt of [...sourceFile.getVariableStatements()]) {
    const declarations = [...stmt.getDeclarations()]

    const declarationsToRemove = declarations.filter((decl) => {
      const name = decl.getName()
      const accessedEnvVar = extractEnvAccess(decl.getInitializer()?.getText())

      return (
        UNUSED_ENV_VARS.has(name) ||
        (accessedEnvVar !== null && UNUSED_ENV_VARS.has(accessedEnvVar))
      )
    })

    if (declarationsToRemove.length === 0) continue

    // Resolve all names before mutating the AST; once a declaration or its
    // parent statement is removed, ts-morph marks old nodes as forgotten.
    const namesToRemove = declarationsToRemove.map((decl) => decl.getName())
    removed.push(...namesToRemove)

    if (declarationsToRemove.length === declarations.length) {
      // All declarations in this statement are unused → drop the whole line
      // (handles the dominant pattern: `export const X = env.X`).
      stmt.remove()
    } else {
      // Mixed statement (e.g. `const A = env.A, B = somethingElse`) — keep
      // the survivors by removing matching declarators in place.
      for (const decl of declarationsToRemove) {
        decl.remove()
      }
    }
  }

  return removed
}

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  console.log(
    `Removing unused environment variable(s) (${[...UNUSED_ENV_VARS].join(', ')})...\n`
  )

  const envFilePath = path.join(process.cwd(), ENVIRONMENT_FILE_RELATIVE)
  const constsFilePath = path.join(process.cwd(), CONSTANTS_FILE_RELATIVE)

  const envRemoved = cleanEnvironmentFile(project, envFilePath)
  if (envRemoved.length > 0) {
    await project.getSourceFileOrThrow(envFilePath).save()
    console.log(
      `  [${ENVIRONMENT_FILE_RELATIVE}] Removed schema entr${envRemoved.length === 1 ? 'y' : 'ies'}: ${envRemoved.join(', ')}`
    )
  } else if (project.getSourceFile(envFilePath)) {
    console.log(
      `  [${ENVIRONMENT_FILE_RELATIVE}] No matching schema entries — nothing to remove.`
    )
  } else {
    console.log(
      `  [${ENVIRONMENT_FILE_RELATIVE}] File not found — skipping.`
    )
  }

  const constsRemoved = cleanConstantsFile(project, constsFilePath)
  if (constsRemoved.length > 0) {
    await project.getSourceFileOrThrow(constsFilePath).save()
    console.log(
      `  [${CONSTANTS_FILE_RELATIVE}] Removed declaration(s): ${constsRemoved.join(', ')}`
    )
  } else if (project.getSourceFile(constsFilePath)) {
    console.log(
      `  [${CONSTANTS_FILE_RELATIVE}] No matching declarations — nothing to remove.`
    )
  } else {
    console.log(`  [${CONSTANTS_FILE_RELATIVE}] File not found — skipping.`)
  }

  if (envRemoved.length === 0 && constsRemoved.length === 0) {
    console.log('\nNothing to do.')
    return
  }

  console.log(
    `\nDone. NOTE: usages of these constants elsewhere in 'src/' may now produce TypeScript errors and need manual review.`
  )
}

export { main }
