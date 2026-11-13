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
// Checks forms/bindings.yml against the form and the templates, and keeps
// ui/generated/file-paths.json (where each template variable lands in the rendered
// file) up to date. `--write` regenerates the JSON; without it, a stale file is an error.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { parse } from 'yaml'
import type { Bindings } from '../ui/bindings/bindings.ts'
import { FORMATTERS, PARSERS } from '../ui/bindings/parsers.ts'
import { DERIVED } from '../ui/plan/templateValues.ts'
import { scanTemplate, type FilePath } from '../ui/bindings/templateScan.ts'
import { ENVIRONMENT_FILES } from '../server/environments.ts'

const root = join(import.meta.dirname, '..')
const templatesDir = join(root, 'templates')
const generated = join(root, 'ui', 'generated', 'file-paths.json')
const write = process.argv.includes('--write')

const errors: string[] = []
const notes: string[] = []
const fail = (message: string) => errors.push(message)

const bindings = parse(readFileSync(join(root, 'forms', 'bindings.yml'), 'utf8')) as Bindings
const wizard = parse(readFileSync(join(root, 'forms', 'wizard.yml'), 'utf8')) as { pages: any[] }

// --- questions of the form ---------------------------------------------------------
interface Question {
  name: string
  type: string
  secret: boolean
}
const questions: Question[] = []
const collect = (elements: any[] = []) => {
  for (const element of elements) {
    if (element.type === 'panel') collect(element.elements)
    else questions.push({ name: element.name, type: element.type, secret: element.type === 'secret' || element.secret === true })
  }
}
wizard.pages.forEach((page) => collect(page.elements))
const names = new Set(questions.map((question) => question.name))

// --- templates ---------------------------------------------------------------------
function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walkFiles(path) : [path]
  })
}
const templates = walkFiles(templatesDir)
  .map((path) => relative(templatesDir, path).split('\\').join('/'))
  .filter((path) => path !== 'README.md')
  .sort()

const scans: Record<string, Record<string, FilePath[]>> = {}
const unreadable: Record<string, string[]> = {}
for (const template of templates) {
  if (!(template in bindings.files)) {
    notes.push(`not read: ${template} (not listed under files in bindings.yml)`)
    continue
  }
  const scan = scanTemplate(readFileSync(join(templatesDir, template), 'utf8'))
  scans[template] = scan.paths
  unreadable[template] = scan.unreadable
}

// --- checks ------------------------------------------------------------------------
for (const template of Object.keys(bindings.files)) {
  if (!templates.includes(template)) fail(`files: template ${template} does not exist under templates/`)
}
const outputs = Object.values(bindings.files).sort()
if (JSON.stringify(outputs) !== JSON.stringify([...ENVIRONMENT_FILES].sort())) {
  fail(`files: rendered files ${outputs.join(', ')} differ from the files the dev server reads (${ENVIRONMENT_FILES.join(', ')})`)
}

if (bindings.flat !== undefined && !outputs.includes(bindings.flat)) {
  fail(`flat: "${bindings.flat}" is not one of the rendered files (${outputs.join(', ')})`)
}

for (const question of questions) {
  const bound = question.name in bindings.bindings
  const ignored = question.name in bindings.ignore
  if (bound && ignored) fail(`${question.name}: listed both under bindings and ignore`)
  if (!bound && !ignored) fail(`${question.name}: no binding and not ignored`)
}
for (const name of [...Object.keys(bindings.bindings), ...Object.keys(bindings.ignore)]) {
  if (!names.has(name)) fail(`${name}: in bindings.yml but no such question in wizard.yml`)
}

const used = new Set<string>()
for (const [name, binding] of Object.entries(bindings.bindings)) {
  const question = questions.find((candidate) => candidate.name === name)
  if (question?.secret && !binding.targets.some((t) => t.source === 'github' && t.kind === 'secret')) {
    fail(`${name}: is a secret but has no GitHub secret target`)
  }
  if (binding.targets.length === 0) fail(`${name}: no targets`)

  for (const target of binding.targets) {
    if (target.parse && !(target.parse in PARSERS)) fail(`${name}: unknown parser "${target.parse}"`)
    if (target.parse && !(target.parse in FORMATTERS)) fail(`${name}: parser "${target.parse}" has no formatter, so the value cannot be written`)
    if (target.source === 'github') {
      if (!['variable', 'secret'].includes(target.kind)) fail(`${name}: github kind must be variable or secret`)
      if (!['environment', 'repository'].includes(target.scope)) fail(`${name}: github scope must be environment or repository`)
    } else if (target.source === 'file') {
      const paths = scans[target.template]?.[target.var]
      if (!(target.template in bindings.files)) fail(`${name}: template ${target.template} is not listed under files`)
      else if (!paths?.length) fail(`${name}: variable "${target.var}" has no readable place in ${target.template}`)
      else if (target.collect === 'container' && !paths.some((path) => path.segments.includes('*'))) {
        fail(`${name}: collect: container needs a list variable, but ${target.var} is not inside a loop`)
      }
      used.add(`${target.template} ${target.var}`)
    } else {
      fail(`${name}: unknown source`)
    }
  }
}

// --- every template variable needs a source when a template is rendered ------------------
for (const template of Object.keys(bindings.templates ?? {})) {
  if (!(template in bindings.files)) fail(`templates: ${template} is not listed under files`)
}
for (const [template, paths] of Object.entries(scans)) {
  const variables = new Set([...Object.keys(paths).filter((label) => !label.includes('.')), ...(unreadable[template] ?? [])])
  const fromQuestions = new Set(
    Object.values(bindings.bindings).flatMap((binding) =>
      binding.targets.flatMap((target) =>
        target.source === 'file' && target.template === template ? [target.collect === 'container' ? target.var.split('.')[0]! : target.var] : []
      )
    )
  )
  const config = bindings.templates?.[template]
  const defaults = Object.keys(config?.defaults ?? {})
  const derived = config?.derived ?? []
  for (const name of derived) if (!(name in DERIVED)) fail(`${template}: derived value "${name}" does not exist in ui/plan/templateValues.ts`)
  for (const name of [...defaults, ...derived]) if (!variables.has(name)) fail(`${template}: "${name}" is not a variable of this template`)
  for (const variable of variables) {
    if (!fromQuestions.has(variable) && !defaults.includes(variable) && !derived.includes(variable)) {
      fail(`${template}: variable "${variable}" has no question, default or derived value, so it would render blank`)
    }
  }
}

// --- report ------------------------------------------------------------------------
for (const [template, paths] of Object.entries(scans)) {
  const unmapped = Object.keys(paths).filter((variable) => !used.has(`${template} ${variable}`))
  if (unmapped.length) notes.push(`${template}: readable but not bound: ${unmapped.join(', ')}`)
  if (unreadable[template]?.length) notes.push(`${template}: cannot be read back: ${unreadable[template]!.join(', ')}`)
}

// --- generated paths -----------------------------------------------------------------
const sorted = Object.fromEntries(
  Object.entries(scans)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([template, paths]) => [template, Object.fromEntries(Object.entries(paths).sort(([a], [b]) => a.localeCompare(b)))])
)
const json = JSON.stringify(sorted, null, 2) + '\n'
if (write) {
  mkdirSync(dirname(generated), { recursive: true })
  writeFileSync(generated, json)
  notes.push(`wrote ${relative(root, generated)}`)
} else if (!existsSync(generated) || readFileSync(generated, 'utf8') !== json) {
  fail(`${relative(root, generated)} is missing or stale: run "npm run bindings"`)
}

for (const note of notes) console.log(`  note: ${note}`)
if (errors.length) {
  console.error(`\nbindings check failed:\n${errors.map((error) => `  - ${error}`).join('\n')}`)
  process.exit(1)
}
console.log(`bindings ok: ${questions.length} questions, ${Object.keys(bindings.bindings).length} bound, ${Object.keys(bindings.ignore).length} ignored`)
