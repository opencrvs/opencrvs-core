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
import { makeSurvey } from './helpers'

describe('progress bar', () => {
  it('is on, above the header, and counts answered required questions', async () => {
    const { survey } = await makeSurvey()
    expect(survey.showProgressBar).toBe(true)
    expect(survey.progressBarLocation).toBe('aboveheader') // SurveyJS lower-cases the value
    expect(survey.getEffectiveProgressBarType()).toBe('requiredQuestions')
  })

  it('starts with only the defaulted required questions answered', async () => {
    const { survey } = await makeSurvey()
    const info = survey.getProgressInfo()
    expect(info.requiredQuestionCount).toBe(18) // email page is off by default
    // REGISTRY_HOST defaults to docker.io and TRAEFIK_MODE to Let's Encrypt,
    // and the Metabase email and password are generated as soon as the form opens
    expect(info.requiredAnsweredQuestionCount).toBe(4)
    expect(survey.progressText).toBe('Answered 4/18 questions')
  })

  it('rises as required questions are answered and falls when one is cleared', async () => {
    const { survey } = await makeSurvey()
    const start = survey.progressValue

    survey.setValue('ENVIRONMENT_NAME', 'my-env')
    survey.setValue('ENVIRONMENT_TYPE', 'non-production')
    survey.setValue('DOMAIN', 'example.opencrvs.org')
    expect(survey.getProgressInfo().requiredAnsweredQuestionCount).toBe(7)
    expect(survey.progressValue).toBeGreaterThan(start)

    survey.clearValue('DOMAIN')
    expect(survey.getProgressInfo().requiredAnsweredQuestionCount).toBe(6)
  })

  it('counts the generated secrets once their page has been shown', async () => {
    const { survey } = await makeSurvey()
    // the Metabase email and password are generated with the first page; the Kibana user and password when Monitoring opens
    expect(survey.getProgressInfo().requiredAnsweredQuestionCount).toBe(4) // two defaults + Metabase email and password
    survey.currentPage = survey.getPageByName('monitoring')!
    expect(survey.getProgressInfo().requiredAnsweredQuestionCount).toBe(6)
    // the Postgres and S3 credentials and the Elasticsearch password are asked, and so generated, whether the components are built in or not
    survey.currentPage = survey.getPageByName('dependencies')!
    expect(survey.getProgressInfo().requiredAnsweredQuestionCount).toBe(11)
  })

  it('follows page visibility: hidden pages add nothing, shown pages add their questions', async () => {
    const { survey } = await makeSurvey('fresh')
    expect(survey.getProgressInfo().requiredQuestionCount).toBe(18)

    survey.setValue('CONFIGURE_EMAIL', true) // shows the email page: 6 required questions
    expect(survey.getProgressInfo().requiredQuestionCount).toBe(24)

    survey.setValue('CONFIGURE_INFRASTRUCTURE', true) // already on: the Traefik mode is its one required question
    expect(survey.getProgressInfo().requiredQuestionCount).toBe(24)

    survey.setValue('BACKUP_OR_RESTORE', 'backup') // backup settings: 3 required questions
    expect(survey.getProgressInfo().requiredQuestionCount).toBe(27)

    survey.setValue('ENABLE_ENCRYPTION', true) // the disk size and the key
    expect(survey.getProgressInfo().requiredQuestionCount).toBe(29)
    survey.setValue('ENABLE_ENCRYPTION', false)

    survey.setValue('CONFIGURE_INFRASTRUCTURE', false) // hiding the pages takes out Traefik (and the disk); backup stays
    expect(survey.getProgressInfo().requiredQuestionCount).toBe(26)

    survey.setValue('MONITORING_ENABLED', false) // the Kibana user and password
    expect(survey.getProgressInfo().requiredQuestionCount).toBe(24)
    survey.setValue('MONITORING_ENABLED', true)

    // the registry page is there whatever the repository holds, so its five required questions still count
    const { survey: registryPresent } = await makeSurvey('registry-present')
    expect(registryPresent.getProgressInfo().requiredQuestionCount).toBe(18)
  })
})
