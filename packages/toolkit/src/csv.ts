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
 * Just enough CSV for the translation files codemods edit. They are read and
 * written a line at a time rather than through a parser, so that adding two
 * rows to a file of sixteen hundred produces a diff of two lines instead of a
 * re-quoted rewrite of the whole thing.
 *
 * Rows spanning multiple lines are not supported, and none of the translation
 * files contain any.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'

export type CsvFile = {
  header: string
  body: string[]
  /** Preserved so a file written on Windows stays written on Windows. */
  newline: string
  trailingNewline: boolean
}

export function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index++) {
    const character = line[index]

    if (quoted) {
      if (character !== '"') {
        value += character
      } else if (line[index + 1] === '"') {
        value += '"'
        index++
      } else {
        quoted = false
      }
      continue
    }

    if (character === '"') {
      quoted = true
    } else if (character === ',') {
      values.push(value)
      value = ''
    } else {
      value += character
    }
  }

  values.push(value)

  return values
}

export function toCsvLine(values: string[]): string {
  return values
    .map((value) =>
      /["\n,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
    )
    .join(',')
}

/**
 * The id of a row, which is its first column. Translation ids never contain a
 * comma or a quote, so this does not need the parser.
 */
export function idOf(line: string): string {
  const comma = line.indexOf(',')

  // No comma: `slice(0, -1)` would eat the last character.
  return comma === -1 ? line : line.slice(0, comma)
}

export function readCsvFile(path: string): CsvFile | undefined {
  if (!existsSync(path)) {
    return undefined
  }

  const contents = readFileSync(path, 'utf8')
  const newline = contents.includes('\r\n') ? '\r\n' : '\n'
  const trailingNewline = /\r?\n$/.test(contents)
  const lines = contents.replace(/\r?\n$/, '').split(/\r?\n/)

  // Trailing blank line leaves an empty entry. It sorts before every id, so
  // the file reads as unsorted.
  const body = lines.slice(1).filter((line) => line !== '')

  return { header: lines[0], body, newline, trailingNewline }
}

export function writeCsvFile(path: string, file: CsvFile): void {
  writeFileSync(
    path,
    [file.header, ...file.body].join(file.newline) +
      (file.trailingNewline ? file.newline : '')
  )
}

/**
 * Adds the rows the file does not already have an id for, in place. Rows go in
 * sorted position when the file is sorted by id, and at the end when it is not,
 * so a country config that keeps its own order keeps it.
 *
 * Returns the ids that were added.
 */
export function addRows(file: CsvFile, rows: string[]): string[] {
  const isSorted = file.body.every(
    (line, index) => index === 0 || idOf(file.body[index - 1]) <= idOf(line)
  )

  const added: string[] = []

  for (const row of rows) {
    const id = idOf(row)

    if (file.body.some((line) => idOf(line) === id)) {
      continue
    }

    const insertAt = isSorted
      ? file.body.findIndex((line) => idOf(line) > id)
      : -1

    if (insertAt === -1) {
      file.body.push(row)
    } else {
      file.body.splice(insertAt, 0, row)
    }

    added.push(id)
  }

  return added
}
