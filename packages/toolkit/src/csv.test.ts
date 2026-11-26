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
import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import {
  CsvFile,
  addRows,
  idOf,
  parseCsvLine,
  readCsvFile,
  toCsvLine
} from './csv'

describe('parseCsvLine', () => {
  it('splits plain values', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('keeps a comma that is inside quotes', () => {
    expect(parseCsvLine('id,"one, two",three')).toEqual([
      'id',
      'one, two',
      'three'
    ])
  })

  it('reads a doubled quote as one quote', () => {
    expect(parseCsvLine('id,"say ""hi""",x')).toEqual(['id', 'say "hi"', 'x'])
  })

  it('keeps empty trailing values', () => {
    expect(parseCsvLine('id,description,en,')).toEqual([
      'id',
      'description',
      'en',
      ''
    ])
  })
})

describe('toCsvLine', () => {
  it('leaves values that need no quoting alone', () => {
    expect(toCsvLine(['a', 'b', ''])).toBe('a,b,')
  })

  it('quotes a value containing a comma', () => {
    expect(toCsvLine(['id', 'one, two'])).toBe('id,"one, two"')
  })

  it('doubles quotes inside a quoted value', () => {
    expect(toCsvLine(['id', 'say "hi"'])).toBe('id,"say ""hi"""')
  })

  it('round-trips through the parser', () => {
    const values = ['id', 'a, b', 'say "hi"', '', 'plain']
    expect(parseCsvLine(toCsvLine(values))).toEqual(values)
  })
})

describe('idOf', () => {
  it('reads the first column', () => {
    expect(idOf('buttons.confirm,Label used,Confirm,Confirmer')).toBe(
      'buttons.confirm'
    )
  })

  it('reads a line with no comma whole', () => {
    expect(idOf('buttons.confirm')).toBe('buttons.confirm')
  })
})

describe('readCsvFile', () => {
  const directories: string[] = []

  afterEach(() => {
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  function fileWith(contents: string) {
    const directory = mkdtempSync(path.join(tmpdir(), 'opencrvs-csv-'))
    directories.push(directory)
    const file = path.join(directory, 'translations.csv')
    writeFileSync(file, contents)
    return file
  }

  it('drops the empty entry a trailing blank line leaves behind', () => {
    const file = readCsvFile(fileWith('id,description,en\na,,A\nb,,B\n\n'))

    expect(file?.body).toEqual(['a,,A', 'b,,B'])
  })
})

function fileOf(body: string[]): CsvFile {
  return {
    header: 'id,description,en,fr',
    body,
    newline: '\n',
    trailingNewline: true
  }
}

describe('addRows', () => {
  it('inserts in sorted position when the file is sorted', () => {
    const file = fileOf(['a,,A,', 'c,,C,'])

    expect(addRows(file, ['b,,B,'])).toEqual(['b'])
    expect(file.body).toEqual(['a,,A,', 'b,,B,', 'c,,C,'])
  })

  it('appends when the file keeps its own order', () => {
    const file = fileOf(['c,,C,', 'a,,A,'])

    expect(addRows(file, ['b,,B,'])).toEqual(['b'])
    expect(file.body).toEqual(['c,,C,', 'a,,A,', 'b,,B,'])
  })

  it('leaves an id the file already has, whatever its copy says', () => {
    const file = fileOf(['a,,Translated locally,Localement'])

    expect(addRows(file, ['a,,A,'])).toEqual([])
    expect(file.body).toEqual(['a,,Translated locally,Localement'])
  })

  it('is safe to run twice', () => {
    const file = fileOf(['a,,A,'])

    addRows(file, ['b,,B,'])
    expect(addRows(file, ['b,,B,'])).toEqual([])
    expect(file.body).toEqual(['a,,A,', 'b,,B,'])
  })
})
