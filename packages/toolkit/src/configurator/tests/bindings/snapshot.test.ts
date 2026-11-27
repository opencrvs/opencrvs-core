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
import { FIXTURES, renderFixture } from '../../scripts/fixtures'
import type { Bindings } from '../../ui/bindings/bindings'
import { bindings, scanned } from '../../ui/bindings/load'
import { buildSnapshot, loadSnapshot, readGitHubCandidates } from '../../ui/bindings/snapshot'
import { MockGitHub } from '../../ui/github/mock'
import { MockLocalServer } from '../../ui/local/mock'

const readTemplate = (path: string) => readFileSync(join(__dirname, '../../templates', path), 'utf8')
const local = () =>
  new MockLocalServer(Object.fromEntries(Object.keys(FIXTURES).map((name) => [name, renderFixture(name, readTemplate)])))
const nothing = { variables: {}, secretNames: [] }

describe('readGitHubCandidates', () => {
  it('reads variables by name and applies the parser', () => {
    const { candidates } = readGitHubCandidates(
      nothing,
      { variables: { DOMAIN: 'a.example', ACTIVATE_USERS: 'true', KUBE_WORKER_NODES: '10.0.0.1,10.0.0.2' }, secretNames: [] },
      bindings
    )
    expect(candidates.DOMAIN).toEqual([{ source: 'github', origin: 'DOMAIN', value: 'a.example' }])
    expect(candidates.ACTIVATE_USERS?.[0]?.value).toBe(true)
    // the table question reads the KUBE_WORKER_NODES variable
    expect(candidates.WORKER_NODES?.[0]).toEqual({
      source: 'github',
      origin: 'KUBE_WORKER_NODES',
      value: [{ ip: '10.0.0.1' }, { ip: '10.0.0.2' }]
    })
  })

  it('reports secrets as defined, by name only', () => {
    const { candidates, definedSecrets } = readGitHubCandidates(
      nothing,
      { variables: {}, secretNames: ['SMTP_HOST', 'ENCRYPTION_KEY'] },
      bindings
    )
    expect(definedSecrets.sort()).toEqual(['ENCRYPTION_KEY', 'SMTP_HOST'])
    expect(candidates.SMTP_HOST).toBeUndefined() // there is no value to read
  })

  it('knows the earlier names of renamed secrets', () => {
    const { definedSecrets } = readGitHubCandidates(
      { variables: {}, secretNames: ['DOCKERHUB_ACCOUNT', 'DOCKER_TOKEN'] },
      { variables: {}, secretNames: ['MINIO_ROOT_PASSWORD'] },
      bindings
    )
    expect(definedSecrets.sort()).toEqual(['REGISTRY_ORGANISATION', 'REGISTRY_TOKEN', 'S3_ADMIN_SECRET_KEY'])
  })

  it('keeps repository and environment values apart', () => {
    const { candidates } = readGitHubCandidates(
      { variables: { REGISTRY_HOST: 'ghcr.io', DOMAIN: 'wrong-scope' }, secretNames: [] },
      { variables: { REGISTRY_HOST: 'wrong-scope', DOMAIN: 'right' }, secretNames: [] },
      bindings
    )
    expect(candidates.REGISTRY_HOST?.[0]?.value).toBe('ghcr.io')
    expect(candidates.DOMAIN?.[0]?.value).toBe('right')
  })

  it('treats an empty KUBE_WORKER_NODES as "no workers", not as missing', () => {
    const { candidates } = readGitHubCandidates(nothing, { variables: { KUBE_WORKER_NODES: '' }, secretNames: [] }, bindings)
    expect(candidates.WORKER_NODES?.[0]?.value).toEqual([])
  })
})

describe('buildSnapshot', () => {
  const files = { exists: true, contents: renderFixture('prod', readTemplate) }
  const github = (variables: Record<string, string>) => ({ exists: true, repository: nothing, environment: { variables, secretNames: [] } })

  it('lets GitHub win by default and records the disagreement', () => {
    const snapshot = buildSnapshot({ environment: 'prod', github: github({ KUBE_API_HOST: '10.9.9.9' }), files }, bindings, scanned)
    expect(snapshot.values.KUBE_API_HOST).toBe('10.9.9.9')
    expect(snapshot.origins.KUBE_API_HOST).toBe('KUBE_API_HOST')
    expect(snapshot.conflicts).toEqual([
      {
        question: 'KUBE_API_HOST',
        winner: { source: 'github', origin: 'KUBE_API_HOST', value: '10.9.9.9' },
        others: [{ source: 'file', origin: 'inventory.yml', value: '10.3.0.5' }]
      }
    ])
  })

  it('uses a file value when GitHub has none, without a conflict', () => {
    const snapshot = buildSnapshot({ environment: 'prod', github: github({}), files }, bindings, scanned)
    expect(snapshot.values.KUBE_API_HOST).toBe('10.3.0.5')
    expect(snapshot.origins.KUBE_API_HOST).toBe('inventory.yml')
    expect(snapshot.conflicts).toEqual([])
  })

  it('does not report sources that agree', () => {
    const snapshot = buildSnapshot({ environment: 'prod', github: github({ BACKUP_HOST: '203.0.113.9' }), files }, bindings, scanned)
    expect(snapshot.values.BACKUP_HOST).toBe('203.0.113.9')
    expect(snapshot.conflicts.map((conflict) => conflict.question)).not.toContain('BACKUP_HOST')
  })

  it('can be told to prefer files over GitHub', () => {
    const snapshot = buildSnapshot({ environment: 'prod', github: github({ KUBE_API_HOST: '10.9.9.9' }), files }, bindings, scanned, {
      precedence: ['file', 'github']
    })
    expect(snapshot.values.KUBE_API_HOST).toBe('10.3.0.5')
    expect(snapshot.conflicts[0]?.winner.source).toBe('file')
  })

  it('lets one binding override the global order', () => {
    const custom: Bindings = {
      ...bindings,
      bindings: { ...bindings.bindings, KUBE_API_HOST: { ...bindings.bindings.KUBE_API_HOST!, precedence: ['file', 'github'] } }
    }
    const snapshot = buildSnapshot({ environment: 'prod', github: github({ KUBE_API_HOST: '10.9.9.9', BACKUP_HOST: '1.1.1.1' }), files }, custom, scanned)
    expect(snapshot.values.KUBE_API_HOST).toBe('10.3.0.5') // overridden binding
    expect(snapshot.values.BACKUP_HOST).toBe('1.1.1.1') // everything else still GitHub first
  })

  it('collects one value from several targets and reports files that disagree among themselves', () => {
    const disagreeing = {
      ...files.contents,
      'dependencies/values.yaml': files.contents['dependencies/values.yaml']!.replace('host: 203.0.113.9', 'host: 198.51.100.7')
    }
    const snapshot = buildSnapshot({ environment: 'prod', files: { exists: true, contents: disagreeing } }, bindings, scanned)
    expect(snapshot.values.BACKUP_HOST).toBe('203.0.113.9') // first target in bindings.yml
    expect(snapshot.conflicts[0]).toMatchObject({
      question: 'BACKUP_HOST',
      others: [{ origin: 'dependencies/values.yaml', value: '198.51.100.7' }]
    })
  })

  it('works with GitHub alone, files alone, or neither', () => {
    expect(buildSnapshot({ environment: 'x', github: github({ DOMAIN: 'd' }) }, bindings, scanned).values).toEqual({ DOMAIN: 'd' })
    expect(buildSnapshot({ environment: 'x', files }, bindings, scanned).values.KUBE_API_HOST).toBe('10.3.0.5')
    expect(buildSnapshot({ environment: 'x' }, bindings, scanned)).toMatchObject({ values: {}, definedSecrets: [], conflicts: [] })
  })
})

describe('loadSnapshot', () => {
  it('merges GitHub and the local files of an environment that exists in both (qa)', async () => {
    const snapshot = await loadSnapshot('qa', { github: new MockGitHub('existing', 0), local: local() }, bindings, scanned)
    expect(snapshot.exists).toEqual({ github: true, files: true })
    expect(snapshot.values.DOMAIN).toBe('qa.opencrvs.example') // GitHub only
    expect(snapshot.values.KUBE_API_HOST).toBe('10.1.0.77') // GitHub wins over inventory.yml's 10.1.0.5
    expect(snapshot.conflicts.map((conflict) => conflict.question)).toEqual(['KUBE_API_HOST'])
    expect((snapshot.values.USERS as { name: string }[]).map((user) => user.name)).toEqual(['alice']) // files only
    expect(snapshot.definedSecrets).toContain('SMTP_HOST')
    expect(snapshot.definedSecrets).toContain('ENCRYPTION_KEY')
  })

  it('reads only GitHub for an environment without files (staging)', async () => {
    const snapshot = await loadSnapshot('staging', { github: new MockGitHub('existing', 0), local: local() }, bindings, scanned)
    expect(snapshot.exists).toEqual({ github: true, files: false })
    expect(snapshot.values.WORKER_NODES).toEqual([{ ip: '10.9.0.11' }, { ip: '10.9.0.12' }])
    expect(snapshot.values.USERS).toBeUndefined()
  })

  it('reads only the files when GitHub was skipped', async () => {
    const snapshot = await loadSnapshot('prod', { local: local() }, bindings, scanned)
    expect(snapshot.exists).toEqual({ github: false, files: true })
    expect(snapshot.values.KUBE_API_HOST).toBe('10.3.0.5')
    expect(snapshot.values.DOMAIN).toBeUndefined()
    expect(snapshot.definedSecrets).toEqual([])
  })

  it('returns an empty snapshot for a name that exists nowhere', async () => {
    const snapshot = await loadSnapshot('brand-new', { github: new MockGitHub('existing', 0), local: local() }, bindings, scanned)
    expect(snapshot.exists).toEqual({ github: false, files: false })
    expect(snapshot.values).toEqual({})
  })

  it('never puts a secret value in the snapshot', async () => {
    const snapshot = await loadSnapshot('production', { github: new MockGitHub('existing', 0), local: local() }, bindings, scanned)
    const secretQuestions = ['SMTP_PASSWORD', 'ENCRYPTION_KEY', 'POSTGRES_PASSWORD', 'REGISTRY_TOKEN', 'BACKUP_SERVER_USER']
    for (const question of secretQuestions) expect(snapshot.values).not.toHaveProperty(question)
    expect(snapshot.definedSecrets).toEqual(expect.arrayContaining(['SMTP_PASSWORD', 'BACKUP_SERVER_USER']))
  })
})
