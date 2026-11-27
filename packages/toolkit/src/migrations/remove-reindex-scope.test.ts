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
import { Project } from 'ts-morph'
import { describe, expect, it } from 'vitest'
import { removeReindexScope } from './remove-reindex-scope'

function run(source: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile('roles.ts', source)
  const result = removeReindexScope(sourceFile)
  return { ...result, text: sourceFile.getFullText() }
}

describe('removeReindexScope', () => {
  it('removes the scope and keeps the other scopes', () => {
    const { text, changed, remaining } = run(`
const roles = [
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    scopes: [
      { type: 'bypassratelimit' },
      { type: 'record.reindex' },
      { type: 'user.create', options: { role: ['HOSPITAL_CLERK'] } }
    ]
  }
]
`)

    expect(changed).toBe(true)
    expect(remaining).toEqual([])
    expect(text).not.toContain('record.reindex')
    expect(text).toContain(`{ type: 'bypassratelimit' },`)
    expect(text).toContain(
      `{ type: 'user.create', options: { role: ['HOSPITAL_CLERK'] } }`
    )
  })

  it('reports references it cannot remove', () => {
    const { changed, remaining } = run(`
const scope = 'record.reindex'
`)

    expect(changed).toBe(false)
    expect(remaining).toEqual([2])
  })

  it('is idempotent', () => {
    const { text } = run(`
const scopes = [{ type: 'record.reindex' }, { type: 'bypassratelimit' }]
`)
    expect(run(text)).toMatchObject({ changed: false, text })
  })
})
