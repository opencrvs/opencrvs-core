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
import { bindings, scanned } from '../../ui/bindings/load'
import { loadSnapshot } from '../../ui/bindings/snapshot'
import { activeValues } from '../../ui/form/active'
import { MockGitHub, type Scenario } from '../../ui/github/mock'
import { MockLocalServer } from '../../ui/local/mock'
import { changedLines, lineDiff } from '../../ui/plan/diff'
import { renderEnvFile } from '../../ui/plan/envFile'
import { buildPlan, writes } from '../../ui/plan/plan'
import { makeSurvey, question } from '../form/helpers'

async function plan(environment: string, values: Record<string, unknown>, scenario: Scenario = 'existing', github = true) {
  const snapshot = await loadSnapshot(environment, { github: github ? new MockGitHub(scenario, 0) : undefined, local: new MockLocalServer() }, bindings, scanned)
  return buildPlan({ environment, values, snapshot, bindings })
}
const item = (p: Awaited<ReturnType<typeof plan>>, name: string) => p.items.find((candidate) => candidate.name === name)

describe('buildPlan', () => {
  it('creates a new environment and marks everything as new', async () => {
    const result = await plan('brand-new', { DOMAIN: 'x.example', SMTP_HOST: 'smtp.example.org', ENCRYPTION_KEY: 'k' }, 'fresh')
    expect(result.createEnvironment).toBe(true)
    expect(result.items.map((i) => [i.name, i.kind, i.scope, i.status])).toEqual([
      ['DOMAIN', 'variable', 'environment', 'new'],
      ['SMTP_HOST', 'secret', 'environment', 'new'],
      ['ENCRYPTION_KEY', 'secret', 'environment', 'new']
    ])
  })

  it('does not create an environment that exists, and compares values with what is there', async () => {
    const result = await plan('qa', { DOMAIN: 'qa.opencrvs.example', KUBE_API_HOST: '10.1.0.5', ACTIVATE_USERS: true })
    expect(result.createEnvironment).toBe(false)
    expect(item(result, 'DOMAIN')?.status).toBe('unchanged') // same as on GitHub
    expect(item(result, 'KUBE_API_HOST')).toMatchObject({ status: 'update', value: '10.1.0.5' }) // GitHub has 10.1.0.77
    expect(item(result, 'ACTIVATE_USERS')).toMatchObject({ status: 'unchanged', value: 'true' })
  })

  it('treats an entered secret as an update, and an empty existing one as kept', async () => {
    const result = await plan('qa', { SMTP_HOST: 'new.example.org', SMTP_PORT: '' })
    expect(item(result, 'SMTP_HOST')).toMatchObject({ status: 'update', value: 'new.example.org' })
    expect(item(result, 'SMTP_PORT')).toMatchObject({ status: 'keep', value: '' })
  })

  it('writes nothing for a secret that is empty and does not exist', async () => {
    expect(item(await plan('brand-new', {}, 'fresh'), 'SMTP_HOST')).toBeUndefined()
  })

  it('notes an older secret name, and writes the current one', async () => {
    const result = await plan('brand-new', { REGISTRY_TOKEN: 't' }, 'fresh')
    expect(item(result, 'REGISTRY_TOKEN')).toMatchObject({ status: 'new', scope: 'repository' })
    const renamed = buildPlan({
      environment: 'x',
      values: { REGISTRY_TOKEN: 't' },
      snapshot: { environment: 'x', exists: { github: true, files: false }, values: {}, origins: {}, definedSecrets: [], conflicts: [], github: { repository: { variables: {}, secretNames: ['DOCKER_TOKEN'] }, environment: { variables: {}, secretNames: [] } } },
      bindings
    })
    expect(renamed.items[0]).toMatchObject({ name: 'REGISTRY_TOKEN', status: 'new', note: expect.stringContaining('DOCKER_TOKEN') })
  })

  it('writes repository items before environment items, variables before secrets', async () => {
    const result = await plan('brand-new', { ENCRYPTION_KEY: 'k', DOMAIN: 'd', REGISTRY_TOKEN: 't', REGISTRY_HOST: 'ghcr.io' }, 'fresh')
    expect(result.items.map((i) => `${i.scope}:${i.kind}:${i.name}`)).toEqual([
      'repository:variable:REGISTRY_HOST',
      'repository:secret:REGISTRY_TOKEN',
      'environment:variable:DOMAIN',
      'environment:secret:ENCRYPTION_KEY'
    ])
  })

  it('writes the table as a comma list, and booleans as text, but never an empty variable', async () => {
    const result = await plan('brand-new', { WORKER_NODES: [{ ip: '10.0.0.2' }, { ip: '10.0.0.3' }], ACTIVATE_USERS: false }, 'fresh')
    expect(item(result, 'KUBE_WORKER_NODES')?.value).toBe('10.0.0.2,10.0.0.3')
    expect(item(result, 'ACTIVATE_USERS')?.value).toBe('false')
    expect((await plan('brand-new', { WORKER_NODES: [] }, 'fresh')).items).toEqual([])
  })

  it('writes KUBE_WORKER_NODES from the worker table, in row order, without rows that have no address', async () => {
    const rows = [{ ip: '10.0.0.1' }, { ip: '' }, {}, { ip: ' 10.0.0.2 ' }, { ip: '10.0.0.3' }]
    expect(item(await plan('brand-new', { WORKER_NODES: rows }, 'fresh'), 'KUBE_WORKER_NODES')).toMatchObject({
      kind: 'variable',
      scope: 'environment',
      status: 'new',
      value: '10.0.0.1,10.0.0.2,10.0.0.3'
    })
  })

  it('updates KUBE_WORKER_NODES when the rows change, and says nothing when they do not', async () => {
    // the "staging" scenario has KUBE_WORKER_NODES=10.9.0.11,10.9.0.12
    const changed = await plan('staging', { WORKER_NODES: [{ ip: '10.9.0.11' }, { ip: '10.9.0.99' }] }, 'existing')
    expect(item(changed, 'KUBE_WORKER_NODES')).toMatchObject({ status: 'update', value: '10.9.0.11,10.9.0.99' })
    const same = await plan('staging', { WORKER_NODES: [{ ip: '10.9.0.11' }, { ip: '10.9.0.12' }] }, 'existing')
    expect(item(same, 'KUBE_WORKER_NODES')).toMatchObject({ status: 'unchanged' })
  })

  it('has nothing to write on GitHub when GitHub was skipped', async () => {
    const result = await plan('qa', { DOMAIN: 'x', ENCRYPTION_KEY: 'k' }, 'existing', false)
    expect(result).toEqual({ environment: 'qa', github: false, createEnvironment: false, items: [] })
  })

  it('lists only the changes that write something', async () => {
    const result = await plan('qa', { DOMAIN: 'qa.opencrvs.example', KUBE_API_HOST: '10.1.0.5', SMTP_PORT: '' })
    expect(writes(result).map((i) => i.name)).toEqual(['KUBE_API_HOST'])
  })
})

describe('activeValues', () => {
  it('leaves out answers on hidden pages and in hidden panels', async () => {
    const { survey } = await makeSurvey('fresh')
    survey.setValue('DOMAIN', 'd.example')
    survey.setValue('SMTP_HOST', 'typed-before-the-switch-was-off')
    survey.setValue('KUBE_API_HOST', '10.0.0.1')
    survey.setValue('CONFIGURE_INFRASTRUCTURE', true)
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    survey.setValue('BACKUP_HOST', '203.0.113.9')
    survey.setValue('RESTORE_HOST', '203.0.113.20') // the restore panel is hidden

    const values = activeValues(survey)
    expect(values.DOMAIN).toBe('d.example')
    expect(values.KUBE_API_HOST).toBe('10.0.0.1')
    expect(values.BACKUP_HOST).toBe('203.0.113.9')
    expect(values).not.toHaveProperty('SMTP_HOST') // email is switched off
    expect(values).not.toHaveProperty('RESTORE_HOST')

    survey.setValue('CONFIGURE_INFRASTRUCTURE', false)
    expect(activeValues(survey)).not.toHaveProperty('KUBE_API_HOST')
  })

  it('keeps false, and drops empty values', async () => {
    const { survey } = await makeSurvey('fresh')
    survey.setValue('DOMAIN', '')
    survey.setValue('ACTIVATE_USERS', false)
    const values = activeValues(survey)
    expect(values.ACTIVATE_USERS).toBe(false)
    expect(values).not.toHaveProperty('DOMAIN')
  })

  it('includes secrets, so it is only for the plan', async () => {
    const { survey } = await makeSurvey('fresh')
    expect(activeValues(survey).OPENCRVS_METABASE_ADMIN_PASSWORD).toBe(question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').value)
    expect(activeValues(survey).OPENCRVS_METABASE_ADMIN_PASSWORD).toMatch(/^[0-9a-zA-Z]{16}$/)
  })
})

describe('renderEnvFile', () => {
  it('lists every value the plan writes, quoting what needs it, and leaves out kept secrets', async () => {
    const result = await plan('qa', { DOMAIN: 'qa.example.org', SMTP_PASSWORD: 'p@ss word "x" $HOME', SMTP_PORT: '', ENCRYPTION_KEY: 'a\\b' })
    const text = renderEnvFile(result)
    expect(text).toContain('DOMAIN=qa.example.org\n')
    expect(text).toContain('SMTP_PASSWORD="p@ss word \\"x\\" \\$HOME"\n')
    expect(text).toContain('ENCRYPTION_KEY="a\\\\b"\n')
    expect(text).not.toContain('SMTP_PORT')
    expect(text.split('\n')[0]).toContain('qa')
    expect(text).toContain('contains secrets')
  })
})

describe('lineDiff', () => {
  it('marks added and removed lines and keeps the rest', () => {
    expect(lineDiff('a\nb\nc', 'a\nx\nc')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'remove', text: 'b' },
      { type: 'add', text: 'x' },
      { type: 'same', text: 'c' }
    ])
  })

  it('handles empty sides and identical text', () => {
    expect(changedLines(lineDiff('a\nb', 'a\nb'))).toBe(0)
    expect(lineDiff('', 'a').map((line) => line.type)).toEqual(['remove', 'add']) // '' is one empty line
    expect(changedLines(lineDiff('a', 'a\nb\nc'))).toBe(2)
  })
})
