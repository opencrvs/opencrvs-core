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
import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  formatName,
  getRandomDate,
  login,
  triggerDeclarationAction
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test.describe.serial('1. User conditional form flow', () => {
  let page: Page
  const declaration = {
    applicant: {
      name: {
        firstName: faker.person.firstName('male'),
        middleName: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(61, 200) // min age 61 to ensure senior pass id is shown
    },
    recommender: {
      name: {
        firstName: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      id: '123456789'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Tennis club membership application').click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.0 Go to review page and ensure default values are resolved properly', async () => {
      await continueForm(page)
      await continueForm(page)

      await expect(page.getByText('Invalid input')).not.toBeVisible()
    })

    test('1.1.1 Fill applicant details', async () => {
      await page.getByTestId('change-button-applicant.name').click()
      await page.getByTestId('confirm_edit').click()

      await page
        .locator('#firstname')
        .fill(declaration.applicant.name.firstName)
      await page.locator('#surname').fill(declaration.applicant.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.applicant.birthDate.dd)
      await page
        .getByPlaceholder('mm')
        .and(page.locator('[name="applicant____dob"]'))
        .fill(declaration.applicant.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.applicant.birthDate.yyyy)

      await page
        .getByLabel('Field shown when field agent is submitting application.')
        .click()

      await continueForm(page)
    })

    test('1.1.2 Fill senior pass details', async () => {
      await page.locator('#senior-pass____id').fill('123123')

      await continueForm(page)
    })

    test('1.1.3 Fill recommender details', async () => {
      await page
        .locator('#firstname')
        .fill(declaration.applicant.name.firstName)
      await page.locator('#surname').fill(declaration.applicant.name.familyName)
      await page.locator('#recommender____id').fill(declaration.recommender.id)

      await continueForm(page)
    })

    test('1.1.4 Review details', async () => {
      await page
        .getByText('Field shown when field agent is submitting application.')
        .isVisible()

      await expect(
        page.getByTestId('applicant.isRecommendedByFieldAgent-value')
      ).toHaveText('Yes')
    })

    test('1.1.5 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')
    })
  })

  test.describe('1.2 Notification Review by Registration Officer', async () => {
    test('1.2.1 Navigate to the declaration "Notifications"-tab', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Notifications').click()
      openRecordByTitle(page, formatName(declaration.applicant.name))

      await page.getByRole('button', { name: 'Record', exact: true }).click()

      await expect(
        page.getByText(
          'Field shown when field agent is submitting application.'
        )
      ).not.toBeVisible()

      await page.getByTestId('exit-event').click()
    })
  })
})
