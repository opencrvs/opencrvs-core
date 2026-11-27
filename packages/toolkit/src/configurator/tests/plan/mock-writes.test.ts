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
import { MockGitHub } from '../../ui/github/mock'
import { MockLocalServer } from '../../ui/local/mock'
import { answersFor } from './answers'

describe('MockGitHub writes', () => {
  it('shows what was written when it is read again', async () => {
    const github = new MockGitHub('fresh', 0)
    await github.createEnvironment('qa')
    await github.putVariable({ scope: 'environment', environment: 'qa', name: 'DOMAIN', value: 'x.example' })
    await github.putSecret({ scope: 'environment', environment: 'qa', name: 'ENCRYPTION_KEY', value: 'k' })
    await github.putVariable({ scope: 'repository', name: 'REGISTRY_HOST', value: 'ghcr.io' })
    expect(await github.listEnvironments()).toEqual(['qa'])
    expect(await github.readEnvironment('qa')).toEqual({ variables: { DOMAIN: 'x.example' }, secretNames: ['ENCRYPTION_KEY'] })
    expect((await github.readRepository()).variables).toEqual({ REGISTRY_HOST: 'ghcr.io' })
    expect(github.writtenSecrets).toEqual({ 'environment/qa:ENCRYPTION_KEY': 'k' })
  })

  it('keeps repository, environments and instances apart', async () => {
    const one = new MockGitHub('name-taken', 0)
    const other = new MockGitHub('name-taken', 0)
    await one.putVariable({ scope: 'environment', environment: 'staging', name: 'A', value: '1' })
    expect((await one.readEnvironment('production')).variables).toEqual({})
    expect((await one.readRepository()).variables).toEqual({})
    expect((await other.readEnvironment('staging')).variables).toEqual({})
  })

  it('refuses to write into an environment that does not exist', async () => {
    await expect(new MockGitHub('fresh', 0).putVariable({ scope: 'environment', environment: 'nope', name: 'A', value: 'b' })).rejects.toThrow('Not found')
  })
})

describe('MockLocalServer writes', () => {
  it('renders without writing, then writes, and the environment appears', async () => {
    const local = new MockLocalServer()
    const rendered = await local.renderFiles('prod', answersFor('prod'))
    expect(rendered.map((file) => file.existing)).toEqual([null, null, null, null])
    expect((await local.listEnvironments()).names).toEqual([])

    expect(await local.writeFiles('prod', answersFor('prod'))).toEqual(['prod/inventory.yml', 'prod/dependencies/values.yaml', 'prod/traefik/values.yaml', 'prod/opencrvs-services/values.yaml'])
    expect((await local.listEnvironments()).names).toEqual(['prod'])
    const again = await local.renderFiles('prod', answersFor('prod'))
    expect(again.every((file) => file.existing === file.text)).toBe(true)
  })

  it('in the flat layout writes only the flat file, and shows the other as having no place', async () => {
    const local = new MockLocalServer({ staging: { 'inventory.yml': 'old: true\n' } }, null, 'files')
    const rendered = await local.renderFiles('prod', answersFor('prod'))
    expect(rendered.map((file) => [file.path, file.target])).toEqual([['inventory.yml', 'prod.yaml'], ['dependencies/values.yaml', null], ['traefik/values.yaml', null], ['opencrvs-services/values.yaml', null]])
    expect(await local.writeFiles('prod', answersFor('prod'))).toEqual(['prod.yaml'])
    expect(Object.keys(await local.readEnvironmentFiles('prod'))).toEqual(['inventory.yml'])
  })
})
