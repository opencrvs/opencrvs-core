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
import { describe, expect, it } from 'vitest'
import { CsvFile, addRows } from '../../csv'
import { rowsToAdd } from './add-translations'

function fileOf(header: string, body: string[]): CsvFile {
  return { header, body, newline: '\n', trailingNewline: true }
}

describe('rowsToAdd', () => {
  it('carries over a language the country config shares with the template', () => {
    const local = fileOf('id,description,en,fr', [])
    const template = fileOf('id,description,en,fr', [
      'a,Some copy,Hello,Bonjour'
    ])

    expect(rowsToAdd(local, template)).toEqual(['a,Some copy,Hello,Bonjour'])
  })

  it('leaves a language the template has nothing for empty', () => {
    const local = fileOf('id,description,en,sw', [])
    const template = fileOf('id,description,en,fr', [
      'a,Some copy,Hello,Bonjour'
    ])

    expect(rowsToAdd(local, template)).toEqual(['a,Some copy,Hello,'])
  })

  it('drops a language the country config does not have', () => {
    const local = fileOf('id,description,en', [])
    const template = fileOf('id,description,en,fr', [
      'a,Some copy,Hello,Bonjour'
    ])

    expect(rowsToAdd(local, template)).toEqual(['a,Some copy,Hello'])
  })

  it('follows the local column order rather than the template one', () => {
    const local = fileOf('id,description,fr,en', [])
    const template = fileOf('id,description,en,fr', [
      'a,Some copy,Hello,Bonjour'
    ])

    expect(rowsToAdd(local, template)).toEqual(['a,Some copy,Bonjour,Hello'])
  })

  it('re-quotes copy containing a comma', () => {
    const local = fileOf('id,description,en,fr', [])
    const template = fileOf('id,description,en,fr', [
      'a,"A description, with a comma","Hello, you",Bonjour'
    ])

    expect(rowsToAdd(local, template)).toEqual([
      'a,"A description, with a comma","Hello, you",Bonjour'
    ])
  })

  it('adds only what the country config is missing, keeping its own copy', () => {
    const local = fileOf('id,description,en,fr', [
      'a,Some copy,Reworded locally,Reformulé'
    ])
    const template = fileOf('id,description,en,fr', [
      'a,Some copy,Hello,Bonjour',
      'b,More copy,Goodbye,Au revoir'
    ])

    expect(addRows(local, rowsToAdd(local, template))).toEqual(['b'])
    expect(local.body).toEqual([
      'a,Some copy,Reworded locally,Reformulé',
      'b,More copy,Goodbye,Au revoir'
    ])
  })
})
