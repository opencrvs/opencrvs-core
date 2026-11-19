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

import { afterEach, describe, expect, it } from 'vitest'
import {
  APPLICATION_WORKFLOWS,
  INFRASTRUCTURE_WORKFLOWS,
  WorkflowFormatError,
  applyWorkflowUpdates,
  listEnvironments,
  planWorkflowUpdates,
  updateEnvironmentOptions
} from './workflows'
import {
  createRepository,
  environmentInput,
  read,
  removeRepositories,
  tagsInput,
  workflow
} from './testing'

afterEach(removeRepositories)

describe('updateEnvironmentOptions', () => {
  it('replaces the environment list and nothing else', () => {
    const before = workflow(environmentInput(['integration', 'demo']))

    const { content } = updateEnvironmentOptions(before, [
      'production',
      'qa',
      'staging'
    ])

    expect(content).toBe(
      before.replace(
        '          - integration\n          - demo\n',
        '          - production\n          - qa\n          - staging\n'
      )
    )
  })

  it('leaves the other options lists alone, whichever input comes first', () => {
    // The first "options:" of the file belongs to the tags here.
    const before = workflow(tagsInput, environmentInput(['old']))

    const { content } = updateEnvironmentOptions(before, ['qa', 'prod'])

    expect(content).toContain('          - all\n          - users\n')
    expect(content).toContain('          - qa\n          - prod\n')
    expect(content).not.toContain('- old')
    expect(content).toContain('options: |-\n            --verbose')
  })

  it('does not rewrite a list that already has these environments, in whatever order', () => {
    const before = workflow(environmentInput(['prod', 'qa']))

    expect(updateEnvironmentOptions(before, ['prod', 'qa']).content).toBe(
      before
    )
    expect(updateEnvironmentOptions(before, ['qa', 'prod']).content).toBe(
      before
    )
  })

  it('keeps the order of the environments already listed and appends new ones', () => {
    const before = workflow(environmentInput(['prod', 'qa']))

    expect(
      updateEnvironmentOptions(before, ['dev', 'qa', 'prod', 'uat']).content
    ).toContain(
      '          - prod\n          - qa\n          - dev\n          - uat\n'
    )
  })

  it('drops environments that are gone', () => {
    const before = workflow(environmentInput(['a', 'b', 'c']))

    expect(updateEnvironmentOptions(before, ['c', 'a']).content).toContain(
      '          - a\n          - c\n'
    )
  })

  it('keeps the indentation of the list', () => {
    // YAML allows the items of a list to sit at the same depth as their key.
    const before = workflow(environmentInput(['a'])).replace(
      / {10}- a/,
      '        - a'
    )

    expect(updateEnvironmentOptions(before, ['x', 'y']).content).toContain(
      'options:\n        - x\n        - y\n'
    )
  })

  it('keeps Windows line endings', () => {
    const before = workflow(environmentInput(['old'])).replace(/\n/g, '\r\n')

    const { content } = updateEnvironmentOptions(before, ['qa', 'prod'])

    expect(content.replace(/\r\n/g, '')).not.toContain('\n')
    expect(content).toContain('- qa\r\n          - prod\r\n')
  })

  it('handles a list at the very end of a file without a final line break', () => {
    const before = [
      'on:',
      '  workflow_dispatch:',
      '    inputs:',
      '      environment:',
      '        type: choice',
      '        options:',
      '          - a',
      '          - b'
    ].join('\n')

    expect(updateEnvironmentOptions(before, ['qa', 'prod']).content).toBe(
      before.replace('- a\n          - b', '- qa\n          - prod')
    )
  })

  it('quotes names that YAML would read as another type', () => {
    const { content } = updateEnvironmentOptions(
      workflow(environmentInput(['a'])),
      ['2024', 'true', 'qa']
    )

    expect(content).toContain('- "2024"\n          - "true"\n          - qa\n')
  })

  it('warns when the default is not one of the environments', () => {
    const before = workflow(environmentInput(['qa', 'prod'], 'development'))

    expect(updateEnvironmentOptions(before, ['qa', 'prod']).warnings).toEqual([
      expect.stringContaining('"development"')
    ])
    expect(
      updateEnvironmentOptions(before, ['development', 'qa']).warnings
    ).toEqual([])
  })

  it.each([
    ['has no environment input', workflow(tagsInput), /environment\.options/],
    [
      'has a list written inline',
      workflow(environmentInput(['a'])).replace(
        /options:\n {10}- a/,
        'options: [a, b]'
      ),
      /block list/
    ],
    [
      'has options that are not a list',
      workflow(environmentInput(['a'])).replace(
        /options:\n {10}- a/,
        'options: nope'
      ),
      /Expected a list/
    ],
    ['is not valid YAML', 'on: [unclosed', /Invalid YAML/]
  ])('rejects a workflow that %s', (_name, content, message) => {
    expect(() => updateEnvironmentOptions(content, ['qa'])).toThrow(
      WorkflowFormatError
    )
    expect(() => updateEnvironmentOptions(content, ['qa'])).toThrow(message)
  })
})

describe('listEnvironments', () => {
  it('tells the servers (inventory.yml) from the clusters (opencrvs-services)', () => {
    const root = createRepository({
      'environments/qa/inventory.yml': '',
      'environments/qa/opencrvs-services/values.yaml': '',
      'environments/backup/inventory.yml': '',
      'environments/prod/opencrvs-services/values.yaml': '',
      'environments/README.md': ''
    })

    expect(listEnvironments(root)).toEqual({
      infrastructure: ['backup', 'qa'],
      application: ['prod', 'qa']
    })
  })

  it('finds nothing when there is no environments folder', () => {
    expect(listEnvironments(createRepository())).toEqual({
      infrastructure: [],
      application: []
    })
  })
})

describe('planWorkflowUpdates and applyWorkflowUpdates', () => {
  const repository = (workflowEnvironments: string[]) => ({
    'environments/qa/inventory.yml': '',
    'environments/qa/opencrvs-services/values.yaml': '',
    'environments/backup/inventory.yml': '',
    '.github/workflows/provision.yml': workflow(
      environmentInput(workflowEnvironments),
      tagsInput
    ),
    '.github/workflows/reset-2fa.yml': workflow(
      environmentInput(workflowEnvironments)
    ),
    '.github/workflows/deploy-opencrvs.yml': workflow(
      environmentInput(workflowEnvironments)
    )
  })

  it('gives servers to the infrastructure workflows and clusters to the others', () => {
    const root = createRepository(repository(['old']))

    const changes = planWorkflowUpdates(root)
    const environmentsOf = (file: string) =>
      changes.find((c) => c.file.endsWith(file))?.environments

    expect(environmentsOf('provision.yml')).toEqual(['backup', 'qa'])
    expect(environmentsOf('reset-2fa.yml')).toEqual(['backup', 'qa'])
    expect(environmentsOf('deploy-opencrvs.yml')).toEqual(['qa'])
  })

  it('plans every known workflow and reports the ones the repository does not have', () => {
    const changes = planWorkflowUpdates(createRepository(repository(['old'])))

    expect(changes).toHaveLength(
      INFRASTRUCTURE_WORKFLOWS.length + APPLICATION_WORKFLOWS.length
    )
    expect(
      changes
        .filter((c) => c.status === 'updated')
        .map((c) => c.file.split('/').pop())
    ).toEqual(['provision.yml', 'reset-2fa.yml', 'deploy-opencrvs.yml'])
    expect(changes.filter((c) => c.status === 'not-found')).toHaveLength(5)
  })

  it('writes nothing while planning', () => {
    const files = repository(['old'])
    const root = createRepository(files)

    planWorkflowUpdates(root)

    expect(read(root, '.github/workflows/provision.yml')).toBe(
      files['.github/workflows/provision.yml']
    )
  })

  it('writes only the workflows that changed', () => {
    // deploy-opencrvs.yml already lists the cluster environments.
    const upToDate = workflow(environmentInput(['qa']))
    const root = createRepository({
      ...repository(['old']),
      '.github/workflows/deploy-opencrvs.yml': upToDate
    })

    const written = applyWorkflowUpdates(root, planWorkflowUpdates(root))

    expect(written).toEqual([
      '.github/workflows/provision.yml',
      '.github/workflows/reset-2fa.yml'
    ])
    expect(read(root, '.github/workflows/provision.yml')).toContain(
      '- backup\n          - qa\n'
    )
    expect(read(root, '.github/workflows/deploy-opencrvs.yml')).toBe(upToDate)
  })

  it('leaves a workflow alone when there is no environment to list', () => {
    const root = createRepository({
      'environments/qa/inventory.yml': '',
      '.github/workflows/deploy-opencrvs.yml': workflow(
        environmentInput(['old'])
      )
    })

    const change = planWorkflowUpdates(root).find((c) =>
      c.file.endsWith('deploy-opencrvs.yml')
    )

    expect(change?.status).toBe('no-environments')
    expect(applyWorkflowUpdates(root, planWorkflowUpdates(root))).toEqual([])
    expect(read(root, '.github/workflows/deploy-opencrvs.yml')).toContain(
      '- old'
    )
  })

  it('throws before anything is written when one workflow has the wrong shape', () => {
    const files = {
      ...repository(['old']),
      '.github/workflows/reset-2fa.yml': workflow(tagsInput)
    }
    const root = createRepository(files)

    expect(() => planWorkflowUpdates(root)).toThrow(
      /reset-2fa\.yml: .*environment\.options/
    )
    expect(read(root, '.github/workflows/provision.yml')).toBe(
      files['.github/workflows/provision.yml']
    )
  })
})
