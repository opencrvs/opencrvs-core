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
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  continueForm,
  goToSection,
  login,
  triggerDeclarationAction
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { navigateToWorkqueue } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test('Hospital Official notifies a death — attestation-required flag is set', async ({
  browser
}) => {
  const deceasedName = {
    firstname: faker.person.firstName('male'),
    surname: faker.person.lastName('male')
  }

  const page = await browser.newPage()

  await test.step('Log in as Hospital Official and start a new death event', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill deceased details', async () => {
    await page.locator('#firstname').fill(deceasedName.firstname)
    await page.locator('#surname').fill(deceasedName.surname)
    await continueForm(page)
  })

  await test.step('Set place of death to health facility (within jurisdiction)', async () => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Health Institution', { exact: true }).click()

    await page.locator('#eventDetails____deathLocation').fill('Klow Village')
    await page.getByText('Klow Village Hospital').click()

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill informant relation and continue', async () => {
    await page.locator('#informant____relation').click()
    await page.getByText('Spouse', { exact: true }).click()

    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Go to review page ', async () => {
    await goToSection(page, 'review')
  })

  await test.step('Notify the death event', async () => {
    await triggerDeclarationAction(page, 'Notify')
    await expect(page.getByText('Farajaland CRS')).toBeVisible()
  })

  await test.step('Record appears in the Recent workqueue', async () => {
    await navigateToWorkqueue(page, 'Recent')

    await expect(
      page.getByRole('button', {
        name: `${deceasedName.firstname} ${deceasedName.surname}`
      })
    ).toBeVisible()
  })

  await test.step('attestation-required flag is visible on the record overview', async () => {
    await openRecordByTitle(
      page,
      `${deceasedName.firstname} ${deceasedName.surname}`
    )

    await expect(page.getByTestId('flags-value')).toContainText(
      'Attestation required'
    )
  })

  await page.close()
})
