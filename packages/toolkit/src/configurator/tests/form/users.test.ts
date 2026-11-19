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
import { settings, type Model, type QuestionMatrixDynamicModel } from 'survey-core'
import { afterEach, describe, expect, it } from 'vitest'
import {
  areValidKeys,
  countUsersWithoutKeys,
  parseKeys,
  rowsToUsers,
  type User
} from '../../ui/form/users'
import { makeSurvey, pageVisible, question } from './helpers'

const ED25519 = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl alice@laptop'
const RSA = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7 bob@server'

async function setup() {
  const { survey } = await makeSurvey()
  const table = question(survey, 'USERS') as QuestionMatrixDynamicModel
  const add = (values: Record<string, unknown>) => {
    table.addRow()
    const row = table.visibleRows![table.rowCount - 1]!
    for (const [name, value] of Object.entries(values)) row.getQuestionByName(name)!.value = value
    return row
  }
  const users = () => rowsToUsers(table.value)
  return { survey, table, add, users }
}

const warningVisible = (survey: Model) => question(survey, 'USERS_WITHOUT_KEYS_WARNING').isVisible

describe('users page', () => {
  it('sits after the Kubernetes page, before backup', async () => {
    const { survey } = await makeSurvey()
    const names = survey.pages.map((page) => page.name)
    expect(names.indexOf('users')).toBe(names.indexOf('cluster') + 1)
    expect(pageVisible(survey, 'users')).toBe(true) // Infrastructure is on by default
    survey.setValue('CONFIGURE_INFRASTRUCTURE', false)
    expect(pageVisible(survey, 'users')).toBe(false)
  })

  it('allows zero users, as the CLI does', async () => {
    const { survey, table } = await setup()
    expect(table.rowCount).toBe(0)
    expect(table.hasErrors(true)).toBe(false)
    expect(warningVisible(survey)).toBe(false)
  })

  it('adds a user with least-privilege defaults', async () => {
    const { table, add, users } = await setup()
    add({ name: 'alice', ssh_keys: ED25519 })
    expect(table.rowCount).toBe(1)
    expect(users()).toEqual<User[]>([
      { name: 'alice', ssh_keys: [ED25519], state: 'present', role: 'operator' }
    ])
  })

  it('edits role, state and keys of an existing user', async () => {
    const { add, users } = await setup()
    const row = add({ name: 'alice', ssh_keys: ED25519 })
    row.getQuestionByName('role')!.value = 'admin'
    row.getQuestionByName('state')!.value = 'absent'
    row.getQuestionByName('ssh_keys')!.value = `${ED25519}\n${RSA}`
    expect(users()).toEqual([{ name: 'alice', ssh_keys: [ED25519, RSA], state: 'absent', role: 'admin' }])
  })

  describe('removing a user asks for confirmation', () => {
    const original = settings.confirmActionAsync
    afterEach(() => {
      settings.confirmActionAsync = original
    })
    const answer = (choice: boolean, asked: string[]) => {
      settings.confirmActionAsync = (message, callback) => {
        asked.push(message)
        callback(choice)
        return true
      }
    }

    it('removes the user when confirmed', async () => {
      const { table, add, users } = await setup()
      add({ name: 'alice', ssh_keys: ED25519 })
      add({ name: 'bob', ssh_keys: RSA })
      const asked: string[] = []
      answer(true, asked)
      table.removeRow(0)
      expect(asked).toEqual(['Remove this user?'])
      expect(users().map((user) => user.name)).toEqual(['bob'])
    })

    it('keeps the user when declined', async () => {
      const { table, add, users } = await setup()
      add({ name: 'alice', ssh_keys: ED25519 })
      answer(false, [])
      table.removeRow(0)
      expect(users().map((user) => user.name)).toEqual(['alice'])
    })
  })

  it.each(['Alice', '1user', 'a b', 'bad!', ''])('rejects the username %j', async (name) => {
    const { table, add } = await setup()
    add({ name, ssh_keys: ED25519 })
    expect(table.hasErrors(true)).toBe(true)
  })

  it.each(['alice', '_svc', 'ops-team', 'deploy_1', 'machine$'])('accepts the username %j', async (name) => {
    const { table, add } = await setup()
    add({ name, ssh_keys: ED25519 })
    expect(table.hasErrors(true)).toBe(false)
  })

  it('rejects duplicate usernames', async () => {
    const { table, add } = await setup()
    add({ name: 'alice', ssh_keys: ED25519 })
    add({ name: 'alice', ssh_keys: RSA })
    expect(table.hasErrors(true)).toBe(true)
    const nameErrors = table.visibleRows!.map((row) =>
      row.getQuestionByName('name')!.errors.map((error) => error.getText())
    )
    expect(nameErrors).toEqual([['User names must be unique.'], ['User names must be unique.']])
  })

  it('rejects text that is not an SSH public key, including a private key', async () => {
    const { table, add } = await setup()
    add({ name: 'alice', ssh_keys: 'hello world' })
    expect(table.hasErrors(true)).toBe(true)

    const { table: other, add: addOther } = await setup()
    addOther({ name: 'alice', ssh_keys: '-----BEGIN OPENSSH PRIVATE KEY-----\nabc\n-----END OPENSSH PRIVATE KEY-----' })
    expect(other.hasErrors(true)).toBe(true)
  })

  it('warns, without blocking, about users with no SSH keys', async () => {
    const { survey, table, add } = await setup()
    add({ name: 'alice' })
    expect(table.hasErrors(true)).toBe(false)
    expect(warningVisible(survey)).toBe(true)

    table.visibleRows![0]!.getQuestionByName('ssh_keys')!.value = ED25519
    expect(warningVisible(survey)).toBe(false)
  })
})

describe('user helpers', () => {
  it('parses keys like the CLI: trims lines and skips blanks and # comments', () => {
    expect(parseKeys(`  ${ED25519}  \n\n# old key\n${RSA}\n`)).toEqual([ED25519, RSA])
    expect(parseKeys(undefined)).toEqual([])
  })

  it('validates key types', () => {
    expect(areValidKeys('')).toBe(true) // no keys is allowed, with a warning
    expect(areValidKeys(`${ED25519}\n# note\n${RSA}`)).toBe(true)
    expect(areValidKeys('ecdsa-sha2-nistp256 AAAAE2VjZHNh user')).toBe(true)
    expect(areValidKeys('ssh-ed25519')).toBe(false)
    expect(areValidKeys(`${ED25519}\nnot a key`)).toBe(false)
  })

  it('turns table rows into inventory users', () => {
    const rows = [
      { name: 'alice', role: 'admin', state: 'present', ssh_keys: `${ED25519}\n${RSA}` },
      { name: 'bob', role: 'operator', state: 'absent', ssh_keys: '' }
    ] as const
    const users: User[] = [
      { name: 'alice', ssh_keys: [ED25519, RSA], state: 'present', role: 'admin' },
      { name: 'bob', ssh_keys: [], state: 'absent', role: 'operator' }
    ]
    expect(rowsToUsers(rows)).toEqual(users)
  })

  it('ignores rows without a name and counts users without keys', () => {
    const rows = [{ name: 'alice', ssh_keys: ED25519 }, { name: '  ' }, {}, { name: 'bob' }]
    expect(rowsToUsers(rows).map((user) => user.name)).toEqual(['alice', 'bob'])
    expect(countUsersWithoutKeys(rows)).toBe(1)
  })
})

describe('help text', () => {
  it('sits at the top of the page, with the roles in bold', async () => {
    const { survey } = await makeSurvey()
    const page = survey.getPageByName('users')!
    expect(page.elements[0]!.name).toBe('USERS_HELP')
    const html = (question(survey, 'USERS_HELP') as unknown as { html: string }).html
    expect(html).toContain('<strong>Admin</strong>')
    expect(html).toContain('<strong>Operator</strong>')
    expect(html).toContain('<li>') // one line per role
  })
})
