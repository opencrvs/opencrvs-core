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
 * Codemod: Create `src/events/index.ts` that collects every `defineConfig`
 * event export, and rewire the event-config handler to import from it.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/create-events-index.ts
 *
 * Context:
 *   No codemod currently *moves* event-config source files into `src/events/`.
 *   Event configs therefore still live wherever the country defined them
 *   (typically `src/form/...`). This codemod works regardless of their
 *   location by discovering every `export const X = defineConfig(...)`
 *   declaration in `src/`.
 *
 * What it does:
 *   1. Scans `src/` for every top-level `export const X = defineConfig(...)`
 *      declaration and records `{ name, filePath }` pairs.
 *   2. Creates `src/events/index.ts` (if it does not already exist) that
 *      imports each event config from its actual file location using a
 *      relative path from `src/events/`, and exports:
 *          export const eventConfigs = [<name1>, <name2>, ...]
 *   3. Locates the event-config Hapi handler file (a file whose top level
 *      declares a function named `getCustomEventsHandler` or
 *      `getEventsHandler`) and:
 *         - Removes direct named imports of the event configs it no longer
 *           needs, cleaning up the import declaration if it becomes empty.
 *         - Removes any previously-inlined `export const eventConfigs = [...]`
 *           at the top level (in case an earlier codemod version hoisted one).
 *         - Adds `import { eventConfigs } from '@countryconfig/events'`
 *           (merging into an existing import of the same module if present).
 *         - Rewrites `h.response([<identifiers>]).code(...)` inside the
 *           handler to `h.response(eventConfigs).code(...)`.
 *   4. Saves the modified files.
 *
 *   The codemod is safe to re-run: if `src/events/index.ts` already exists it
 *   is left untouched, and handler modifications are idempotent.
 */

import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph'
import fs from 'fs'
import path from 'path'
import { getCwd } from '.'

const DEFINE_CONFIG_NAME = 'defineConfig'
const HANDLER_FUNCTION_NAMES = new Set([
  'getCustomEventsHandler',
  'getEventsHandler'
])
const EVENT_CONFIGS_IDENTIFIER = 'eventConfigs'
const EVENTS_INDEX_IMPORT_PATH = '@countryconfig/events'
const RESPONSE_METHOD_NAME = 'response'

const LICENSE_HEADER = `/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
`

type EventConfigExport = {
  name: string
  filePath: string
}

// ─── Discovery ───────────────────────────────────────────────────────────────

/**
 * Returns every top-level `export const X = defineConfig(...)` declaration in
 * files under `srcDir`. A declaration may wrap the call in a type assertion
 * (`... as EventConfig`) — this is unwrapped before matching.
 *
 * An existing `src/events/index.ts` is excluded so re-runs don't pick up its
 * re-exports as source definitions.
 */
function findEventConfigExports(
  project: Project,
  srcDir: string
): EventConfigExport[] {
  const found: EventConfigExport[] = []
  const eventsIndexAbs = path.join(srcDir, 'events', 'index.ts')

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath()
    if (!filePath.startsWith(srcDir) || filePath.includes('/node_modules/')) {
      continue
    }
    if (filePath === eventsIndexAbs) continue

    for (const statement of sourceFile.getVariableStatements()) {
      if (!statement.hasExportKeyword()) continue

      for (const decl of statement.getDeclarations()) {
        const initializer = decl.getInitializer()
        if (!initializer) continue

        const unwrapped = Node.isAsExpression(initializer)
          ? initializer.getExpression()
          : initializer
        if (!Node.isCallExpression(unwrapped)) continue

        const callee = unwrapped.getExpression()
        if (!Node.isIdentifier(callee)) continue
        if (callee.getText() !== DEFINE_CONFIG_NAME) continue

        found.push({ name: decl.getName(), filePath })
      }
    }
  }

  return found
}

// ─── Path helpers ────────────────────────────────────────────────────────────

/**
 * Builds the POSIX module-specifier string used by `src/events/index.ts` to
 * import from `eventConfigFilePath`.
 *
 * - Strips the trailing `.ts` extension.
 * - Collapses `/index` so `src/form/v2/birth/index.ts` → `../form/v2/birth`.
 * - Ensures the result starts with `./` or `../` (relative paths are required
 *   for sibling files that would otherwise be parsed as bare module names).
 */
function buildIndexImportSpecifier(
  eventConfigFilePath: string,
  srcDir: string
): string {
  const eventsIndexDir = path.join(srcDir, 'events')
  let rel = path
    .relative(eventsIndexDir, eventConfigFilePath)
    .split(path.sep)
    .join('/')

  if (rel.endsWith('.ts')) rel = rel.slice(0, -'.ts'.length)
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length)
  if (!rel.startsWith('.')) rel = './' + rel

  return rel
}

// ─── events/index.ts generation ──────────────────────────────────────────────

function buildEventsIndexSource(
  exports: EventConfigExport[],
  srcDir: string
): string {
  const imports = exports
    .map(
      (e) =>
        `import { ${e.name} } from '${buildIndexImportSpecifier(
          e.filePath,
          srcDir
        )}'`
    )
    .join('\n')

  const array = `export const ${EVENT_CONFIGS_IDENTIFIER} = [${exports
    .map((e) => e.name)
    .join(', ')}]`

  return `${LICENSE_HEADER}${imports}\n\n${array}\n`
}

// ─── Handler discovery & rewrite ─────────────────────────────────────────────

/**
 * Returns the first source file under `srcDir` whose top-level declarations
 * include a function (either `function foo()` or `const foo = () => {}`) whose
 * name is in `HANDLER_FUNCTION_NAMES`.
 */
function findHandlerSourceFile(
  project: Project,
  srcDir: string
): SourceFile | undefined {
  for (const sf of project.getSourceFiles()) {
    const fp = sf.getFilePath()
    if (!fp.startsWith(srcDir) || fp.includes('/node_modules/')) continue

    for (const fn of sf.getFunctions()) {
      const name = fn.getName()
      if (name && HANDLER_FUNCTION_NAMES.has(name)) return sf
    }
    for (const statement of sf.getVariableStatements()) {
      for (const decl of statement.getDeclarations()) {
        if (HANDLER_FUNCTION_NAMES.has(decl.getName())) return sf
      }
    }
  }
  return undefined
}

/**
 * Mutates the handler source file:
 *   1. Removes named imports matching `exportNames` from existing imports
 *      and drops any import declaration that's left empty.
 *   2. Removes a stale top-level `export const eventConfigs = ...` if present.
 *   3. Ensures `import { eventConfigs } from '@countryconfig/events'` exists
 *      (merging into an existing import of the same module when possible).
 *   4. Replaces every `h.response([<identifiers>])` argument with
 *      `eventConfigs`.
 *
 * Returns a log of the changes that were actually applied.
 */
function modifyHandler(
  sourceFile: SourceFile,
  exportNames: Set<string>
): string[] {
  const changes: string[] = []

  // 1. Drop direct imports of event configs. Iterate over a snapshot because
  //    `importDecl.remove()` may mutate the declaration list.
  for (const importDecl of [...sourceFile.getImportDeclarations()]) {
    const namedImports = importDecl.getNamedImports()
    if (namedImports.length === 0) continue

    const matched = namedImports.filter((ni) => exportNames.has(ni.getName()))
    if (matched.length === 0) continue

    const removedNames = matched.map((ni) => ni.getName())
    for (const ni of matched) ni.remove()
    changes.push(`removed direct imports: ${removedNames.join(', ')}`)

    const stillUsed =
      importDecl.getNamedImports().length > 0 ||
      importDecl.getDefaultImport() ||
      importDecl.getNamespaceImport()
    if (!stillUsed) importDecl.remove()
  }

  // 2. Remove an inline top-level `export const eventConfigs = ...` if present.
  //    This cleans up after any earlier in-place hoisting done by a previous
  //    version of this migration.
  for (const statement of [...sourceFile.getVariableStatements()]) {
    if (!statement.hasExportKeyword()) continue
    const hasEventConfigs = statement
      .getDeclarations()
      .some((d) => d.getName() === EVENT_CONFIGS_IDENTIFIER)
    if (hasEventConfigs) {
      statement.remove()
      changes.push(`removed inline 'export const ${EVENT_CONFIGS_IDENTIFIER}'`)
    }
  }

  // 3. Ensure `import { eventConfigs } from '@countryconfig/events'`.
  const existing = sourceFile.getImportDeclaration(
    (imp) => imp.getModuleSpecifierValue() === EVENTS_INDEX_IMPORT_PATH
  )
  if (existing) {
    const already = existing
      .getNamedImports()
      .some((ni) => ni.getName() === EVENT_CONFIGS_IDENTIFIER)
    if (!already) {
      existing.addNamedImport(EVENT_CONFIGS_IDENTIFIER)
      changes.push(
        `added '${EVENT_CONFIGS_IDENTIFIER}' to existing import from '${EVENTS_INDEX_IMPORT_PATH}'`
      )
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: EVENTS_INDEX_IMPORT_PATH,
      namedImports: [EVENT_CONFIGS_IDENTIFIER]
    })
    changes.push(
      `added import { ${EVENT_CONFIGS_IDENTIFIER} } from '${EVENTS_INDEX_IMPORT_PATH}'`
    )
  }

  // 4. Replace inline `h.response([<identifiers>])` with `h.response(eventConfigs)`.
  for (const call of sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )) {
    const callee = call.getExpression()
    if (!Node.isPropertyAccessExpression(callee)) continue
    if (callee.getName() !== RESPONSE_METHOD_NAME) continue

    const args = call.getArguments()
    if (args.length !== 1) continue
    const [arg] = args
    if (!Node.isArrayLiteralExpression(arg)) continue
    if (arg.getElements().length === 0) continue
    if (!arg.getElements().every((el) => Node.isIdentifier(el))) continue

    arg.replaceWithText(EVENT_CONFIGS_IDENTIFIER)
    changes.push(
      `rewrote h.response([...]) → h.response(${EVENT_CONFIGS_IDENTIFIER})`
    )
  }

  return changes
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const cwd = getCwd()
  const srcDir = path.join(cwd, 'src')

  console.log(`Scanning for defineConfig event exports in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const eventConfigExports = findEventConfigExports(project, srcDir)

  if (eventConfigExports.length === 0) {
    console.log(
      'No top-level `export const X = defineConfig(...)` declarations found. Nothing to do.'
    )
    return
  }

  console.log(`Found ${eventConfigExports.length} event config export(s):`)
  for (const e of eventConfigExports) {
    console.log(`  ${e.name}  ←  ${path.relative(cwd, e.filePath)}`)
  }

  // ── Create (or skip) src/events/index.ts ───────────────────────────────────
  const eventsIndexAbs = path.join(srcDir, 'events', 'index.ts')
  const eventsIndexRel = path.relative(cwd, eventsIndexAbs)

  if (fs.existsSync(eventsIndexAbs)) {
    console.log(`\n[${eventsIndexRel}] already exists — leaving untouched.`)
  } else {
    fs.mkdirSync(path.dirname(eventsIndexAbs), { recursive: true })
    const source = buildEventsIndexSource(eventConfigExports, srcDir)
    const eventsIndexFile = project.createSourceFile(eventsIndexAbs, source, {
      overwrite: false
    })
    await eventsIndexFile.save()
    console.log(
      `\n[${eventsIndexRel}] created with ${EVENT_CONFIGS_IDENTIFIER} of ${eventConfigExports.length} event(s).`
    )
  }

  // ── Rewire handler file ────────────────────────────────────────────────────
  const handler = findHandlerSourceFile(project, srcDir)
  if (!handler) {
    console.log(
      `\nNo event-config handler file found (looked for exported function(s): ${Array.from(
        HANDLER_FUNCTION_NAMES
      ).join(', ')}). Skipping handler rewrite.`
    )
    return
  }

  const handlerRelPath = path.relative(cwd, handler.getFilePath())
  const exportNameSet = new Set(eventConfigExports.map((e) => e.name))

  const changes = modifyHandler(handler, exportNameSet)

  if (changes.length === 0) {
    console.log(`\n[${handlerRelPath}] already wired to ${EVENTS_INDEX_IMPORT_PATH} — no changes.`)
    return
  }

  for (const c of changes) console.log(`  [${handlerRelPath}] ${c}`)
  await handler.save()
  console.log(`\nSaved ${handlerRelPath}.`)
}

export { main }
