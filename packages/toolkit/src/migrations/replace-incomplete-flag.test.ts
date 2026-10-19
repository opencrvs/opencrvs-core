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
import { replaceIncompleteFlag } from './replace-incomplete-flag'

function run(source: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile('workqueueConfig.ts', source)
  const result = replaceIncompleteFlag(sourceFile)
  return { ...result, text: sourceFile.getFullText() }
}

describe('replaceIncompleteFlag', () => {
  it('replaces the flag with the NOTIFIED status and keeps other flags', () => {
    const { text, changed, remaining } = run(`
import { InherentFlags, user } from '@opencrvs/toolkit/events'
const query = {
  flags: {
    anyOf: [InherentFlags.INCOMPLETE],
    noneOf: [InherentFlags.REJECTED]
  },
  updatedAtLocation: { type: 'within', location: user('administrativeAreaId') }
}
`)

    expect(changed).toBe(true)
    expect(remaining).toEqual([])
    expect(text).not.toContain('INCOMPLETE')
    expect(text).not.toContain('anyOf')
    expect(text).toContain('noneOf: [InherentFlags.REJECTED]')
    expect(text).toContain(
      `status: { type: 'exact', term: EventStatus.enum.NOTIFIED }`
    )
    expect(text).toContain(
      `import { InherentFlags, user, EventStatus } from '@opencrvs/toolkit/events'`
    )
  })

  it('keeps the other anyOf flags and drops an emptied flags object', () => {
    const { text } = run(`
import { EventStatus, InherentFlags } from '@opencrvs/toolkit/events'
const a = { flags: { anyOf: [InherentFlags.INCOMPLETE, 'pending'] } }
const b = { flags: { anyOf: [InherentFlags.INCOMPLETE] } }
`)

    expect(text).toContain(`const a = { flags: { anyOf: ['pending'] },`)
    expect(text).not.toMatch(/const b = \{\s*flags/)
    expect(text.match(/term: EventStatus\.enum\.NOTIFIED/g)).toHaveLength(2)
    expect(text.match(/EventStatus,/g)).toHaveLength(1)
  })

  it('reports references it cannot rewrite', () => {
    const { changed, remaining } = run(`
import { InherentFlags, flag } from '@opencrvs/toolkit/events'

const conditional = flag(InherentFlags.INCOMPLETE)
`)

    expect(changed).toBe(false)
    expect(remaining).toEqual([4])
  })

  it('is idempotent', () => {
    const { text } = run(`
import { InherentFlags } from '@opencrvs/toolkit/events'
const query = { flags: { anyOf: [InherentFlags.INCOMPLETE] } }
`)
    expect(run(text)).toMatchObject({ changed: false, text })
  })
})
