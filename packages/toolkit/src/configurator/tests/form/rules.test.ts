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
import { activeValues } from '../../ui/form/active'
import { isShown } from '../../ui/form/menu'
import { QuestionSecretModel } from '../../ui/form/secretQuestion'
import { answersWithoutSecrets, generateMissingSecrets } from '../../ui/form/secrets'
import { DEFAULT_HOSTS } from '../../ui/plan/dependencyHosts'
import { makeSurvey, pageVisible, question, validate } from './helpers'

describe('form definition', () => {
  it('loads without schema errors and has the ten pages', async () => {
    const { survey } = await makeSurvey()
    expect(survey.jsonErrors).toBeNull()
    expect(survey.pages.map((page) => page.name)).toEqual([
      'environment',
      'registry',
      'email',
      'dependencies',
      'monitoring',
      'backup',
      'cluster',
      'users',
      'traefik',
      'disk'
    ])
  })
})

describe('environment page', () => {
  it('ACTIVATE_USERS defaults to true for a non-production environment', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('ENVIRONMENT_TYPE', 'non-production')
    expect(question(survey, 'ACTIVATE_USERS').value).toBe(true)
    expect(question(survey, 'ACTIVATE_USERS').isReadOnly).toBe(false)
  })

  it('ACTIVATE_USERS is forced off and read-only for a production environment', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('ENVIRONMENT_TYPE', 'non-production')
    survey.setValue('ACTIVATE_USERS', true)
    survey.setValue('ENVIRONMENT_TYPE', 'production')
    expect(question(survey, 'ACTIVATE_USERS').value).toBe(false)
    expect(question(survey, 'ACTIVATE_USERS').isReadOnly).toBe(true)
  })

  it('validates the environment name format', async () => {
    const { survey } = await makeSurvey()
    expect(validate(survey, 'ENVIRONMENT_NAME', 'Bad Name')).toHaveLength(1)
    expect(validate(survey, 'ENVIRONMENT_NAME', 'good-name-1')).toHaveLength(0)
  })

  it('validates the domain', async () => {
    const { survey } = await makeSurvey()
    expect(validate(survey, 'DOMAIN', 'localhost')).toHaveLength(1)
    expect(validate(survey, 'DOMAIN', 'farajaland.opencrvs.org')).toHaveLength(0)
  })
})

describe('infrastructure pages', () => {
  it('are shown by default and hidden when "Configure Infrastructure" is switched off', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'CONFIGURE_INFRASTRUCTURE').value).toBe(true)
    for (const name of ['cluster', 'users', 'traefik', 'disk']) expect(pageVisible(survey, name)).toBe(true)

    survey.setValue('CONFIGURE_INFRASTRUCTURE', false)
    for (const name of ['cluster', 'users', 'traefik', 'disk']) expect(pageVisible(survey, name)).toBe(false)

    survey.setValue('CONFIGURE_INFRASTRUCTURE', true)
    for (const name of ['cluster', 'users', 'traefik', 'disk']) expect(pageVisible(survey, name)).toBe(true)
  })

  it('are independent of the email page', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('CONFIGURE_INFRASTRUCTURE', false)
    survey.setValue('CONFIGURE_EMAIL', true)
    expect(pageVisible(survey, 'cluster')).toBe(false)
    survey.setValue('CONFIGURE_INFRASTRUCTURE', true)
    survey.setValue('CONFIGURE_EMAIL', false)
    expect(pageVisible(survey, 'cluster')).toBe(true)
  })
})

describe('email page', () => {
  it('is hidden until "Configure Email (SMTP) settings" is switched on', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'CONFIGURE_EMAIL').value).toBe(false)
    expect(pageVisible(survey, 'email')).toBe(false)
    survey.setValue('CONFIGURE_EMAIL', true)
    expect(pageVisible(survey, 'email')).toBe(true)
    survey.setValue('CONFIGURE_EMAIL', false)
    expect(pageVisible(survey, 'email')).toBe(false)
  })

  it('validates the SMTP port range', async () => {
    const { survey } = await makeSurvey()
    expect(validate(survey, 'SMTP_PORT', '0')).toHaveLength(1)
    expect(validate(survey, 'SMTP_PORT', '70000')).toHaveLength(1)
    expect(validate(survey, 'SMTP_PORT', 'abc')).toHaveLength(1)
    expect(validate(survey, 'SMTP_PORT', '587')).toHaveLength(0)
  })

  it.each(['ALERT_EMAIL', 'SENDER_EMAIL_ADDRESS'])('validates %s as an email address', async (name) => {
    const { survey } = await makeSurvey()
    expect(validate(survey, name, 'not-an-email')).toHaveLength(1)
    expect(validate(survey, name, 'ops@example.org')).toHaveLength(0)
  })
})

describe('cluster page', () => {
  it('accepts empty CIDRs and rejects malformed ones', async () => {
    const { survey } = await makeSurvey()
    expect(validate(survey, 'KUBE_API_ALLOWED_CIDRS')).toHaveLength(0)
    expect(validate(survey, 'KUBE_API_ALLOWED_CIDRS', '10.0.0.1')).toHaveLength(1)
    expect(validate(survey, 'KUBE_API_ALLOWED_CIDRS', '10.0.0.0/33')).toHaveLength(1)
    expect(validate(survey, 'KUBE_API_ALLOWED_CIDRS', '10.0.0.0/24, 192.168.1.5/32')).toHaveLength(0)
  })

  it('rejects a worker row that is not an IPv4 address', async () => {
    const { survey } = await makeSurvey()
    const table = question(survey, 'WORKER_NODES')
    table.value = [{ ip: 'worker-1.example.org' }]
    expect(table.hasErrors(true)).toBe(true)
    table.value = [{ ip: '10.0.0.7' }]
    expect(table.hasErrors(true)).toBe(false)
  })
})

describe('backup/restore page', () => {
  const panelVisible = (survey: Awaited<ReturnType<typeof makeSurvey>>['survey'], name: string) =>
    survey.getPanelByName(name)!.isVisible

  it('starts with neither backup nor restore', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('CONFIGURE_INFRASTRUCTURE', true)
    expect(pageVisible(survey, 'backup')).toBe(true)
    expect(question(survey, 'BACKUP_OR_RESTORE').value).toBe('none')
    expect(panelVisible(survey, 'backup_settings')).toBe(false)
    expect(panelVisible(survey, 'restore_settings')).toBe(false)
  })

  it('shows the backup or the restore settings, never both', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    expect(panelVisible(survey, 'backup_settings')).toBe(true)
    expect(panelVisible(survey, 'restore_settings')).toBe(false)

    survey.setValue('BACKUP_OR_RESTORE', 'restore')
    expect(panelVisible(survey, 'backup_settings')).toBe(false)
    expect(panelVisible(survey, 'restore_settings')).toBe(true)
  })

  it('offers the environments found on GitHub to restore from, and allows another name', async () => {
    const { survey } = await makeSurvey('name-taken')
    const restoreFrom = question(survey, 'RESTORE_ENVIRONMENT_NAME') as any
    expect(restoreFrom.choices.map((choice: any) => choice.value)).toEqual(['staging', 'production'])
    expect(restoreFrom.visibleChoices.map((choice: any) => choice.value)).toEqual(['staging', 'production'])
    expect(restoreFrom.allowCustomChoices).toBe(true)
  })

  it('does not offer the environment being configured to restore from', async () => {
    const { survey } = await makeSurvey('name-taken')
    const restoreFrom = question(survey, 'RESTORE_ENVIRONMENT_NAME') as any
    const offered = () => restoreFrom.visibleChoices.map((choice: any) => choice.value)

    survey.setValue('ENVIRONMENT_NAME', 'staging')
    expect(offered()).toEqual(['production'])

    survey.setValue('ENVIRONMENT_NAME', 'production')
    expect(offered()).toEqual(['staging'])

    survey.setValue('ENVIRONMENT_NAME', 'a-new-one')
    expect(offered()).toEqual(['staging', 'production'])
  })

  it('rejects restoring from the environment being configured, even when typed in', async () => {
    const { survey } = await makeSurvey('name-taken')
    survey.setValue('ENVIRONMENT_NAME', 'staging')
    expect(validate(survey, 'RESTORE_ENVIRONMENT_NAME', 'staging')).toHaveLength(1)
    expect(validate(survey, 'RESTORE_ENVIRONMENT_NAME', 'production')).toHaveLength(0)
    expect(validate(survey, 'RESTORE_ENVIRONMENT_NAME', 'another-one')).toHaveLength(0)

    // the environment name changed after the restore source was picked
    survey.setValue('ENVIRONMENT_NAME', 'another-one')
    expect(validate(survey, 'RESTORE_ENVIRONMENT_NAME')).toHaveLength(1)
  })

  it('requires RESTORE_HOST to be an IP address and defaults the restore mode', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'RESTORE_ENVIRONMENT_MODE').value).toBe('dump')
    expect(validate(survey, 'RESTORE_HOST', 'restore.example.org')).toHaveLength(1)
    expect(validate(survey, 'RESTORE_HOST', '203.0.113.20')).toHaveLength(0)
  })

  it('requires BACKUP_HOST to be an IP address, not a hostname', async () => {
    const { survey } = await makeSurvey()
    expect(validate(survey, 'BACKUP_HOST', 'backup.example.org')).toHaveLength(1)
    expect(validate(survey, 'BACKUP_HOST', '256.1.1.1')).toHaveLength(1)
    expect(validate(survey, 'BACKUP_HOST', '203.0.113.9')).toHaveLength(0)
  })

  it('defaults the mode, and asks for the user (masked, no default)', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'BACKUP_SERVER_USER').value).toBeUndefined()
    expect((question(survey, 'BACKUP_SERVER_USER') as QuestionSecretModel).masked).toBe(true)
    expect(question(survey, 'BACKUP_ENVIRONMENT_MODE').value).toBe('dump')
  })

  it('asks whether to generate a new SSH key pair, for a backup only', async () => {
    const { survey } = await makeSurvey()
    const checkbox = question(survey, 'GENERATE_BACKUP_SSH_KEYS')
    expect(checkbox.getType()).toBe('boolean')
    expect(checkbox.title).toBe('Generate new private/public SSH key pair')
    expect(checkbox.value).toBe(true) // no environment is open yet, so no key pair exists (see apply.test.ts for the rest)
    expect(checkbox.isRequired).toBe(false)
    expect(checkbox.parent?.name).toBe('backup_settings')

    for (const mode of ['none', 'restore']) {
      survey.setValue('BACKUP_OR_RESTORE', mode)
      expect(isShown(checkbox), mode).toBe(false)
      expect(activeValues(survey), mode).not.toHaveProperty('GENERATE_BACKUP_SSH_KEYS')
    }
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    expect(isShown(checkbox)).toBe(true)
    expect(activeValues(survey).GENERATE_BACKUP_SSH_KEYS).toBe(true)
  })

  it('keeps no key in the form: the key pair is made for the review, not typed or shown', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    expect(survey.getQuestionByName('BACKUP_HOST_PRIVATE_KEY')).toBeNull()
    expect(survey.getQuestionByName('BACKUP_HOST_PUBLIC_KEY')).toBeNull()
  })
})

describe('deployment approval block', () => {
  it('groups both questions in one panel on the environment page', async () => {
    const { survey } = await makeSurvey()
    const panel = survey.getPanelByName('approval_settings')!
    expect(panel.title).toBe('Deployment approval')
    expect(panel.questions.map((item) => item.name)).toEqual(['APPROVAL_REQUIRED', 'APPROVERS'])
    expect(survey.pages[0]!.getPanels().map((item) => item.name)).toContain('approval_settings')
  })

  it('asks for approvers only when approval is required, as a comma-separated list of user names', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'APPROVAL_REQUIRED').value).toBe(false)
    expect(question(survey, 'APPROVERS').isVisible).toBe(false)

    survey.setValue('APPROVAL_REQUIRED', true)
    expect(question(survey, 'APPROVERS').isVisible).toBe(true)
    expect(question(survey, 'APPROVERS').isRequired).toBe(true)
    expect(validate(survey, 'APPROVERS', 'octocat, hubot')).toEqual([])
    expect(validate(survey, 'APPROVERS', 'octo cat,')).not.toEqual([])
  })
})

describe('dependencies page', () => {
  const builtIn = ['ELASTICSEARCH', 'RUSTFS', 'POSTGRES', 'REDIS']

  it('is always there, with one panel for each component', async () => {
    const { survey } = await makeSurvey()
    expect(pageVisible(survey, 'dependencies')).toBe(true)
    const titles = ['elasticsearch_settings', 'rustfs_settings', 'postgres_settings', 'redis_settings'].map((panel) => survey.getPanelByName(panel)!.title)
    expect(titles).toEqual(['Elasticsearch', 'S3 Storage', 'Postgres', 'Redis'])
  })

  it('starts with every component built in: the hosts are hidden and the checkbox is shown', async () => {
    const { survey } = await makeSurvey()
    for (const name of builtIn) {
      expect(question(survey, `USE_BUILTIN_${name}`).value).toBe(true)
      expect(question(survey, `USE_BUILTIN_${name}`).isVisible).toBe(true)
    }
    for (const name of ['ELASTICSEARCH_HOST', 'S3_HOST', 'POSTGRES_HOST', 'REDIS_HOST']) {
      expect(isShown(question(survey, name))).toBe(false)
    }
  })

  // The services sign in to a built-in Postgres and S3 with these too, and every environment keeps them on GitHub.
  it('always asks the Postgres and S3 credentials, built in or not', async () => {
    const { survey } = await makeSurvey()
    const credentials = ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'S3_ADMIN_ACCESS_KEY', 'S3_ADMIN_SECRET_KEY']
    for (const name of credentials) {
      expect(isShown(question(survey, name)), name).toBe(true)
      expect(question(survey, name).isRequired, name).toBe(true)
    }
    survey.setValue('USE_BUILTIN_POSTGRES', false)
    survey.setValue('USE_BUILTIN_RUSTFS', false)
    for (const name of credentials) expect(isShown(question(survey, name)), name).toBe(true)

    // Elasticsearch signs itself in while built in, so its credentials are asked only for another one
    for (const name of ['ELASTICSEARCH_SUPERUSER', 'ELASTICSEARCH_SUPERUSER_PASSWORD']) expect(isShown(question(survey, name))).toBe(false)
  })

  it('generates the Postgres and S3 credentials when the page opens, even for built-in components', async () => {
    const { survey } = await makeSurvey()
    survey.currentPage = survey.getPageByName('dependencies')!
    generateMissingSecrets(survey)
    for (const name of ['POSTGRES_USER', 'S3_ADMIN_ACCESS_KEY']) expect(survey.getValue(name), name).toMatch(/^[a-z][a-z0-9]{11}$/)
    for (const name of ['POSTGRES_PASSWORD', 'S3_ADMIN_SECRET_KEY']) expect(survey.getValue(name), name).toMatch(/^[0-9a-zA-Z]{16}$/)
    // these are on screen, so they reach the answers that are written (a hidden question's value is left out, see activeValues)
    const written = activeValues(survey)
    for (const name of ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'S3_ADMIN_ACCESS_KEY', 'S3_ADMIN_SECRET_KEY']) expect(written, name).toHaveProperty(name)
    for (const name of ['ELASTICSEARCH_SUPERUSER', 'ELASTICSEARCH_SUPERUSER_PASSWORD']) expect(written, name).not.toHaveProperty(name)
  })

  it('unchecking a component shows its host, and checking it again hides it', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('USE_BUILTIN_POSTGRES', false)
    expect(isShown(question(survey, 'USE_BUILTIN_POSTGRES'))).toBe(true) // the checkbox stays, so the choice can be undone
    for (const name of ['POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD']) expect(isShown(question(survey, name))).toBe(true)
    // the others are not touched
    expect(question(survey, 'USE_BUILTIN_REDIS').isVisible).toBe(true)
    expect(isShown(question(survey, 'REDIS_HOST'))).toBe(false)
    expect(survey.getPanelByName('postgres_settings')!.questions.map((item) => item.name)).toEqual([
      'USE_BUILTIN_POSTGRES',
      'POSTGRES_HOST',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD'
    ])

    survey.setValue('USE_BUILTIN_POSTGRES', true)
    expect(isShown(question(survey, 'POSTGRES_HOST'))).toBe(false)
    for (const name of ['POSTGRES_USER', 'POSTGRES_PASSWORD']) expect(isShown(question(survey, name))).toBe(true) // asked either way
  })

  it('pre-fills each host from the environment name, and keeps what the user types', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'POSTGRES_HOST').value ?? '').toBe('') // no environment yet

    survey.setValue('ENVIRONMENT_NAME', 'qa')
    expect(question(survey, 'ELASTICSEARCH_HOST').value).toBe('elasticsearch.opencrvs-deps-qa.svc.cluster.local')
    expect(question(survey, 'S3_HOST').value).toBe('rustfs-0.rustfs.opencrvs-deps-qa.svc.cluster.local')
    expect(question(survey, 'POSTGRES_HOST').value).toBe('postgres-0.postgres.opencrvs-deps-qa.svc.cluster.local')
    expect(question(survey, 'REDIS_HOST').value).toBe('redis-0.redis.opencrvs-deps-qa.svc.cluster.local')

    question(survey, 'POSTGRES_HOST').value = 'db.example.org'
    survey.setValue('ENVIRONMENT_NAME', 'staging')
    expect(question(survey, 'POSTGRES_HOST').value).toBe('db.example.org')
    expect(question(survey, 'REDIS_HOST').value).toBe('redis-0.redis.opencrvs-deps-staging.svc.cluster.local')
  })

  // The questions read DEFAULT_HOSTS through `defaultAddress` (forms/wizard.yml); this checks that every entry has its question.
  it('pre-fills every built-in address from DEFAULT_HOSTS, the one written for a built-in component', async () => {
    const { survey } = await makeSurvey()
    for (const environment of ['qa', 'staging', 'my-env']) {
      survey.setValue('ENVIRONMENT_NAME', environment)
      for (const [name, defaultHost] of Object.entries(DEFAULT_HOSTS)) {
        expect(question(survey, name).value, `${name} for ${environment}`).toBe(defaultHost(environment))
      }
    }
  })

  it('accepts a host name and rejects a URL', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('USE_BUILTIN_POSTGRES', false) // a field that is not shown is not checked
    expect(validate(survey, 'POSTGRES_HOST', 'db.example.org:5432')).toEqual([])
    expect(validate(survey, 'POSTGRES_HOST', 'https://db.example.org')).not.toEqual([])
  })

  it('generates the credentials when the page opens, once the components are not built in', async () => {
    const { survey } = await makeSurvey()
    for (const name of builtIn) survey.setValue(`USE_BUILTIN_${name}`, false)
    survey.currentPage = survey.getPageByName('dependencies')!
    generateMissingSecrets(survey)
    const users = ['ELASTICSEARCH_SUPERUSER', 'S3_ADMIN_ACCESS_KEY', 'POSTGRES_USER']
    const passwords = ['ELASTICSEARCH_SUPERUSER_PASSWORD', 'S3_ADMIN_SECRET_KEY', 'POSTGRES_PASSWORD']
    const names = [...users, ...passwords]
    const generated = names.map((name) => survey.getValue(name) as string)
    for (const name of users) expect(survey.getValue(name), name).toMatch(/^[a-z][a-z0-9]{11}$/)
    for (const name of passwords) expect(survey.getValue(name), name).toMatch(/^[0-9a-zA-Z]{16}$/)
    expect(new Set(generated).size).toBe(names.length)

    generateMissingSecrets(survey)
    expect(names.map((name) => survey.getValue(name))).toEqual(generated)
  })
})

describe('traefik page', () => {
  const CRT = '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n'
  const KEY = '-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----'

  it('belongs to Infrastructure, and goes with it', async () => {
    const { survey } = await makeSurvey()
    expect(pageVisible(survey, 'traefik')).toBe(true)
    survey.setValue('CONFIGURE_INFRASTRUCTURE', false)
    expect(pageVisible(survey, 'traefik')).toBe(false)
  })

  it("starts on Let's Encrypt, which asks for nothing else", async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'TRAEFIK_MODE').value).toBe('lets_encrypt')
    expect(isShown(question(survey, 'SSL_CRT'))).toBe(false)
    expect(isShown(question(survey, 'SSL_KEY'))).toBe(false)
    survey.setValue('TRAEFIK_MODE', 'custom')
    expect(isShown(question(survey, 'SSL_CRT'))).toBe(false)
  })

  it('asks for the certificate and its key for a static certificate, as multi-line secrets', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('TRAEFIK_MODE', 'static_ssl')
    for (const name of ['SSL_CRT', 'SSL_KEY']) {
      const field = question(survey, name) as QuestionSecretModel
      expect(isShown(field)).toBe(true)
      expect(field.isRequired).toBe(true)
      expect(field.multiline).toBe(true)
    }
    expect((question(survey, 'SSL_CRT') as QuestionSecretModel).masked).toBe(false)
    expect((question(survey, 'SSL_KEY') as QuestionSecretModel).masked).toBe(true)
    expect(validate(survey, 'SSL_CRT')).not.toEqual([]) // empty
    expect(validate(survey, 'SSL_KEY')).not.toEqual([])
  })

  it('accepts PEM text and rejects anything else', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('TRAEFIK_MODE', 'static_ssl')
    expect(validate(survey, 'SSL_CRT', CRT)).toEqual([])
    expect(validate(survey, 'SSL_CRT', 'not a certificate')).not.toEqual([])
    expect(validate(survey, 'SSL_CRT', KEY)).not.toEqual([]) // a key in the certificate field
    expect(validate(survey, 'SSL_KEY', KEY)).toEqual([])
    expect(validate(survey, 'SSL_KEY', '-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----')).toEqual([])
    expect(validate(survey, 'SSL_KEY', CRT)).not.toEqual([])
  })

  it('keeps the certificate and the key out of the exported answers', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('TRAEFIK_MODE', 'static_ssl')
    survey.setValue('SSL_CRT', CRT)
    survey.setValue('SSL_KEY', KEY)
    const answers = answersWithoutSecrets(survey)
    expect(answers).toHaveProperty('TRAEFIK_MODE', 'static_ssl')
    expect(answers).not.toHaveProperty('SSL_CRT')
    expect(answers).not.toHaveProperty('SSL_KEY')
  })
})

describe('disk encryption page', () => {
  it('belongs to Infrastructure, and goes with it', async () => {
    const { survey } = await makeSurvey()
    expect(pageVisible(survey, 'disk')).toBe(true)
    survey.setValue('CONFIGURE_INFRASTRUCTURE', false)
    expect(pageVisible(survey, 'disk')).toBe(false)
  })

  it('is off by default, and asks for the size and shows the key only when it is on', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'ENABLE_ENCRYPTION').value).toBe(false)
    expect(isShown(question(survey, 'DISK_SPACE'))).toBe(false)
    expect(isShown(question(survey, 'ENCRYPTION_KEY'))).toBe(false)

    survey.setValue('ENABLE_ENCRYPTION', true)
    expect(isShown(question(survey, 'DISK_SPACE'))).toBe(true)
    expect(isShown(question(survey, 'ENCRYPTION_KEY'))).toBe(true)
    expect(question(survey, 'DISK_SPACE').value).toBe('200g')
  })

  it('accepts a size such as 200g and rejects anything else', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('ENABLE_ENCRYPTION', true)
    for (const size of ['200g', '1t', '512M']) expect(validate(survey, 'DISK_SPACE', size)).toEqual([])
    for (const size of ['200', '0g', 'all', '']) expect(validate(survey, 'DISK_SPACE', size)).not.toEqual([])
  })

  it('generates the key when the page opens, and the key cannot be edited or replaced', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('ENABLE_ENCRYPTION', true)
    survey.currentPage = survey.getPageByName('disk')!
    const key = question(survey, 'ENCRYPTION_KEY')
    expect(key.value).toMatch(/^[0-9a-zA-Z]{16}$/)
    expect(key.isReadOnly).toBe(true)
  })

  it('can only be chosen for a new environment: an existing key locks the choice and the size', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('ENABLE_ENCRYPTION', true)
    expect(question(survey, 'ENABLE_ENCRYPTION').isReadOnly).toBe(false)
    expect(question(survey, 'DISK_SPACE').isReadOnly).toBe(false)

    survey.setVariable('definedSecrets', ['ENCRYPTION_KEY'])
    expect(question(survey, 'ENABLE_ENCRYPTION').isReadOnly).toBe(true)
    expect(question(survey, 'DISK_SPACE').isReadOnly).toBe(true)
    expect(question(survey, 'ENCRYPTION_KEY').isRequired).toBe(false) // GitHub has it
  })
})

describe('monitoring page', () => {
  it('comes after Dependencies and is always there', async () => {
    const { survey } = await makeSurvey()
    const names = survey.pages.map((page) => page.name)
    expect(names.indexOf('monitoring')).toBe(names.indexOf('dependencies') + 1)
    expect(pageVisible(survey, 'monitoring')).toBe(true)
  })

  it('is on by default, with OpenTelemetry on and the Kibana credentials asked', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'MONITORING_ENABLED').value).toBe(true)
    expect(question(survey, 'OTEL_ENABLED').value).toBe(true)
    for (const name of ['OTEL_ENABLED', 'USE_BUILTIN_OTEL_COLLECTOR', 'KIBANA_USERNAME', 'KIBANA_PASSWORD']) expect(isShown(question(survey, name))).toBe(true)
    // The credentials are generated when the page opens, so they are empty until then.
    expect(question(survey, 'KIBANA_USERNAME').value).toBeUndefined()
    survey.currentPage = survey.getPageByName('monitoring')!
    expect(question(survey, 'KIBANA_USERNAME').value).toMatch(/^[a-z][a-z0-9]{11}$/)
  })

  it('hides Kibana when monitoring is switched off, but not OpenTelemetry, which can use a collector of its own', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('MONITORING_ENABLED', false)
    for (const name of ['KIBANA_USERNAME', 'KIBANA_PASSWORD']) expect(isShown(question(survey, name))).toBe(false)
    for (const name of ['OTEL_ENABLED', 'USE_BUILTIN_OTEL_COLLECTOR']) expect(isShown(question(survey, name))).toBe(true)
    survey.setValue('MONITORING_ENABLED', true)
    for (const name of ['KIBANA_USERNAME', 'KIBANA_PASSWORD']) expect(isShown(question(survey, name))).toBe(true)
  })

  describe('OpenTelemetry', () => {
    const otelQuestions = ['USE_BUILTIN_OTEL_COLLECTOR', 'OTEL_COLLECTOR_ENDPOINT']

    it('asks nothing more while the built-in collector is used, and shows the endpoint when it is not', async () => {
      const { survey } = await makeSurvey()
      expect(question(survey, 'USE_BUILTIN_OTEL_COLLECTOR').value).toBe(true)
      expect(isShown(question(survey, 'USE_BUILTIN_OTEL_COLLECTOR'))).toBe(true)
      expect(isShown(question(survey, 'OTEL_COLLECTOR_ENDPOINT'))).toBe(false)

      survey.setValue('USE_BUILTIN_OTEL_COLLECTOR', false)
      expect(isShown(question(survey, 'OTEL_COLLECTOR_ENDPOINT'))).toBe(true)
    })

    it('hides the collector questions when OpenTelemetry is switched off', async () => {
      const { survey } = await makeSurvey()
      survey.setValue('USE_BUILTIN_OTEL_COLLECTOR', false)
      survey.setValue('OTEL_ENABLED', false)
      for (const name of otelQuestions) expect(isShown(question(survey, name))).toBe(false)
      survey.setValue('OTEL_ENABLED', true)
      for (const name of otelQuestions) expect(isShown(question(survey, name))).toBe(true)
    })

    it('pre-fills the endpoint with the address in the cluster', async () => {
      const { survey } = await makeSurvey()
      expect(question(survey, 'OTEL_COLLECTOR_ENDPOINT').value ?? '').toBe('') // no environment yet
      survey.setValue('ENVIRONMENT_NAME', 'qa')
      expect(question(survey, 'OTEL_COLLECTOR_ENDPOINT').value).toBe('http://opentelemetry-collector.opencrvs-deps-qa.svc.cluster.local:4317')
    })

    it('accepts a URL with or without a protocol, and rejects the rest', async () => {
      const { survey } = await makeSurvey()
      survey.setValue('USE_BUILTIN_OTEL_COLLECTOR', false) // a field that is not shown is not checked
      for (const endpoint of [
        'http://opentelemetry-collector.opencrvs-deps-qa.svc.cluster.local:4317', // the default
        'https://otel.example.org',
        'otel.example.org:4317',
        'otel.example.org',
        'HTTP://Otel.Example.org:4318/v1/traces'
      ]) {
        expect(validate(survey, 'OTEL_COLLECTOR_ENDPOINT', endpoint), endpoint).toEqual([])
      }
      for (const endpoint of ['ftp://otel.example.org', 'http://', 'http://:4317', 'otel example.org', 'otel.example.org:port', '-otel.example.org']) {
        expect(validate(survey, 'OTEL_COLLECTOR_ENDPOINT', endpoint), endpoint).not.toEqual([])
      }
    })
  })

  it('generates the Kibana password when the page opens', async () => {
    const { survey } = await makeSurvey()
    survey.currentPage = survey.getPageByName('monitoring')!
    expect(question(survey, 'KIBANA_PASSWORD').value).toMatch(/^[0-9a-zA-Z]{16}$/)
  })

  it('asks for a Sentry DSN only when Sentry is used, with or without monitoring', async () => {
    const { survey } = await makeSurvey()
    expect(question(survey, 'USE_SENTRY').value).toBe(false)
    expect(isShown(question(survey, 'SENTRY_DSN'))).toBe(false)

    survey.setValue('MONITORING_ENABLED', false)
    survey.setValue('USE_SENTRY', true)
    expect(isShown(question(survey, 'SENTRY_DSN'))).toBe(true)
    expect(validate(survey, 'SENTRY_DSN')).not.toEqual([]) // required
    expect(validate(survey, 'SENTRY_DSN', 'https://key@o0.ingest.sentry.io/0')).toEqual([])
    expect(validate(survey, 'SENTRY_DSN', 'not a url')).not.toEqual([])
  })
})
