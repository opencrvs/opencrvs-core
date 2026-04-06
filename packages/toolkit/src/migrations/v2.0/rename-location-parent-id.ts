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
 * Codemod: Rename `parentId` to `administrativeAreaId` on `Location` typed expressions.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/rename-location-parent-id.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every property access expression whose property name is `parentId`
 *   - Uses the TypeScript type checker to resolve the type of the object being accessed
 *   - Only renames to `administrativeAreaId` when the type (or any union constituent) is
 *     the OpenCRVS `Location` type, identified via three strategies in order:
 *       1. Alias symbol name equals 'Location' (works when TypeScript preserves alias info)
 *       2. Direct symbol name equals 'Location'
 *       3. Structural fallback: the type is an object with the property set that uniquely
 *          identifies the OpenCRVS Location shape (id, name, externalId, locationType, and
 *          either administrativeAreaId or parentId)
 *   - Skips `parentId` accesses on any other type (e.g. plain objects, other interfaces)
 *   - Saves the modified files in-place
 */

import { Project, SyntaxKind, Node, Type } from 'ts-morph'
import path from 'path'

const OLD_PROPERTY_NAME = 'parentId'
const NEW_PROPERTY_NAME = 'administrativeAreaId'
const LOCATION_TYPE_NAME = 'Location'

// Properties that together uniquely identify the OpenCRVS Location type.
// Used as a structural fallback when TypeScript loses the alias name through
// re-export chains (e.g. z.infer<…> re-exported via @opencrvs/toolkit/events).
const LOCATION_STRUCTURAL_PROPS = [
  'id',
  'name',
  'externalId',
  'locationType'
] as const
// At least one of these must also be present (old name or new name)
const LOCATION_AREA_ID_PROPS = ['administrativeAreaId', 'parentId'] as const

// ─── Type helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true if a single (non-union) type resolves to the OpenCRVS Location type.
 *
 * Three strategies are tried in order so that the check remains robust across
 * different TypeScript/ts-morph resolution paths:
 *
 *  1. Alias symbol name — works when TypeScript preserves the `type Location =
 *     z.infer<typeof Location>` alias through the re-export chain.
 *  2. Direct symbol name — works when the type is represented by a named interface
 *     or class rather than an alias.
 *  3. Structural match — fallback for when both symbol lookups fail (e.g. the
 *     alias is lost because the type was re-exported through a barrel or because
 *     z.infer<…> fully unwraps the alias). Checks for the combination of
 *     properties that uniquely identify the OpenCRVS Location shape.
 */
function isSingleLocationType(t: Type): boolean {
  // Strategy 1: alias symbol (zod-inferred type aliases surface here)
  if (t.getAliasSymbol()?.getName() === LOCATION_TYPE_NAME) return true

  // Strategy 2: direct symbol (plain interface / class)
  if (t.getSymbol()?.getName() === LOCATION_TYPE_NAME) return true

  // Strategy 3: structural fallback
  if (t.isObject()) {
    const propNames = new Set(t.getProperties().map((p) => p.getName()))
    const hasCorePropNames = LOCATION_STRUCTURAL_PROPS.every((p) =>
      propNames.has(p)
    )
    const hasAreaIdProp = LOCATION_AREA_ID_PROPS.some((p) => propNames.has(p))
    if (hasCorePropNames && hasAreaIdProp) return true
  }

  return false
}

/**
 * Returns true when the type of `node` is (or has a union constituent that is)
 * the OpenCRVS Location type.
 * Handles:
 *   - `Location`
 *   - `Location | undefined`  (optional / nullable)
 *   - `Location | null | undefined`
 */
function isLocationType(node: Node): boolean {
  let type: Type
  try {
    type = node.getType()
  } catch {
    // getType() can throw on malformed/unresolvable nodes — skip them
    return false
  }

  if (isSingleLocationType(type)) return true

  // Walk union constituents (Location | undefined, Location | null, …)
  for (const constituent of type.getUnionTypes()) {
    if (isSingleLocationType(constituent)) return true
  }

  return false
}

// ─── File processor ──────────────────────────────────────────────────────────

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let renamedCount = 0

  // Collect all matching nodes first to avoid mutating the tree while iterating
  const candidates = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((propAccess) => propAccess.getName() === OLD_PROPERTY_NAME)

  for (const propAccess of candidates) {
    const obj = propAccess.getExpression()

    if (!isLocationType(obj)) continue

    // Rename only the identifier node (the part after the dot) to preserve
    // surrounding whitespace and optional-chain tokens (?.)
    propAccess.getNameNode().replaceWithText(NEW_PROPERTY_NAME)
    renamedCount++

    console.log(
      `  [${path.relative(process.cwd(), filePath)}] Renamed Location.${OLD_PROPERTY_NAME} → Location.${NEW_PROPERTY_NAME}`
    )
  }

  return renamedCount
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(
    `Scanning for Location.${OLD_PROPERTY_NAME} references in: ${srcDir}\n`
  )

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalRenamed = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const renamed = processFile(filePath, project)

    if (renamed > 0) {
      totalRenamed += renamed
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      `No Location.${OLD_PROPERTY_NAME} references found. Nothing to do.`
    )
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const filePath of modifiedFiles) {
    const sourceFile = project.getSourceFileOrThrow(filePath)
    await sourceFile.save()
    console.log(`  Saved: ${path.relative(process.cwd(), filePath)}`)
  }

  console.log(
    `\nDone. Renamed ${totalRenamed} Location.${OLD_PROPERTY_NAME} reference(s) to Location.${NEW_PROPERTY_NAME}.`
  )
}

export { main }
