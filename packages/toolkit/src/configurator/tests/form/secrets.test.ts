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
import type { Model } from 'survey-core'
import { describe, expect, it } from 'vitest'
import { applySnapshot, resetEnvironment } from '../../ui/form/apply'
import { generateSecret } from '../../ui/form/generate'
import { QuestionSecretModel } from '../../ui/form/secretQuestion'
import { answersWithoutSecrets, isSecret } from '../../ui/form/secrets'
import { makeSurvey, question } from './helpers'

// Generated when their page is shown: the key on Disk encryption (only while it is on), the Kibana
// password on Monitoring (on by default). The Metabase password is on the first page, so the form
// already has it when it opens.
const SECRET_NAMES = ['ENCRYPTION_KEY', 'KIBANA_PASSWORD', 'OPENCRVS_METABASE_ADMIN_PASSWORD']

function showGeneratedPages(survey: Model) {
  survey.setValue('ENABLE_ENCRYPTION', true)
  for (const page of ['disk', 'monitoring']) survey.currentPage = survey.getPageByName(page)!
}

const snapshot = () => ({
  environment: 'x',
  exists: { github: true, files: false },
  values: {},
  origins: {},
  definedSecrets: [] as string[],
  conflicts: []
})

const secretValues = (survey: Model) => SECRET_NAMES.map((name) => question(survey, name).value as string)

describe('generateSecret', () => {
  it('honours length and charset', () => {
    expect(generateSecret(24)).toMatch(/^[0-9a-zA-Z]{24}$/)
    expect(generateSecret(64, 'hex')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('does not repeat', () => {
    expect(new Set(Array.from({ length: 50 }, () => generateSecret(24))).size).toBe(50)
  })

  it('makes a username of lowercase letters and digits that always starts with a letter', () => {
    expect(generateSecret(12, 'username')).toMatch(/^[a-z][a-z0-9]{11}$/)
    // a digit first would be 10 times in 36: this fails at once if the first character is not kept to letters
    const names = Array.from({ length: 3000 }, () => generateSecret(12, 'username'))
    expect(names.every((name) => /^[a-z][a-z0-9]{11}$/.test(name))).toBe(true)
    expect(new Set(names.map((name) => name[0])).size).toBe(26) // every letter comes up first
    expect(names.some((name) => /\d/.test(name.slice(1)))).toBe(true) // and digits are used after it
    expect(new Set(names).size).toBe(names.length)
    expect(generateSecret(1, 'username')).toMatch(/^[a-z]$/)
    expect(generateSecret(0, 'username')).toBe('')
  })
})

describe('secret question', () => {
  it('is registered as a custom type with length, charset and autoGenerate', async () => {
    const { survey } = await makeSurvey()
    const q = question(survey, 'ENCRYPTION_KEY')
    expect(q).toBeInstanceOf(QuestionSecretModel)
    expect((q as QuestionSecretModel).length).toBe(16)
    expect((q as QuestionSecretModel).charset).toBe('alphanumeric')
    expect((q as QuestionSecretModel).autoGenerate).toBe(true)
  })

  it('stays empty until its page is shown, except on the first page', async () => {
    const { survey } = await makeSurvey()
    const [key, kibana, metabase] = secretValues(survey)
    expect([key, kibana]).toEqual([undefined, undefined])
    expect(metabase).toMatch(/^[0-9a-zA-Z]{16}$/)
  })

  it('generates the first page again for another environment, and not for one that has it on GitHub', async () => {
    const { survey } = await makeSurvey()
    const first = question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').value
    resetEnvironment(survey)
    const second = question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').value
    expect(second).toMatch(/^[0-9a-zA-Z]{16}$/)
    expect(second).not.toBe(first)

    applySnapshot(survey, { ...snapshot(), definedSecrets: ['OPENCRVS_METABASE_ADMIN_PASSWORD'] })
    expect(question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').isEmpty()).toBe(true) // GitHub keeps its own
    expect(question(survey, 'OPENCRVS_METABASE_ADMIN_PASSWORD').isRequired).toBe(false)
  })

  it('generates each value once when its page is first shown', async () => {
    const { survey } = await makeSurvey()
    showGeneratedPages(survey)
    const values = secretValues(survey)
    expect(values.every((value) => /^[0-9a-zA-Z]{16}$/.test(value))).toBe(true)
    expect(new Set(values).size).toBe(values.length)
  })

  it('keeps the value across other edits, page changes and re-entry', async () => {
    const { survey } = await makeSurvey()
    showGeneratedPages(survey)
    const before = secretValues(survey)

    survey.setValue('DOMAIN', 'changed.opencrvs.org')
    survey.setValue('ENVIRONMENT_TYPE', 'production')
    survey.setValue('BACKUP_OR_RESTORE', 'backup')
    survey.currentPage = survey.getPageByName('email')!
    survey.currentPage = survey.getPageByName('cluster')!
    showGeneratedPages(survey)

    expect(secretValues(survey)).toEqual(before)
  })

  it('replaces the value only on an explicit generate()', async () => {
    const { survey } = await makeSurvey()
    survey.currentPage = survey.getPageByName('monitoring')!
    const q = question(survey, 'KIBANA_PASSWORD') as QuestionSecretModel
    const before = q.value
    q.generate()
    expect(q.value).not.toBe(before)
    expect(q.value).toMatch(/^[0-9a-zA-Z]{16}$/)
  })

  it('keeps a value the user typed in', async () => {
    const { survey } = await makeSurvey()
    question(survey, 'KIBANA_PASSWORD').value = 'my-own-password'
    survey.currentPage = survey.getPageByName('monitoring')!
    expect(question(survey, 'KIBANA_PASSWORD').value).toBe('my-own-password')
  })
})

describe('answers export', () => {
  it('leaves out every secret and keeps everything else', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('DOMAIN', 'example.opencrvs.org')
    survey.setValue('REGISTRY_HOST', 'ghcr.io')
    survey.setValue('REGISTRY_TOKEN', 'ghp_super_secret_token')
    survey.setValue('SMTP_PASSWORD', 'smtp-secret')
    survey.setValue('SMTP_HOST', 'smtp.example.org')
    showGeneratedPages(survey)

    const answers = answersWithoutSecrets(survey)
    expect(answers).toMatchObject({ DOMAIN: 'example.opencrvs.org', REGISTRY_HOST: 'ghcr.io' })

    for (const q of survey.getAllQuestions()) {
      if (isSecret(q)) expect(answers).not.toHaveProperty(q.getValueName())
    }
    for (const name of ['REGISTRY_TOKEN', 'SMTP_PASSWORD', 'SMTP_HOST', ...SECRET_NAMES]) {
      expect(answers).not.toHaveProperty(name)
    }

    const exported = JSON.stringify(answers)
    for (const value of [...secretValues(survey), 'ghp_super_secret_token', 'smtp-secret', 'smtp.example.org']) {
      expect(exported).not.toContain(value)
    }
  })

  it('marks every credential question as secret in the form definition', async () => {
    const { survey } = await makeSurvey()
    const secretNames = survey
      .getAllQuestions()
      .filter(isSecret)
      .map((q) => q.name)
    expect(secretNames).toEqual(
      expect.arrayContaining([
        'REGISTRY_TOKEN',
        'SMTP_PASSWORD',
        'BACKUP_SERVER_USER',
        ...SECRET_NAMES
      ])
    )
    const publicNames = survey
      .getAllQuestions()
      .filter((q) => !isSecret(q))
      .map((q) => q.name)
    expect(publicNames).toEqual(expect.arrayContaining(['DOMAIN', 'REGISTRY_HOST', 'BACKUP_HOST']))
  })
})

describe('generated user names and passwords', () => {
  const USERS = ['ELASTICSEARCH_SUPERUSER', 'S3_ADMIN_ACCESS_KEY', 'POSTGRES_USER', 'KIBANA_USERNAME']

  it('are 12-character user names for the four users and 16-character passwords for everything else', async () => {
    const { survey } = await makeSurvey()
    const generated = survey.getAllQuestions().filter((q): q is QuestionSecretModel => q instanceof QuestionSecretModel && q.autoGenerate)
    expect(generated.map((q) => q.name)).toEqual(expect.arrayContaining(USERS))
    for (const q of generated) {
      const isUser = USERS.includes(q.name)
      expect({ charset: q.charset, length: q.length }, q.name).toEqual(isUser ? { charset: 'username', length: 12 } : { charset: 'alphanumeric', length: 16 })
      q.generate()
      expect(q.value, q.name).toMatch(isUser ? /^[a-z][a-z0-9]{11}$/ : /^[0-9a-zA-Z]{16}$/)
    }
  })
})

describe('secrets entered by hand', () => {
  it('are secret questions, masked unless the value is not sensitive', async () => {
    const { survey } = await makeSurvey()
    for (const name of ['REGISTRY_TOKEN', 'SMTP_PASSWORD', 'SMTP_HOST', 'BACKUP_SERVER_USER']) {
      expect(question(survey, name)).toBeInstanceOf(QuestionSecretModel)
    }
    expect((question(survey, 'REGISTRY_TOKEN') as QuestionSecretModel).masked).toBe(true)
    expect((question(survey, 'SMTP_PASSWORD') as QuestionSecretModel).masked).toBe(true)
    expect((question(survey, 'SMTP_HOST') as QuestionSecretModel).masked).toBe(false)
    expect((question(survey, 'REGISTRY_TOKEN') as QuestionSecretModel).autoGenerate).toBe(false)
  })

  it('stay out of the exported answers', async () => {
    const { survey } = await makeSurvey()
    survey.setValue('REGISTRY_TOKEN', 'token')
    survey.setValue('SMTP_HOST', 'smtp.example.org')
    expect(answersWithoutSecrets(survey)).not.toHaveProperty('REGISTRY_TOKEN')
    expect(answersWithoutSecrets(survey)).not.toHaveProperty('SMTP_HOST')
  })
})
