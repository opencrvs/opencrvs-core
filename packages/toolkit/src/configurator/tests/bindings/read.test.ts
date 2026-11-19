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
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { bindings, scanned } from '../../ui/bindings/load'
import { PARSERS } from '../../ui/bindings/parsers'
import { readFileCandidates } from '../../ui/bindings/read'
import { FIXTURES, renderFixture } from '../../scripts/fixtures'

const readTemplate = (path: string) => readFileSync(join(__dirname, '../../templates', path), 'utf8')
const candidates = (environment: string) => readFileCandidates(renderFixture(environment, readTemplate), bindings, scanned)
const values = (environment: string, question: string) => candidates(environment)[question]?.map((c) => c.value)

describe('reading rendered files back through the bindings', () => {
  it('reads a fully configured environment (prod)', () => {
    expect(values('prod', 'KUBE_API_HOST')).toEqual(['10.3.0.5'])
    expect(values('prod', 'WORKER_NODES')).toEqual([[{ ip: '10.3.0.11' }, { ip: '10.3.0.12' }]])
    expect(values('prod', 'BACKUP_ENVIRONMENT_MODE')).toEqual(['differential'])
    expect(values('prod', 'USERS')).toEqual([
      [
        { name: 'alice', role: 'admin', state: 'present', ssh_keys: expect.stringContaining('\n') },
        { name: 'bob', role: 'operator', state: 'present', ssh_keys: expect.stringMatching(/^ssh-rsa /) }
      ]
    ])
    expect(values('prod', 'RESTORE_HOST')).toBeUndefined()
  })

  it('finds a value in every file that holds it (one-to-many)', () => {
    const backupHost = candidates('prod').BACKUP_HOST
    expect(backupHost?.map((c) => [c.origin, c.value])).toEqual([
      ['inventory.yml', '203.0.113.9'],
      ['dependencies/values.yaml', '203.0.113.9']
    ])
  })

  it('reads restore settings, including the environment name hidden in a path (uat)', () => {
    expect(values('uat', 'RESTORE_ENVIRONMENT_NAME')).toEqual(['prod'])
    expect(values('uat', 'RESTORE_ENVIRONMENT_MODE')).toEqual(['dump'])
    expect(values('uat', 'RESTORE_HOST')).toEqual(['203.0.113.20'])
    expect(values('uat', 'BACKUP_HOST')).toBeUndefined()
  })

  it('reads nothing for settings an environment does not use (dev)', () => {
    expect(values('dev', 'KUBE_API_HOST')).toBeUndefined() // empty in the file
    expect(values('dev', 'WORKER_NODES')).toBeUndefined()
    expect(values('dev', 'BACKUP_HOST')).toBeUndefined()
    expect(values('dev', 'RESTORE_ENVIRONMENT_NAME')).toBeUndefined()
    expect(values('dev', 'USERS')).toHaveLength(1)
  })

  it.each(Object.keys(FIXTURES))('round-trips the users of %s', (environment) => {
    const [rows] = values(environment, 'USERS') as [{ name: string; role: string; state: string; ssh_keys: string }[]]
    expect(rows.map(({ name, role, state }) => ({ name, role, state }))).toEqual(
      FIXTURES[environment]!.inventory.users.map(({ name, role, state }) => ({ name, role, state }))
    )
    expect(rows.map((row) => (row.ssh_keys ? row.ssh_keys.split('\n') : []))).toEqual(
      FIXTURES[environment]!.inventory.users.map((user) => user.ssh_keys)
    )
  })

  it.each(Object.keys(FIXTURES))('round-trips the workers and API host of %s', (environment) => {
    const { kube_api_host, kube_worker_nodes } = FIXTURES[environment]!.inventory
    expect(values(environment, 'KUBE_API_HOST')?.[0]).toBe(kube_api_host || undefined)
    expect((values(environment, 'WORKER_NODES')?.[0] as { ip: string }[] | undefined)?.map((row) => row.ip) ?? []).toEqual(
      kube_worker_nodes
    )
  })

  it('ignores files that are missing and questions without a file target', () => {
    expect(readFileCandidates({}, bindings, scanned)).toEqual({})
    expect(candidates('prod').DOMAIN).toBeUndefined()
  })

  it('reads old-style users (sudoer) as admin or operator', () => {
    const old = readFileCandidates(
      { 'inventory.yml': 'all:\n  vars:\n    users:\n      - { name: old, sudoer: true, ssh_keys: [] }\n      - { name: lite, ssh_keys: [] }\n' },
      bindings,
      scanned
    )
    expect(old.USERS?.[0]?.value).toEqual([
      { name: 'old', role: 'admin', state: 'present', ssh_keys: '' },
      { name: 'lite', role: 'operator', state: 'present', ssh_keys: '' }
    ])
  })
})

describe('parsers', () => {
  it('string trims and drops empty values', () => {
    expect(PARSERS.string!(' a ')).toBe('a')
    expect(PARSERS.string!('')).toBeUndefined()
    expect(PARSERS.string!(null)).toBeUndefined()
    expect(PARSERS.string!(587)).toBe('587')
  })

  it('boolean understands the strings GitHub stores', () => {
    expect(PARSERS.boolean!('true')).toBe(true)
    expect(PARSERS.boolean!('false')).toBe(false)
    expect(PARSERS.boolean!(true)).toBe(true)
    expect(PARSERS.boolean!('maybe')).toBeUndefined()
  })

  it('csv-to-ip-rows reads a GitHub list, where empty means no workers', () => {
    expect(PARSERS['csv-to-ip-rows']!('10.0.0.1, 10.0.0.2')).toEqual([{ ip: '10.0.0.1' }, { ip: '10.0.0.2' }])
    expect(PARSERS['csv-to-ip-rows']!('')).toEqual([])
    expect(PARSERS['csv-to-ip-rows']!(undefined)).toBeUndefined()
  })
})
