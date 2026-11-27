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
import { describe, expect, it, vi } from 'vitest'
import { applyGitHubState } from '../../ui/form/survey'
import { MockGitHub } from '../../ui/github/mock'
import { makeSurvey, pageVisible, question, validate } from './helpers'


async function fillFirstPage(survey: Awaited<ReturnType<typeof makeSurvey>>['survey'], name: string) {
  survey.setValue('ENVIRONMENT_NAME', name)
  survey.setValue('ENVIRONMENT_TYPE', 'non-production')
  survey.setValue('DOMAIN', 'example.opencrvs.org')
}

describe('visibility from GitHub state', () => {
  it('always shows the registry page, whether or not the repository has registry secrets', async () => {
    for (const scenario of ['fresh', 'registry-present'] as const) {
      const { survey } = await makeSurvey(scenario)
      expect(pageVisible(survey, 'registry'), scenario).toBe(true)
    }
    const { survey, github } = await makeSurvey('fresh')
    github.scenario = 'registry-present'
    await applyGitHubState(survey, github)
    expect(pageVisible(survey, 'registry')).toBe(true)
  })

  const fillRegistry = (survey: Awaited<ReturnType<typeof makeSurvey>>['survey']) => {
    for (const name of ['REGISTRY_ORGANISATION', 'REGISTRY_REPOSITORY', 'REGISTRY_USERNAME', 'REGISTRY_TOKEN']) survey.setValue(name, 'x')
  }

  async function walk(survey: Awaited<ReturnType<typeof makeSurvey>>['survey'], until: string) {
    const visited: string[] = []
    for (let step = 0; step < 8 && survey.currentPage.name !== until; step++) {
      survey.nextPage()
      await vi.waitFor(() => expect(survey.currentPage.name).not.toBe(visited.at(-1) ?? 'environment'))
      visited.push(survey.currentPage.name)
    }
    return visited
  }

  it('goes from Environment to the registry page, and on to Data stores when email is off', async () => {
    const { survey } = await makeSurvey('registry-present')
    await fillFirstPage(survey, 'fresh-env')
    fillRegistry(survey)
    expect(await walk(survey, 'dependencies')).toEqual(['registry', 'dependencies'])
  })

  it('goes through Data stores, Monitoring and Backup/Restore, then the infrastructure pages', async () => {
    const { survey } = await makeSurvey('registry-present')
    await fillFirstPage(survey, 'fresh-env')
    fillRegistry(survey)
    survey.setValue('CONFIGURE_INFRASTRUCTURE', true)
    expect(await walk(survey, 'cluster')).toEqual(['registry', 'dependencies', 'monitoring', 'backup', 'cluster'])
  })

  it('goes through the email page, after the registry, when it is switched on', async () => {
    const { survey } = await makeSurvey('registry-present')
    await fillFirstPage(survey, 'fresh-env')
    fillRegistry(survey)
    survey.setValue('CONFIGURE_EMAIL', true)
    expect(await walk(survey, 'email')).toEqual(['registry', 'email'])
  })
})

describe('environment name field', () => {
  const choices = (survey: Awaited<ReturnType<typeof makeSurvey>>['survey']) =>
    (question(survey, 'ENVIRONMENT_NAME') as any).choices.map((item: any) => ({
      value: item.value,
      text: item.text,
      enabled: item.isEnabled
    }))

  it('lists the existing environments as selectable choices', async () => {
    const { survey } = await makeSurvey('existing')
    expect(choices(survey)).toEqual([
      { value: 'qa', text: 'qa', enabled: true },
      { value: 'staging', text: 'staging', enabled: true },
      { value: 'production', text: 'production', enabled: true }
    ])
  })

  it('allows typing a new name and lists nothing on a fresh repository', async () => {
    const { survey } = await makeSurvey('fresh')
    expect(choices(survey)).toEqual([])
    expect((question(survey, 'ENVIRONMENT_NAME') as any).allowCustomChoices).toBe(true)
  })

  it('follows the scenario when it changes', async () => {
    const { survey, github } = await makeSurvey('existing')
    github.scenario = 'registry-present'
    await applyGitHubState(survey, github)
    expect(choices(survey).map((item: { value: string }) => item.value)).toEqual(['qa'])
  })

  it('accepts an existing name without an "already exists" error', async () => {
    const { survey } = await makeSurvey('existing')
    expect(validate(survey, 'ENVIRONMENT_NAME', 'staging')).toEqual([])
    expect(validate(survey, 'ENVIRONMENT_NAME', 'brand-new')).toEqual([])
  })

  it('still checks the name format', async () => {
    const { survey } = await makeSurvey('existing')
    expect(validate(survey, 'ENVIRONMENT_NAME', 'Bad Name')).toHaveLength(1)
  })
})

describe('mock GitHub scenarios', () => {
  it('lists the expected state per scenario', async () => {
    expect(await new MockGitHub('fresh', 0).listEnvironments()).toEqual([])
    expect(await new MockGitHub('name-taken', 0).listEnvironments()).toEqual(['staging', 'production'])
    expect((await new MockGitHub('registry-present', 0).readRepository()).secretNames).toContain('REGISTRY_TOKEN')
  })
})
