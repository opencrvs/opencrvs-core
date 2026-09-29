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
/* eslint-disable no-console */

/**
 * Checks that every message this country config declares has a row in
 * `src/translations/countryconfig.csv`.
 *
 * The mirror of the check core runs over its own packages: core validates
 * `client.csv` and `login.csv` against the client and login sources, and this
 * validates `countryconfig.csv` against this package's own source. Without it,
 * a form or event label added here renders as a raw id.
 *
 * `client.csv` and `login.csv` are read but never written: core owns them, and
 * `opencrvs upgrade` keeps them in sync.
 *
 * This lives here rather than in `@opencrvs/toolkit` on purpose. Where the copy
 * is kept, and in what format, is this package's own business — the toolkit
 * only sees a country config through its HTTP endpoints, and a check that reads
 * `src/translations/*.csv` off disk cannot be written on that side of the line.
 * `opencrvs verify-endpoints` is the toolkit's half of this: it asks a running
 * country config whether it *serves* the copy core needs, whatever files that
 * came out of.
 *
 * Usage:
 *   tsx src/check-translations.ts [--write|--outdated]
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { Node, ObjectLiteralExpression, Project } from 'ts-morph'

const TRANSLATIONS = 'src/translations'
const OWN_FILE = `${TRANSLATIONS}/countryconfig.csv`
const CORE_FILES = [`${TRANSLATIONS}/client.csv`, `${TRANSLATIONS}/login.csv`]

/**
 * Just enough CSV for the translation files. They are read and written a line
 * at a time rather than through a parser, so that adding two rows to a file of
 * sixteen hundred produces a diff of two lines instead of a re-quoted rewrite
 * of the whole thing.
 *
 * Rows spanning multiple lines are not supported, and none of the translation
 * files contain any.
 */
type CsvFile = {
  header: string
  body: string[]
  /** Preserved so a file written on Windows stays written on Windows. */
  newline: string
  trailingNewline: boolean
}

function toCsvLine(values: string[]): string {
  return values
    .map((value) =>
      /["\n,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
    )
    .join(',')
}

/**
 * The id of a row, which is its first column. Translation ids never contain a
 * comma or a quote, so this does not need a parser.
 */
function idOf(line: string): string {
  const comma = line.indexOf(',')

  // No comma: `slice(0, -1)` would eat the last character.
  return comma === -1 ? line : line.slice(0, comma)
}

function readCsvFile(file: string): CsvFile | undefined {
  if (!existsSync(file)) {
    return undefined
  }

  const contents = readFileSync(file, 'utf8')
  const newline = contents.includes('\r\n') ? '\r\n' : '\n'
  const trailingNewline = /\r?\n$/.test(contents)
  const lines = contents.replace(/\r?\n$/, '').split(/\r?\n/)

  // Trailing blank line leaves an empty entry. It sorts before every id, so
  // the file reads as unsorted.
  const body = lines.slice(1).filter((line) => line !== '')

  return { header: lines[0], body, newline, trailingNewline }
}

function writeCsvFile(file: string, csv: CsvFile): void {
  writeFileSync(
    file,
    [csv.header, ...csv.body].join(csv.newline) +
      (csv.trailingNewline ? csv.newline : '')
  )
}

/**
 * Adds the rows the file does not already have an id for, in place. Rows go in
 * sorted position when the file is sorted by id, and at the end when it is not,
 * so a country config that keeps its own order keeps it.
 *
 * Returns the ids that were added.
 */
function addRows(csv: CsvFile, rows: string[]): string[] {
  const isSorted = csv.body.every(
    (line, index) => index === 0 || idOf(csv.body[index - 1]) <= idOf(line)
  )

  const added: string[] = []

  for (const row of rows) {
    const id = idOf(row)

    if (csv.body.some((line) => idOf(line) === id)) {
      continue
    }

    const insertAt = isSorted
      ? csv.body.findIndex((line) => idOf(line) > id)
      : -1

    if (insertAt === -1) {
      csv.body.push(row)
    } else {
      csv.body.splice(insertAt, 0, row)
    }

    added.push(id)
  }

  return added
}

export type Message = {
  id: string
  defaultMessage: string
  description: string
}

export type CheckResult = {
  missing: Message[]
  /** Rows in countryconfig.csv that nothing in the source declares. */
  outdated: string[]
  /** Files declaring a message whose id is assembled at runtime. */
  dynamicIds: string[]
}

/**
 * The value of a property when the source says what it is outright. A template
 * literal with something interpolated into it does not count.
 */
function staticStringOf(node: ObjectLiteralExpression, name: string) {
  const property = node.getProperty(name)

  if (!property || !Node.isPropertyAssignment(property)) {
    return undefined
  }

  const initializer = property.getInitializer()

  return initializer &&
    (Node.isStringLiteral(initializer) ||
      Node.isNoSubstitutionTemplateLiteral(initializer))
    ? initializer.getLiteralValue()
    : undefined
}

function messagesDeclaredIn(cwd: string) {
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  project.addSourceFilesAtPaths([
    path.join(cwd, 'src/**/*.ts'),
    path.join(cwd, 'src/**/*.tsx'),
    // This file builds a `{ id, defaultMessage }` of its own out of what it
    // finds, and would otherwise report itself as declaring a dynamic id.
    `!${path.join(cwd, 'src/check-translations.ts')}`,
    `!${path.join(cwd, 'src/**/*.test.ts')}`,
    `!${path.join(cwd, 'src/**/*.test.tsx')}`,
    `!${path.join(cwd, 'src/**/*.stories.ts')}`,
    `!${path.join(cwd, 'src/**/*.stories.tsx')}`
  ])

  const messages: Message[] = []
  const dynamicIds: string[] = []

  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.forEachDescendant((node) => {
      if (!Node.isObjectLiteralExpression(node)) {
        return
      }

      if (!(node.getProperty('id') && node.getProperty('defaultMessage'))) {
        return
      }

      const id = staticStringOf(node, 'id')

      if (id === undefined) {
        dynamicIds.push(path.relative(cwd, sourceFile.getFilePath()))
        return
      }

      messages.push({
        id,
        defaultMessage: staticStringOf(node, 'defaultMessage') ?? '',
        description: staticStringOf(node, 'description') ?? ''
      })
    })
  }

  return { messages, dynamicIds: [...new Set(dynamicIds)] }
}

export function check(cwd: string): CheckResult {
  const { messages, dynamicIds } = messagesDeclaredIn(cwd)

  const own = readCsvFile(path.join(cwd, OWN_FILE))
  const covered = new Set(
    [own, ...CORE_FILES.map((file) => readCsvFile(path.join(cwd, file)))]
      .flatMap((csv: CsvFile | undefined) => csv?.body ?? [])
      .map(idOf)
  )

  // The same message is often declared in more than one place.
  const missing = [
    ...new Map(
      messages
        .filter(({ id }) => !covered.has(id))
        .map((message) => [message.id, message])
    ).values()
  ].sort((a, b) => (a.id < b.id ? -1 : 1))

  const declared = new Set(messages.map(({ id }) => id))
  const outdated = (own?.body ?? [])
    .map(idOf)
    .filter((id: string) => !declared.has(id))

  return { missing, outdated, dynamicIds }
}

/**
 * Adds a row per missing message, filling in only English — the rest is copy
 * somebody has to write. Returns the ids added.
 *
 * Creates countryconfig.csv if it doesn't exist yet.
 */
export function writeMissing(cwd: string, missing: Message[]) {
  const file = readCsvFile(path.join(cwd, OWN_FILE)) ?? {
    header: 'id,description,en',
    body: [],
    newline: '\n',
    trailingNewline: true
  }

  const columns = file.header.split(',')

  const rows = missing.map((message) =>
    toCsvLine(
      columns.map((column: string) => {
        if (column === 'id') return message.id
        if (column === 'description') return message.description
        return column === 'en' ? message.defaultMessage : ''
      })
    )
  )

  const added = addRows(file, rows)
  writeCsvFile(path.join(cwd, OWN_FILE), file)

  return added
}

const USAGE = `
Usage: pnpm extract:translations [options]

Check that every message this country config declares has a row in
src/translations/countryconfig.csv.

Options:
  --write       Add the missing rows, filling in English only
  --outdated    List rows nothing in the source declares any more
  -h, --help    Show this help
`

function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(USAGE)
    return
  }

  /*
   * Only options are inspected. This runs from lint-staged, which appends the
   * staged filenames to the command, and the check always covers the whole
   * package rather than a file list.
   */
  const unknownFlags = args.filter(
    (arg) => arg.startsWith('-') && !['--write', '--outdated'].includes(arg)
  )

  if (unknownFlags.length > 0) {
    console.error(`Unknown option: ${unknownFlags.join(', ')}\n`)
    console.log(USAGE)
    process.exit(1)
  }

  const cwd = process.cwd()
  const { missing, outdated, dynamicIds } = check(cwd)

  for (const file of dynamicIds) {
    console.warn(
      `Warning: ${file} declares a message whose id is built at runtime. Ids have to be hardcoded to be checked.`
    )
  }

  if (args.includes('--outdated')) {
    console.log(
      `${outdated.length} row(s) in countryconfig.csv are not declared in src:\n`
    )
    console.log(outdated.join('\n'))
    return
  }

  if (missing.length === 0) {
    console.log('Every message declared in src has a translation row.')
    return
  }

  console.error(
    `${missing.length} message(s) declared in src have no row in src/translations/countryconfig.csv:\n`
  )
  console.error(missing.map(({ id }) => `  ${id}`).join('\n'))

  if (!args.includes('--write')) {
    console.error(
      '\nRun `pnpm extract:translations --write` to add them with their English copy.'
    )
    process.exit(1)
  }

  const added = writeMissing(cwd, missing)
  console.log(`\nAdded ${added.length} row(s) to countryconfig.csv.`)
  console.log('The languages other than English are still yours to write.')
}

main()
