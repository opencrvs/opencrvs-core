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
 * Codemod: Replace usages of the legacy `APPLICATION_CONFIG_URL` env-derived
 * constant with direct usage of the v2.0 `applicationConfig` object.
 *
 * Background:
 *   In v1.9 country configs read application configuration over HTTP from
 *   the config service via `APPLICATION_CONFIG_URL`. In v2.0 the config is
 *   defined statically in `src/api/application/application-config.ts` (as
 *   `applicationConfig`) and consumed by import.
 *
 * What it does (per source file under `src/`):
 *   1. If the file imports `APPLICATION_CONFIG_URL` (from any module), the
 *      named import is removed; if that leaves the import declaration empty,
 *      the whole declaration is removed.
 *   2. An import of `applicationConfig` from
 *      `@countryconfig/api/application/application-config` is added
 *      (idempotent — re-uses an existing import declaration if one exists).
 *   3. Block-bodied functions whose body references *both*
 *      `APPLICATION_CONFIG_URL` *and* a `fetch(...)` call are recognised
 *      as "config-fetcher" functions. Their entire body is replaced with
 *      `return applicationConfig` — eliminating the URL construction,
 *      `fetch`, JSON parsing, and unwrapping of `.config`. Callers
 *      (`await getApplicationConfig()` etc.) keep working because async
 *      functions still wrap the return value in a `Promise`.
 *   4. Any remaining bare identifier references to `APPLICATION_CONFIG_URL`
 *      are renamed to `applicationConfig`. Property names (e.g.
 *      `obj.APPLICATION_CONFIG_URL` or `{ APPLICATION_CONFIG_URL: x }`)
 *      are left alone.
 *
 * Caveats:
 *   - Wholesale body replacement of config-fetcher functions destroys any
 *     custom logic the country had inlined there (error handling, derived
 *     fields, etc.). Each rewrite is logged so the developer can review
 *     the diff and re-apply customisations on top of `applicationConfig`.
 *   - The shape of v2.0 `applicationConfig` is not identical to the v1.9
 *     `IApplicationConfigResponse.config` — callers that destructured
 *     v1.9-only fields will produce TypeScript errors and need manual
 *     review.
 *   - Files that have a local declaration named `applicationConfig` are
 *     skipped to avoid a name collision; a warning is logged so the
 *     developer can resolve it manually.
 *   - Files that reference `APPLICATION_CONFIG_URL` *without* importing it
 *     (e.g. as a local variable) are skipped — we only rewrite imported
 *     usages.
 *   - Concise-body arrow functions (`() => fetch(...)`) are not
 *     body-rewritten — only their identifier is renamed in step 4. If a
 *     country happens to inline the fetch in concise form, the result
 *     will need manual cleanup.
 */

import path from 'path'
import { Node, Project, SourceFile, SyntaxKind } from 'ts-morph'

const TARGET_IDENTIFIER = 'APPLICATION_CONFIG_URL'
const REPLACEMENT_IDENTIFIER = 'applicationConfig'
const REPLACEMENT_MODULE = '@countryconfig/api/application/application-config'

interface FunctionRewrite {
  /** Best-effort name to display in logs (`getApplicationConfig`, `<anonymous>`, etc.). */
  name: string
  /** 1-based line in the source file where the function starts. */
  line: number
}

interface FileResult {
  changed: boolean
  rewrittenFunctions: FunctionRewrite[]
  renamedReferences: number
  skippedReason?: string
}

/**
 * Function-like syntax kinds whose `body` we know how to replace via
 * `setBodyText` (i.e. block-bodied callables).
 */
const FUNCTION_LIKE_KINDS = [
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.FunctionExpression,
  SyntaxKind.ArrowFunction,
  SyntaxKind.MethodDeclaration
] as const

/**
 * Returns the name of the function-like node for logging purposes.
 * Falls back to `<anonymous>` when nothing useful can be derived.
 */
function describeFunction(node: Node): string {
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
    return node.getName() ?? '<anonymous>'
  }

  // FunctionExpression / ArrowFunction: try to pick up the assignment target.
  const parent = node.getParent()
  if (parent && Node.isVariableDeclaration(parent)) {
    return parent.getName()
  }
  if (parent && Node.isPropertyAssignment(parent)) {
    return parent.getName()
  }
  if (
    Node.isFunctionExpression(node) &&
    node.getNameNode() !== undefined
  ) {
    return node.getNameNode()?.getText() ?? '<anonymous>'
  }

  return '<anonymous>'
}

/**
 * True when the node has a block body that we can safely replace via
 * `setBodyText` (excludes concise-body arrow functions like `() => 1`).
 */
function hasBlockBody(node: Node): boolean {
  if (
    Node.isFunctionDeclaration(node) ||
    Node.isFunctionExpression(node) ||
    Node.isMethodDeclaration(node)
  ) {
    return node.getBody() !== undefined
  }
  if (Node.isArrowFunction(node)) {
    return node.getBody().getKind() === SyntaxKind.Block
  }
  return false
}

/**
 * True when the node's body references `APPLICATION_CONFIG_URL` AND
 * contains at least one `fetch(...)` call — the "config-fetcher" signature.
 */
function isConfigFetcher(node: Node): boolean {
  let referencesTarget = false
  let callsFetch = false

  for (const id of node.getDescendantsOfKind(SyntaxKind.Identifier)) {
    const text = id.getText()
    if (!referencesTarget && text === TARGET_IDENTIFIER) referencesTarget = true
    if (!callsFetch && text === 'fetch') {
      // Only count `fetch(` calls, not bare references like
      // `const f = fetch` (rare, but pedantic).
      const parent = id.getParent()
      if (
        Node.isCallExpression(parent) &&
        parent.getExpression() === id
      ) {
        callsFetch = true
      }
    }
    if (referencesTarget && callsFetch) return true
  }

  return false
}

function processFile(sourceFile: SourceFile): FileResult {
  const importsWithTarget = sourceFile
    .getImportDeclarations()
    .filter((decl) =>
      decl.getNamedImports().some((ni) => ni.getName() === TARGET_IDENTIFIER)
    )

  if (importsWithTarget.length === 0) {
    return { changed: false, rewrittenFunctions: [], renamedReferences: 0 }
  }

  // Bail out if a same-named local would collide with the new identifier.
  // Imported `applicationConfig` doesn't count as a local declaration.
  const collidingLocals = sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((id) => id.getText() === REPLACEMENT_IDENTIFIER)
    .filter((id) => {
      const parent = id.getParent()
      const kind = parent.getKind()
      return (
        kind === SyntaxKind.VariableDeclaration ||
        kind === SyntaxKind.FunctionDeclaration ||
        kind === SyntaxKind.ClassDeclaration ||
        kind === SyntaxKind.Parameter
      )
    })

  if (collidingLocals.length > 0) {
    return {
      changed: false,
      rewrittenFunctions: [],
      renamedReferences: 0,
      skippedReason: `local declaration named '${REPLACEMENT_IDENTIFIER}' would collide`
    }
  }

  // ─── 1. Rewrite "config-fetcher" function bodies ───────────────────────
  // We only replace block-bodied functions that reference both
  // APPLICATION_CONFIG_URL and `fetch(...)`. The bodies are replaced with
  // `return applicationConfig`, which works for both sync and async
  // functions (the latter automatically wraps the value in a Promise).
  const candidateFunctions = FUNCTION_LIKE_KINDS.flatMap((kind) =>
    sourceFile.getDescendantsOfKind(kind)
  )

  // Outermost-first: when functions are nested, rewriting the outer one
  // also discards the inner one, so we shouldn't try to rewrite the inner
  // afterwards. Sorting by start position handles this; we additionally
  // filter out any candidate whose ancestor we already rewrote.
  candidateFunctions.sort((a, b) => a.getStart() - b.getStart())

  const rewrittenFunctions: FunctionRewrite[] = []
  const rewrittenSet = new Set<Node>()

  for (const fn of candidateFunctions) {
    if (!hasBlockBody(fn)) continue
    if (!isConfigFetcher(fn)) continue

    // Skip if any ancestor was already rewritten (its descendants are now
    // detached from the source file).
    let inRewrittenAncestor = false
    let cursor: Node | undefined = fn.getParent()
    while (cursor) {
      if (rewrittenSet.has(cursor)) {
        inRewrittenAncestor = true
        break
      }
      cursor = cursor.getParent()
    }
    if (inRewrittenAncestor) continue

    const start = fn.getStart()
    const line = sourceFile.getLineAndColumnAtPos(start).line
    const name = describeFunction(fn)

    if (
      Node.isFunctionDeclaration(fn) ||
      Node.isFunctionExpression(fn) ||
      Node.isMethodDeclaration(fn) ||
      Node.isArrowFunction(fn)
    ) {
      fn.setBodyText(`return ${REPLACEMENT_IDENTIFIER}`)
    }

    rewrittenFunctions.push({ name, line })
    rewrittenSet.add(fn)
  }

  // ─── 2. Remove the `APPLICATION_CONFIG_URL` import ─────────────────────
  for (const decl of importsWithTarget) {
    const targetNamed = decl
      .getNamedImports()
      .find((ni) => ni.getName() === TARGET_IDENTIFIER)
    targetNamed?.remove()

    const isNowEmpty =
      decl.getNamedImports().length === 0 &&
      !decl.getDefaultImport() &&
      !decl.getNamespaceImport()
    if (isNowEmpty) decl.remove()
  }

  // ─── 3. Add the new `applicationConfig` import ─────────────────────────
  const existing = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === REPLACEMENT_MODULE
  )
  if (existing) {
    const alreadyImported = existing
      .getNamedImports()
      .some((ni) => ni.getName() === REPLACEMENT_IDENTIFIER)
    if (!alreadyImported) existing.addNamedImport(REPLACEMENT_IDENTIFIER)
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: REPLACEMENT_MODULE,
      namedImports: [REPLACEMENT_IDENTIFIER]
    })
  }

  // ─── 4. Rename remaining identifier references ─────────────────────────
  // Anything still named APPLICATION_CONFIG_URL after the function-body
  // rewrites and import cleanup is a stray reference; rename it. Iterate
  // from highest position to lowest so `replaceWithText` doesn't shift
  // offsets for nodes we haven't visited yet.
  const renameTargets = sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((id) => id.getText() === TARGET_IDENTIFIER)
    .filter((id) => !id.getFirstAncestorByKind(SyntaxKind.ImportDeclaration))
    .filter((id) => {
      const parent = id.getParent()
      const parentKind = parent.getKind()

      if (parentKind === SyntaxKind.PropertyAccessExpression) {
        const pae = parent.asKind(SyntaxKind.PropertyAccessExpression)!
        // Right-hand side of `x.APPLICATION_CONFIG_URL` — leave alone.
        if (pae.getNameNode() === id) return false
      }
      if (parentKind === SyntaxKind.PropertyAssignment) {
        const pa = parent.asKind(SyntaxKind.PropertyAssignment)!
        // `{ APPLICATION_CONFIG_URL: ... }` — leave the key alone.
        if (pa.getNameNode() === id) return false
      }
      if (parentKind === SyntaxKind.ShorthandPropertyAssignment) {
        // `{ APPLICATION_CONFIG_URL }` shorthand — both binding name AND
        // referenced symbol. Leave alone here; if the user wants to rename
        // the referenced value they should expand it manually first.
        return false
      }
      return true
    })
    .sort((a, b) => b.getPos() - a.getPos())

  for (const id of renameTargets) {
    id.replaceWithText(REPLACEMENT_IDENTIFIER)
  }

  return {
    changed: true,
    rewrittenFunctions,
    renamedReferences: renameTargets.length
  }
}

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(
    `Migrating '${TARGET_IDENTIFIER}' → '${REPLACEMENT_IDENTIFIER}' across ${sourceFiles.length} source file(s)...\n`
  )

  let changedFiles = 0
  let totalRewrittenFunctions = 0
  let totalRenamedReferences = 0
  const skipped: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const rel = path.relative(process.cwd(), filePath)
    const result = processFile(sourceFile)

    if (result.skippedReason) {
      skipped.push(`${rel} (${result.skippedReason})`)
      continue
    }

    if (!result.changed) continue

    await sourceFile.save()
    changedFiles++
    totalRewrittenFunctions += result.rewrittenFunctions.length
    totalRenamedReferences += result.renamedReferences

    for (const fn of result.rewrittenFunctions) {
      console.log(
        `  [${rel}:${fn.line}] Rewrote '${fn.name}' body → 'return ${REPLACEMENT_IDENTIFIER}' (config fetch eliminated)`
      )
    }
    if (result.renamedReferences > 0) {
      console.log(
        `  [${rel}] Renamed ${result.renamedReferences} stray reference(s) ${TARGET_IDENTIFIER} → ${REPLACEMENT_IDENTIFIER}`
      )
    }
  }

  if (skipped.length > 0) {
    console.warn(
      `\n  ${skipped.length} file(s) skipped:\n` +
        skipped.map((s) => `    - ${s}`).join('\n')
    )
  }

  if (changedFiles === 0) {
    console.log(`\nNo files reference '${TARGET_IDENTIFIER}'. Nothing to do.`)
    return
  }

  console.log(
    `\nDone. Updated ${changedFiles} file(s): ${totalRewrittenFunctions} fetch function(s) rewritten, ${totalRenamedReferences} bare reference(s) renamed.`
  )
  if (totalRewrittenFunctions > 0) {
    console.log(
      `NOTE: rewriting fetch functions discards any custom logic that lived inside them. Review the diff and re-apply any country-specific adjustments on top of '${REPLACEMENT_IDENTIFIER}'.`
    )
  }
}

export { main }
