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
 * Codemod: Add `analytics: true` option to event configs.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/add-analytics-option-to-event-configs.ts
 *
 * What it does:
 *   1. Scans the country config `src/` directory for `defineConfig({...})` calls.
 *   2. For every event config that does not yet declare an `analytics` property,
 *      inserts `analytics: true` into the config object literal.
 *   3. Saves the modified files in-place.
 *
 *   Event configs that already declare `analytics` are left untouched so this
 *   codemod is safe to re-run.
 */

import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

const DEFINE_CONFIG_NAME = 'defineConfig'
const ID_PROPERTY_NAME = 'id'
const ANALYTICS_PROPERTY_NAME = 'analytics'

// ─── AST helpers ─────────────────────────────────────────────────────────────

/**
 * Returns a human-readable label for an event config, derived from its `id`
 * property. Used only for log output. Falls back to `<unknown event>` when the
 * id can't be statically resolved.
 */
function getEventLabel(configArg: ObjectLiteralExpression): string {
  const idProp = configArg.getProperty(ID_PROPERTY_NAME)
  if (!idProp || !Node.isPropertyAssignment(idProp)) return '<unknown event>'

  const initializer = idProp.getInitializer()
  if (!initializer) return '<unknown event>'

  if (Node.isStringLiteral(initializer)) {
    return initializer.getLiteralValue()
  }

  // Handles `Event.Birth`, `EventType.BIRTH`, etc.
  return initializer.getText()
}

function hasAnalyticsProperty(configArg: ObjectLiteralExpression): boolean {
  return configArg.getProperty(ANALYTICS_PROPERTY_NAME) !== undefined
}

// ─── File processor ──────────────────────────────────────────────────────────

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  const relPath = path.relative(getCwd(), filePath)
  let changes = 0

  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )

  for (const call of callExpressions) {
    const expression = call.getExpression()
    if (!Node.isIdentifier(expression)) continue
    if (expression.getText() !== DEFINE_CONFIG_NAME) continue

    const args = call.getArguments()
    if (args.length === 0) continue

    const configArg = args[0]
    if (!Node.isObjectLiteralExpression(configArg)) continue

    const eventLabel = getEventLabel(configArg)

    if (hasAnalyticsProperty(configArg)) {
      console.log(
        `  [${relPath}] Skipped '${eventLabel}' — 'analytics' already declared.`
      )
      continue
    }

    configArg.addPropertyAssignment({
      name: ANALYTICS_PROPERTY_NAME,
      initializer: 'true'
    })

    console.log(`  [${relPath}] Added 'analytics: true' to '${eventLabel}'.`)
    changes++
  }

  return changes
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const srcDir = path.join(getCwd(), 'src')
  console.log(`Scanning for defineConfig calls in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalChanges = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const changes = processFile(filePath, project)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log('No event configs needed updating. Nothing to do.')
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const filePath of modifiedFiles) {
    const sourceFile = project.getSourceFileOrThrow(filePath)
    await sourceFile.save()
    console.log(`  Saved: ${path.relative(getCwd(), filePath)}`)
  }

  console.log(
    `\nDone. Added 'analytics: true' to ${totalChanges} event config(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
