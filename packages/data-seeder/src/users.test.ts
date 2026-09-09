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
import { parseUsers, UserRead } from './users'

/** A raw entry of the shape a country config serves. */
function record(overrides: Record<string, unknown> = {}) {
  return {
    givenNames: 'Kennedy',
    familyName: 'Mweene',
    username: 'k.mweene',
    password: 'test',
    email: 'k.mweene@x.com',
    primaryOfficeId: 'ibombo_HPGiE9Jjh2r',
    role: 'LOCAL_REGISTRAR',
    ...overrides
  }
}

/** Narrows to the readable case, which every test but one is about. */
function read(payload: unknown): Extract<UserRead, { readable: true }> {
  const read = parseUsers(payload)

  if (!read.readable) {
    throw new Error('expected the list to be readable')
  }

  return read
}

describe('a list that did not parse', () => {
  it('is one problem about the list, and yields no initial user to check', () => {
    const parsed = parseUsers({ users: [] })

    expect(parsed.readable).toBe(false)
    expect(parsed.readable === false && parsed.problem.kind).toBe(
      'userListUnparsed'
    )
  })
})

describe('an entry that did not parse', () => {
  it('is a problem naming its position, and is not an initial user', () => {
    const parsed = read([record({ username: 5 })])

    expect(parsed.users).toEqual([])
    expect(parsed.problems).toHaveLength(1)
    expect(parsed.problems[0]).toMatchObject({
      kind: 'userUnparsed',
      user: { position: 1 }
    })
  })

  it('keeps a username that could still be read off it', () => {
    const parsed = read([record({ email: 5, mobile: undefined })])

    expect(parsed.problems[0]).toMatchObject({
      kind: 'userUnparsed',
      user: { position: 1, username: 'k.mweene' }
    })
  })

  it('carries no username when none could be read', () => {
    const parsed = read([record({ username: 5 })])

    expect(
      parsed.problems[0].kind === 'userUnparsed' &&
        parsed.problems[0].user.username
    ).toBeUndefined()
  })

  it('does not shift the initial users after it, which keep their positions', () => {
    // The report names an initial user by where it sits in the seed-data, so a
    // failed entry has to keep its place even though it is not yielded.
    const parsed = read([
      record({ username: 5 }),
      record({ username: 'f.katongo', email: 'f.katongo@x.com' })
    ])

    expect(parsed.users.map(({ position, username }) => [position, username]))
      .toEqual([[2, 'f.katongo']])
  })

  it('is left out of the uniqueness checks, since nothing about it is trusted', () => {
    const parsed = read([
      record({ username: 'k.mweene' }),
      record({ username: 'k.mweene', password: 5 })
    ])

    expect(parsed.problems.map(({ kind }) => kind)).toEqual(['userUnparsed'])
  })
})

describe('an entry that parsed', () => {
  it('is an initial user carrying its position and the fields a check reads', () => {
    expect(read([record({ mobile: '+260911111111' })]).users[0]).toMatchObject({
      position: 1,
      username: 'k.mweene',
      email: 'k.mweene@x.com',
      mobile: '+260911111111',
      primaryOfficeId: 'ibombo_HPGiE9Jjh2r',
      role: 'LOCAL_REGISTRAR'
    })
  })

  it('carries the payload the write path sends, renamed as the server wants it', () => {
    expect(read([record()]).users[0].payload).toMatchObject({
      firstname: 'Kennedy',
      surname: 'Mweene',
      password: 'test'
    })
  })

  it('needs an email or a mobile number, and one is enough', () => {
    expect(read([record({ email: undefined, mobile: '+260911111111' })]).users)
      .toHaveLength(1)
    expect(read([record({ email: undefined, mobile: undefined })].map((r) => r))
      .problems.map(({ kind }) => kind)).toEqual(['userUnparsed'])
  })

  it('is rejected for an unrecognised field rather than having it dropped', () => {
    expect(read([record({ givenName: 'Kennedy' })]).problems).toHaveLength(1)
  })
})

describe('duplicate emails', () => {
  it('are a problem about the second initial user, naming the first', () => {
    expect(
      read([
        record({ username: 'k.mweene', email: 'k.mweene@x.com' }),
        record({ username: 'f.katongo', email: 'f.katongo@x.com' }),
        record({ username: 'e.mweene', email: 'k.mweene@x.com' })
      ]).problems
    ).toEqual([
      {
        kind: 'duplicateUserField',
        user: { position: 3, username: 'e.mweene' },
        field: 'email',
        value: 'k.mweene@x.com',
        firstSeenAt: 1
      }
    ])
  })

  it('include two spellings of one address, since emails are lowercased on write', () => {
    expect(
      read([
        record({ username: 'one.user', email: 'K.Mweene@X.com' }),
        record({ username: 'two.user', email: 'k.mweene@x.com' })
      ]).problems
    ).toMatchObject([{ field: 'email', value: 'k.mweene@x.com' }])
  })
})

describe('duplicate mobile numbers', () => {
  it('are a problem about the second initial user, naming the first', () => {
    expect(
      read([
        record({ username: 'k.mweene', mobile: '+260911111111' }),
        record({
          username: 'f.katongo',
          email: 'f.katongo@x.com',
          mobile: '+260911111111'
        })
      ]).problems
    ).toMatchObject([
      {
        kind: 'duplicateUserField',
        user: { position: 2, username: 'f.katongo' },
        field: 'mobile',
        firstSeenAt: 1
      }
    ])
  })
})

describe('duplicate usernames', () => {
  it('are a problem rather than letting the write path renumber one', () => {
    // The service renumbers colliding usernames when it creates a user, which
    // is right for self-service creation but wrong at seed time.
    expect(
      read([
        record({ username: 'k.mweene', email: 'one@x.com' }),
        record({ username: 'k.mweene', email: 'two@x.com' })
      ]).problems
    ).toMatchObject([
      {
        kind: 'duplicateUserField',
        user: { position: 2, username: 'k.mweene' },
        field: 'username',
        value: 'k.mweene'
      }
    ])
  })
})

describe('one initial user duplicating three fields', () => {
  it('is three problems, one per field', () => {
    expect(
      read([
        record({
          username: 'k.mweene',
          email: 'k.mweene@x.com',
          mobile: '+260911111111'
        }),
        record({
          username: 'k.mweene',
          email: 'k.mweene@x.com',
          mobile: '+260911111111'
        })
      ]).problems.map((problem) =>
        problem.kind === 'duplicateUserField' ? problem.field : problem.kind
      )
    ).toEqual(['email', 'mobile', 'username'])
  })
})
