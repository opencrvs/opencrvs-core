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
import { afterEach, describe, expect, it, vi } from 'vitest'
import { activeValues } from '../../ui/form/active'
import { isShown } from '../../ui/form/menu'
import { generateMissingSecrets, githubAvailable, isSecret, setGitHubAvailable } from '../../ui/form/secrets'
import { createSurvey } from '../../ui/form/survey'
import { isGitHubAvailable } from '../../ui/github/availability'
import { HttpGitHub } from '../../ui/github/http'
import { MockGitHub } from '../../ui/github/mock'
import { pageVisible, question } from './helpers'

const GENERATED = /^[0-9a-zA-Z]{16}$/

// Secrets are stored on GitHub only, so without it no secret is asked for or generated.
describe('without GitHub', () => {
  it('hides every secret question', () => {
    const survey = createSurvey(false)
    const secrets = survey.getAllQuestions().filter((q) => isSecret(q))
    expect(secrets.length).toBeGreaterThan(20)
    expect(secrets.filter((q) => isShown(q)).map((q) => q.name)).toEqual([])
    expect(githubAvailable(survey)).toBe(false)
  })

  it('shows them with GitHub (the secrets that were visible before stay visible)', () => {
    const survey = createSurvey(true)
    survey.setValue('CONFIGURE_EMAIL', true)
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    for (const name of ['REGISTRY_TOKEN', 'SMTP_HOST', 'SMTP_SECURE', 'BACKUP_SERVER_USER', 'KIBANA_PASSWORD']) {
      expect(isShown(question(survey, name)), name).toBe(true)
    }
    // Their own conditions still apply.
    expect(isShown(question(survey, 'ELASTICSEARCH_SUPERUSER_PASSWORD'))).toBe(false)
    survey.setValue('USE_BUILTIN_ELASTICSEARCH', false)
    expect(isShown(question(survey, 'ELASTICSEARCH_SUPERUSER_PASSWORD'))).toBe(true)
  })

  it('does not offer a new backup SSH key pair, because it could not be stored', () => {
    for (const github of [true, false]) {
      const survey = createSurvey(github)
      survey.setValue('BACKUP_OR_RESTORE', 'backup')
      expect(isShown(question(survey, 'GENERATE_BACKUP_SSH_KEYS')), `GitHub ${github}`).toBe(github)
    }
  })

  it('keeps the own condition of a secret as well', () => {
    const survey = createSurvey(false)
    survey.setValue('USE_BUILTIN_ELASTICSEARCH', false)
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    survey.setValue('MONITORING_ENABLED', true)
    for (const name of ['ELASTICSEARCH_SUPERUSER', 'ELASTICSEARCH_SUPERUSER_PASSWORD', 'BACKUP_SERVER_USER', 'KIBANA_USERNAME']) {
      expect(isShown(question(survey, name)), name).toBe(false)
    }
    // The hosts and the backup server are not secrets: they go into the files.
    expect(isShown(question(survey, 'ELASTICSEARCH_HOST'))).toBe(true)
    expect(isShown(question(survey, 'BACKUP_HOST'))).toBe(true)
  })

  it('hides the pages that are about GitHub only, even for an environment that needs email', () => {
    const survey = createSurvey(false)
    survey.setValue('ENVIRONMENT_TYPE', 'production') // switches email on
    expect(survey.getValue('CONFIGURE_EMAIL')).toBe(true)
    for (const page of ['registry', 'email', 'disk']) expect(pageVisible(survey, page), page).toBe(false)
    expect(isShown(question(survey, 'CONFIGURE_EMAIL'))).toBe(false)
    expect(isShown(question(survey, 'USE_SENTRY'))).toBe(false)
    // The rest of the form is there.
    for (const page of ['environment', 'dependencies', 'monitoring', 'backup', 'cluster', 'users', 'traefik']) {
      expect(pageVisible(survey, page), page).toBe(true)
    }
  })

  it('shows those pages with GitHub', () => {
    const survey = createSurvey(true)
    survey.setValue('ENVIRONMENT_TYPE', 'production')
    for (const page of ['registry', 'email', 'disk']) expect(pageVisible(survey, page), page).toBe(true)
  })

  it('generates no secret, not even the Metabase password on the first page', () => {
    const survey = createSurvey(false)
    expect(question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').value).toBeUndefined()
    survey.currentPage = survey.getPageByName('monitoring')!
    generateMissingSecrets(survey)
    expect(question(survey, 'KIBANA_PASSWORD').value).toBeUndefined()
  })

  it('writes no secret and nothing that is about GitHub only', () => {
    const survey = createSurvey(false)
    survey.setValue('DOMAIN', 'qa.example.org')
    survey.setValue('REGISTRY_HOST', 'ghcr.io')
    survey.setValue('REGISTRY_TOKEN', 'typed-before-it-was-lost')
    survey.setValue('SMTP_HOST', 'smtp.example.org')
    const values = activeValues(survey)
    expect(values.DOMAIN).toBe('qa.example.org')
    for (const name of ['REGISTRY_HOST', 'REGISTRY_TOKEN', 'SMTP_HOST']) expect(values).not.toHaveProperty(name)
  })

  it('can be completed without any secret', () => {
    const survey = createSurvey(false)
    survey.setValue('ENVIRONMENT_NAME', 'qa')
    survey.setValue('ENVIRONMENT_TYPE', 'non-production')
    survey.setValue('DOMAIN', 'qa.example.org')
    const unanswered = survey.getAllQuestions().filter((q) => q.page?.isVisible && isShown(q) && q.isRequired && q.isEmpty()).map((q) => q.name)
    expect(unanswered).toEqual([])
    expect(survey.validate(true)).toBe(true)
  })
})

describe('GitHub going away and coming back', () => {
  it('drops the secrets that were generated or typed, and asks for none', () => {
    const survey = createSurvey(true)
    expect(question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').value).toMatch(GENERATED)
    survey.setValue('REGISTRY_TOKEN', 'token')

    setGitHubAvailable(survey, false)
    expect(githubAvailable(survey)).toBe(false)
    expect(question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').value).toBeUndefined()
    expect(question(survey, 'REGISTRY_TOKEN').value).toBeUndefined()
    expect(pageVisible(survey, 'registry')).toBe(false)
  })

  it('generates the secret of the open page again when GitHub is back', () => {
    const survey = createSurvey(false)
    setGitHubAvailable(survey, true)
    expect(question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').value).toMatch(GENERATED)
    expect(pageVisible(survey, 'registry')).toBe(true)
  })
})

describe('isGitHubAvailable', () => {
  it('is false when GitHub was skipped', async () => {
    expect(await isGitHubAvailable(undefined)).toBe(false)
  })

  it('follows what the dev server says', async () => {
    const github = new MockGitHub('fresh', 0)
    expect(await isGitHubAvailable(github)).toBe(true)
    github.connected = false
    expect(await isGitHubAvailable(github)).toBe(false)
  })

  it('is false when the dev server cannot be asked', async () => {
    const github = new MockGitHub('fresh', 0)
    github.status = () => Promise.reject(new Error('The local server answered 500.'))
    expect(await isGitHubAvailable(github)).toBe(false)
  })
})

describe('HttpGitHub.status', () => {
  afterEach(() => vi.unstubAllGlobals())

  const answer = (body: unknown, status = 200) => {
    const fetch = vi.fn(async () => new Response(JSON.stringify(body), { status }))
    vi.stubGlobal('fetch', fetch)
    return fetch
  }

  it('reads GET /api/github/status', async () => {
    const fetch = answer({ connected: true, owner: 'acme', repo: 'infrastructure' })
    expect(await new HttpGitHub().status()).toEqual({ connected: true, owner: 'acme', repo: 'infrastructure' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0]).toEqual(['/api/github/status', expect.objectContaining({ method: 'GET' })])
  })

  it('reports a forgotten token as not connected', async () => {
    answer({ connected: false })
    expect(await isGitHubAvailable(new HttpGitHub())).toBe(false)
  })

  it('treats a failing dev server as not available', async () => {
    answer({ error: 'nope' }, 500)
    expect(await isGitHubAvailable(new HttpGitHub())).toBe(false)
  })
})
