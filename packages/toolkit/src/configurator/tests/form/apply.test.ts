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
import type { Model } from 'survey-core'
import { describe, expect, it } from 'vitest'
import { FIXTURES, renderFixture } from '../../scripts/fixtures'
import { bindings, scanned } from '../../ui/bindings/load'
import { loadSnapshot, type Snapshot } from '../../ui/bindings/snapshot'
import { activeValues } from '../../ui/form/active'
import { applySnapshot, prefillRepositoryValues, resetEnvironment } from '../../ui/form/apply'
import { inferToggles, suggestType } from '../../ui/form/infer'
import { isShown } from '../../ui/form/menu'
import { answersWithoutSecrets } from '../../ui/form/secrets'
import { applyEnvironmentSources } from '../../ui/form/survey'
import { MockGitHub } from '../../ui/github/mock'
import { MockLocalServer } from '../../ui/local/mock'
import { makeSurvey, pageVisible, question } from './helpers'

const readTemplate = (path: string) => readFileSync(join(__dirname, '../../templates', path), 'utf8')
const local = () =>
  new MockLocalServer(Object.fromEntries(Object.keys(FIXTURES).map((name) => [name, renderFixture(name, readTemplate)])))

async function open(survey: Model, environment: string, github = true) {
  survey.setValue('ENVIRONMENT_NAME', environment)
  const snapshot = await loadSnapshot(environment, { github: github ? new MockGitHub('existing', 0) : undefined, local: local() }, bindings, scanned)
  applySnapshot(survey, snapshot)
  return snapshot
}

describe('applying an existing environment to the form', () => {
  it('fills values from GitHub and from the files (qa)', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    expect(survey.getValue('ENVIRONMENT_NAME')).toBe('qa')
    expect(survey.getValue('ENVIRONMENT_TYPE')).toBe('non-production')
    expect(survey.getValue('DOMAIN')).toBe('qa.opencrvs.example') // GitHub
    expect(survey.getValue('KUBE_API_HOST')).toBe('10.1.0.77') // GitHub beats inventory.yml
    expect(survey.getValue('USERS')).toEqual([
      { name: 'alice', role: 'admin', state: 'present', ssh_keys: expect.stringMatching(/^ssh-ed25519 /) }
    ]) // inventory.yml
    expect(survey.getValue('ACTIVATE_USERS')).toBe(true)
  })

  it('shows the pages that the environment already uses', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    expect(pageVisible(survey, 'email')).toBe(true) // SMTP secrets exist
    expect(pageVisible(survey, 'cluster')).toBe(true)
    expect(question(survey, 'BACKUP_OR_RESTORE').value).toBe('none')
  })

  it('suggests backup for prod and restore for uat from the files alone', async () => {
    const { survey } = await makeSurvey('fresh')
    await open(survey, 'prod', false)
    expect(survey.getValue('BACKUP_OR_RESTORE')).toBe('backup')
    expect(survey.getValue('BACKUP_HOST')).toBe('203.0.113.9')
    expect(survey.getValue('BACKUP_ENVIRONMENT_MODE')).toBe('differential')
    expect(survey.getValue('WORKER_NODES')).toEqual([{ ip: '10.3.0.11' }, { ip: '10.3.0.12' }])
    expect(survey.getValue('ENVIRONMENT_TYPE')).toBe('production')

    await open(survey, 'uat', false)
    expect(survey.getValue('BACKUP_OR_RESTORE')).toBe('restore')
    expect(survey.getValue('RESTORE_ENVIRONMENT_NAME')).toBe('prod')
    expect(survey.getValue('RESTORE_HOST')).toBe('203.0.113.20')
    expect(survey.getValue('ENVIRONMENT_TYPE')).toBe('non-production') // uat is not a known name, but its file says so
  })

  it('keeps nothing from the environment that was open before', async () => {
    const { survey } = await makeSurvey('fresh')
    await open(survey, 'prod', false)
    await open(survey, 'dev', false)
    expect(survey.getValue('ENVIRONMENT_NAME')).toBe('dev')
    expect(survey.getValue('BACKUP_HOST')).toBeUndefined()
    expect(survey.getValue('WORKER_NODES')).toBeUndefined()
    expect(survey.getValue('BACKUP_OR_RESTORE')).toBe('none')
    expect(survey.getValue('REGISTRY_HOST')).toBe('docker.io') // defaults are back
  })

  it('resetEnvironment clears everything except the name', async () => {
    const { survey } = await makeSurvey('fresh')
    await open(survey, 'prod', false)
    resetEnvironment(survey)
    expect(survey.getValue('ENVIRONMENT_NAME')).toBe('prod')
    expect(survey.getValue('DOMAIN')).toBeUndefined()
    expect(survey.getValue('USERS')).toBeUndefined()
    expect(pageVisible(survey, 'email')).toBe(false)
  })
})

describe('secrets that already exist on GitHub', () => {
  it('may stay empty, while the others are still required', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    expect(question(survey, 'SMTP_HOST').isRequired).toBe(false)
    expect(question(survey, 'ENCRYPTION_KEY').isRequired).toBe(false)
    expect(question(survey, 'REGISTRY_TOKEN').isRequired).toBe(true) // not defined on GitHub
    expect(question(survey, 'SMTP_HOST').isEmpty()).toBe(true) // the value is never read
  })

  it('pass validation when left empty, and become required again for a new environment', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    survey.setValue('SENDER_EMAIL_ADDRESS', undefined)
    survey.currentPage = survey.getPageByName('email')!
    expect(survey.currentPage.hasErrors(false)).toBe(false)

    resetEnvironment(survey)
    survey.setValue('CONFIGURE_EMAIL', true)
    survey.currentPage = survey.getPageByName('email')!
    expect(survey.currentPage.hasErrors(false)).toBe(true)
  })

  it('are not replaced by a generated value when their page opens', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    survey.setValue('ENABLE_ENCRYPTION', true)
    for (const page of ['disk', 'monitoring']) survey.currentPage = survey.getPageByName(page)!
    expect(question(survey, 'ENCRYPTION_KEY').isEmpty()).toBe(true)
    expect(question(survey, 'KIBANA_PASSWORD').isEmpty()).toBe(true)
  })

  it('are skipped when secrets are generated, while the missing ones still are', async () => {
    const { survey } = await makeSurvey('existing')
    survey.setVariable('definedSecrets', ['ENCRYPTION_KEY'])
    survey.setValue('ENABLE_ENCRYPTION', true)
    for (const page of ['disk', 'monitoring']) survey.currentPage = survey.getPageByName(page)!
    expect(question(survey, 'ENCRYPTION_KEY').isEmpty()).toBe(true)
    expect(question(survey, 'KIBANA_PASSWORD').value).toMatch(/^[0-9a-zA-Z]{16}$/)
  })

  it('are known to the form, and forgotten again for another environment', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    expect(survey.getVariable('definedSecrets')).toContain('SMTP_HOST')
    expect(survey.getVariable('definedSecrets')).not.toContain('REGISTRY_TOKEN')

    resetEnvironment(survey)
    expect(survey.getVariable('definedSecrets')).toEqual([])
  })

  it('do not count as unanswered in the progress bar', async () => {
    const { survey } = await makeSurvey('existing')
    const before = survey.getProgressInfo().requiredQuestionCount
    await open(survey, 'qa')
    survey.setValue('CONFIGURE_EMAIL', true)
    const withEmail = survey.getProgressInfo()
    // email page is shown, but its 6 required secrets are all defined on GitHub
    expect(withEmail.requiredQuestionCount).toBeLessThan(before + 6)
  })

  it('never appear in the answers that may be shown or exported', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    const answers = answersWithoutSecrets(survey)
    expect(answers.DOMAIN).toBe('qa.opencrvs.example')
    expect(answers).not.toHaveProperty('SMTP_HOST')
  })
})

describe('applyEnvironmentSources', () => {
  it('lists the environments of GitHub when it is connected', async () => {
    const { survey } = await makeSurvey('fresh')
    await applyEnvironmentSources(survey, { github: new MockGitHub('existing', 0), local: local() })
    expect((question(survey, 'ENVIRONMENT_NAME') as any).choices.map((c: any) => c.value)).toEqual(['qa', 'staging', 'production'])
  })

  it('lists the folders of environments/ when GitHub is skipped', async () => {
    const { survey } = await makeSurvey('registry-present')
    await applyEnvironmentSources(survey, { local: local() })
    expect((question(survey, 'ENVIRONMENT_NAME') as any).choices.map((c: any) => c.value)).toEqual(['dev', 'prod', 'qa', 'uat'])
    expect((question(survey, 'RESTORE_ENVIRONMENT_NAME') as any).choices.map((c: any) => c.value)).toEqual(['dev', 'prod', 'qa', 'uat'])
  })
})

describe('inferring what the form cannot read', () => {
  const snapshot = (values: Record<string, unknown>, definedSecrets: string[] = []): Snapshot => ({
    environment: 'x',
    exists: { github: true, files: false },
    values,
    origins: {},
    definedSecrets,
    conflicts: []
  })

  it('suggests a type only for well-known names', () => {
    expect(suggestType('QA')).toBe('non-production')
    expect(suggestType('dev')).toBe('non-production')
    expect(suggestType('development')).toBe('non-production')
    expect(suggestType('prod')).toBe('production')
    expect(suggestType('staging')).toBe('production') // staging holds PII data, as in the CLI
    expect(suggestType('uat')).toBeUndefined()
  })

  it('switches email on only when SMTP secrets exist', () => {
    expect(inferToggles(snapshot({}, ['SMTP_HOST'])).CONFIGURE_EMAIL).toBe(true)
    expect(inferToggles(snapshot({}, ['ENCRYPTION_KEY'])).CONFIGURE_EMAIL).toBe(false)
  })

  it('switches infrastructure on for any infrastructure value, but not for an empty worker list', () => {
    expect(inferToggles(snapshot({ KUBE_API_HOST: '1.2.3.4' })).CONFIGURE_INFRASTRUCTURE).toBe(true)
    expect(inferToggles(snapshot({ USERS: [] })).CONFIGURE_INFRASTRUCTURE).toBe(true)
    expect(inferToggles(snapshot({ WORKER_NODES: [] })).CONFIGURE_INFRASTRUCTURE).toBe(false)
    expect(inferToggles(snapshot({})).CONFIGURE_INFRASTRUCTURE).toBe(false)
  })

  it('unchecks "use built-in" for a component that has a host of its own', () => {
    const toggles = inferToggles(snapshot({ POSTGRES_HOST: 'db.example.org' }))
    expect(toggles).toMatchObject({ USE_BUILTIN_POSTGRES: false, USE_BUILTIN_REDIS: true, USE_BUILTIN_RUSTFS: true, USE_BUILTIN_ELASTICSEARCH: true })
    expect(inferToggles(snapshot({ S3_HOST: 's3.example.org' })).USE_BUILTIN_RUSTFS).toBe(false)
    expect(inferToggles(snapshot({})).USE_BUILTIN_OTEL_COLLECTOR).toBe(true)
    expect(inferToggles(snapshot({ OTEL_COLLECTOR_ENDPOINT: 'https://otel.example.org' })).USE_BUILTIN_OTEL_COLLECTOR).toBe(false)
    // the credentials do not tell: every environment has them
    expect(inferToggles(snapshot({}, ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'S3_ADMIN_ACCESS_KEY'])).USE_BUILTIN_POSTGRES).toBe(true)
  })

  it('reads a static certificate from the secret the old script left, unless a mode is stored', async () => {
    const { survey } = await makeSurvey('existing')
    applySnapshot(survey, { ...snapshot({}, ['SSL_CRT']), environment: 'old' })
    expect(survey.getValue('TRAEFIK_MODE')).toBe('static_ssl')

    applySnapshot(survey, { ...snapshot({ TRAEFIK_MODE: 'custom' }, ['SSL_CRT']), environment: 'old' })
    expect(survey.getValue('TRAEFIK_MODE')).toBe('custom')

    applySnapshot(survey, { ...snapshot({}, []), environment: 'new' })
    expect(survey.getValue('TRAEFIK_MODE')).toBe('lets_encrypt') // the default
  })

  it('switches disk encryption on for an environment that has a key or a disk size', () => {
    expect(inferToggles(snapshot({}, ['ENCRYPTION_KEY'])).ENABLE_ENCRYPTION).toBe(true)
    expect(inferToggles(snapshot({ DISK_SPACE: '200g' })).ENABLE_ENCRYPTION).toBe(true)
    expect(inferToggles(snapshot({}, ['POSTGRES_PASSWORD'])).ENABLE_ENCRYPTION).toBe(false)
  })

  it('switches Sentry on for an environment that has a DSN', () => {
    expect(inferToggles(snapshot({}, ['SENTRY_DSN'])).USE_SENTRY).toBe(true)
    expect(inferToggles(snapshot({})).USE_SENTRY).toBe(false)
  })

  it('takes a stored checkbox over the hosts, and falls back to the hosts without one', () => {
    const stored = { ...snapshot({ USE_BUILTIN_POSTGRES: false, POSTGRES_HOST: 'postgres-0.postgres.opencrvs-deps-x.svc.cluster.local' }), environment: 'x' }
    expect(inferToggles(stored)).not.toHaveProperty('USE_BUILTIN_POSTGRES') // left to the stored value
    expect(inferToggles(stored).USE_BUILTIN_REDIS).toBe(true) // nothing stored, no host

    const noFlag = { ...snapshot({ REDIS_HOST: 'cache.example.org' }), environment: 'x' }
    expect(inferToggles(noFlag).USE_BUILTIN_REDIS).toBe(false)
  })

  it('treats the in-cluster address in the services file as the built-in component, and any other host as its own', () => {
    const inCluster = { ...snapshot({ POSTGRES_HOST: 'postgres-0.postgres.opencrvs-deps-x.svc.cluster.local' }), environment: 'x' }
    expect(inferToggles(inCluster).USE_BUILTIN_POSTGRES).toBe(true)
    const own = { ...snapshot({ POSTGRES_HOST: 'db.example.org' }), environment: 'x' }
    expect(inferToggles(own).USE_BUILTIN_POSTGRES).toBe(false)
    expect(inferToggles(own).USE_BUILTIN_REDIS).toBe(true) // no host at all
  })

  it('chooses backup over restore, like the CLI', () => {
    expect(inferToggles(snapshot({ BACKUP_HOST: '1.1.1.1', RESTORE_HOST: '2.2.2.2' })).BACKUP_OR_RESTORE).toBe('backup')
    expect(inferToggles(snapshot({ RESTORE_HOST: '2.2.2.2' })).BACKUP_OR_RESTORE).toBe('restore')
    expect(inferToggles(snapshot({}, ['BACKUP_SERVER_USER'])).BACKUP_OR_RESTORE).toBe('backup')
    expect(inferToggles(snapshot({})).BACKUP_OR_RESTORE).toBe('none')
  })
})

describe('a new environment in a repository that already has settings', () => {
  async function pick(survey: Model, environment: string) {
    survey.setValue('ENVIRONMENT_NAME', environment)
    const snapshot = await loadSnapshot(environment, { github: new MockGitHub('registry-present', 0), local: local() }, bindings, scanned)
    prefillRepositoryValues(survey, snapshot)
    return snapshot
  }

  it('shows the repository-level value instead of the form default', async () => {
    const { survey } = await makeSurvey('registry-present')
    expect(survey.getValue('REGISTRY_HOST')).toBe('docker.io') // the form default
    const snapshot = await pick(survey, 'brand-new')
    expect(snapshot.exists).toEqual({ github: false, files: false })
    expect(survey.getValue('REGISTRY_HOST')).toBe('ghcr.io')
  })

  it('does not overwrite something the user already typed', async () => {
    const { survey } = await makeSurvey('registry-present')
    survey.setValue('REGISTRY_HOST', 'my.registry.example')
    await pick(survey, 'brand-new')
    expect(survey.getValue('REGISTRY_HOST')).toBe('my.registry.example')
  })

  it('knows which repository secrets exist, so they are not asked for again', async () => {
    const { survey } = await makeSurvey('registry-present')
    await pick(survey, 'brand-new')
    expect(question(survey, 'REGISTRY_TOKEN').isRequired).toBe(false)
    expect(survey.getVariable('definedSecrets')).toContain('REGISTRY_TOKEN')
    expect(question(survey, 'SMTP_HOST').isRequired).toBe(true) // an environment secret: not defined for a new environment
  })

  it('leaves the other answers and page switches alone', async () => {
    const { survey } = await makeSurvey('registry-present')
    await pick(survey, 'brand-new')
    expect(survey.getValue('CONFIGURE_EMAIL')).toBe(false)
    expect(survey.getValue('CONFIGURE_INFRASTRUCTURE')).toBe(true) // its default
    expect(survey.getValue('DOMAIN')).toBeUndefined()
  })
})

// The checkbox follows what GitHub holds, like the rule that decides what is written (ui/plan/backupSecrets.ts):
// an environment without BACKUP_HOST_PRIVATE_KEY gets a key pair whatever the box says, so the box says so and is locked.
describe('the new SSH key pair checkbox', () => {
  const NAME = 'GENERATE_BACKUP_SSH_KEYS'
  const box = (survey: Model) => question(survey, NAME)
  const state = (survey: Model) => ({ ticked: box(survey).value, locked: box(survey).isReadOnly })
  const newEnvironment = async (survey: Model, environment = 'brand-new') => {
    survey.setValue('ENVIRONMENT_NAME', environment)
    prefillRepositoryValues(survey, await loadSnapshot(environment, { github: new MockGitHub('existing', 0), local: local() }, bindings, scanned))
  }

  it('is ticked and locked before an environment is picked, since nothing exists yet', async () => {
    const { survey } = await makeSurvey('existing')
    expect(state(survey)).toEqual({ ticked: true, locked: true })
  })

  it('is ticked and locked for a new environment', async () => {
    const { survey } = await makeSurvey('existing')
    await newEnvironment(survey)
    expect(state(survey)).toEqual({ ticked: true, locked: true })
  })

  it('is ticked and locked for an existing environment that has no key pair (qa)', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'qa')
    expect(state(survey)).toEqual({ ticked: true, locked: true })
  })

  it('is not ticked, and free to tick, for an environment whose key pair is on GitHub (production)', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'production')
    expect(survey.getValue('BACKUP_OR_RESTORE')).toBe('backup')
    expect(state(survey)).toEqual({ ticked: false, locked: false })
    expect(activeValues(survey)[NAME]).toBe(false)

    survey.setValue(NAME, true)
    expect(state(survey)).toEqual({ ticked: true, locked: false })
    expect(activeValues(survey)[NAME]).toBe(true)
  })

  it('follows the environment that is open, in both directions', async () => {
    const { survey } = await makeSurvey('existing')
    await open(survey, 'production')
    survey.setValue(NAME, true) // ticked by hand, to replace the pair

    resetEnvironment(survey) // another, new environment
    await newEnvironment(survey)
    expect(state(survey)).toEqual({ ticked: true, locked: true })

    await open(survey, 'production') // back to one that has a key pair: the forced tick does not stay
    expect(state(survey)).toEqual({ ticked: false, locked: false })

    await open(survey, 'qa')
    expect(state(survey)).toEqual({ ticked: true, locked: true })
  })

  it('does not appear without GitHub, where no key pair can be kept', async () => {
    const { survey } = await makeSurvey('existing')
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    expect(isShown(box(survey))).toBe(true)
    survey.setVariable('githubAvailable', false)
    expect(isShown(box(survey))).toBe(false)
    expect(activeValues(survey)).not.toHaveProperty(NAME)
  })
})
