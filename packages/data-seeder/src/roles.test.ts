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
import { encodeScope } from '@opencrvs/commons'
import { getDeclaredRoles, parseRoles, RoleRead } from './roles'

const CONFIGURE = encodeScope({ type: 'config.update-all' })

/** A raw role of the shape a country config serves. */
function record(overrides: Record<string, unknown> = {}) {
  return {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Local Registrar',
      description: 'The role',
      id: 'role.localRegistrar'
    },
    scopes: [CONFIGURE],
    ...overrides
  }
}

function read(payload: unknown): Extract<RoleRead, { readable: true }> {
  const read = parseRoles(payload, [])

  if (!read.readable) {
    throw new Error('expected the list to be readable')
  }

  return read
}

describe('a list that did not parse', () => {
  it('is one problem about the list, and declares no role at all', () => {
    const parsed = parseRoles({ roles: [] }, [])

    expect(parsed.readable).toBe(false)
    expect(parsed.readable === false && parsed.problem.kind).toBe(
      'roleListUnparsed'
    )
    expect(getDeclaredRoles(parsed).size).toBe(0)
  })
})

describe('a role that did not parse', () => {
  const broken = [record({ id: 'SOCIAL_WORKER', scopes: ['nonsense'] })]

  it('is a problem naming the id that could still be read off it', () => {
    expect(read(broken).problems).toMatchObject([
      { kind: 'roleUnparsed', role: { position: 1, id: 'SOCIAL_WORKER' } }
    ])
  })

  it('is still declared, so that nothing mistakes it for an absent role', () => {
    expect(getDeclaredRoles(read(broken)).has('SOCIAL_WORKER')).toBe(true)
  })

  it('declares no scopes, because what it grants is unknown', () => {
    expect(getDeclaredRoles(read(broken)).get('SOCIAL_WORKER')?.scopes).toBeUndefined()
  })

  it('is named by position alone when no id could be read', () => {
    expect(read([record({ id: 5 })]).problems).toMatchObject([
      { kind: 'roleUnparsed', role: { position: 1, id: undefined } }
    ])
  })
})

describe('a role that parsed', () => {
  it('is declared, carrying the scopes it grants', () => {
    expect(getDeclaredRoles(read([record()])).get('LOCAL_REGISTRAR')).toEqual({
      id: 'LOCAL_REGISTRAR',
      scopes: [CONFIGURE]
    })
  })

  it('is rejected for a scope that names an event the country config does not declare', () => {
    const scoped = encodeScope({
      type: 'record.declare',
      options: { event: ['v2.nonsense'] }
    })

    expect(parseRoles([record({ scopes: [scoped] })], ['v2.birth']))
      .toMatchObject({ problems: [{ kind: 'roleUnparsed' }] })
  })

  it('is accepted for a scope that names one it does', () => {
    const scoped = encodeScope({
      type: 'record.declare',
      options: { event: ['v2.birth'] }
    })

    expect(parseRoles([record({ scopes: [scoped] })], ['v2.birth']))
      .toMatchObject({ problems: [] })
  })
})

describe('an id declared more than once', () => {
  it('is one problem, however many times it repeats', () => {
    expect(
      read([record(), record({ id: 'NATIONAL_SYSTEM_ADMIN' }), record(), record()])
        .problems
    ).toEqual([{ kind: 'duplicateRoleId', id: 'LOCAL_REGISTRAR' }])
  })
})
