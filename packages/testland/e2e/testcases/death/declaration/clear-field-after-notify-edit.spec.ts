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
import { test, expect } from '@playwright/test'
import {
  goToSection,
  login,
  switchEventTab,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { fillDate } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

/**
 * Death is used since all of its fields are optional on notification: the birth
 * notification form requires e.g. the child's name and date of birth.
 */
test('Cleared field values are removed after editing and re-notifying a declaration', async ({
  page
}) => {
  const deceasedName = {
    firstname: faker.person.firstName('male'),
    surname: faker.person.lastName('male')
  }
  const formattedDeceasedName = `${deceasedName.firstname} ${deceasedName.surname}`
  const deceasedDob = { dd: '12', mm: '03', yyyy: '1950' }
  const numberOfDependants = '3'
  let dobValueBefore = ''
  let nameValueBefore = ''
  let recordUrl = ''

  await test.step('Login as Hospital official', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
  })

  await test.step('Initiate death notification', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step("Fill deceased's name, date of birth and number of dependants", async () => {
    await page.locator('#firstname').fill(deceasedName.firstname)
    await page.locator('#surname').fill(deceasedName.surname)
    await fillDate(page, deceasedDob)
    // A non-mandatory field that we will later clear during edit.
    await page
      .locator('#deceased____numberOfDependants')
      .fill(numberOfDependants)
  })

  await test.step('Continue to review and Notify', async () => {
    await goToSection(page, 'review')
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Open the notified record and capture the values shown', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formattedDeceasedName)
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    // Capture the record URL so it can be reopened after the name (used as the workqueue row title) has been cleared.
    recordUrl = page.url()

    await ensureAssignedToUser(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await switchEventTab(page, 'Record')

    const dob = page.getByTestId('deceased.dob-value')
    await expect(dob).toContainText(deceasedDob.yyyy)
    dobValueBefore = (await dob.innerText()).trim()

    const name = page.getByTestId('deceased.name-value')
    await expect(name).toContainText(deceasedName.surname)
    nameValueBefore = (await name.innerText()).trim()
  })

  await test.step('Edit the notification and clear the date of birth, the name and the number of dependants', async () => {
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-deceased.dob').click()

    // Clear the date of birth ...
    await fillDate(page, { dd: '', mm: '', yyyy: '' })

    // ... clear the deceased's name, a complex (multi-part) field, on the same
    // page ...
    await page.locator('#firstname').fill('')
    await page.locator('#surname').fill('')

    // ... and clear the number of dependants, a non-mandatory field on the same
    // page.
    await page.locator('#deceased____numberOfDependants').fill('')

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Review page during edit shows the cleared number of dependants as deleted', async () => {
    const dependantsRow = page.getByTestId('deceased.numberOfDependants-value')

    // The previous value is shown as deleted
    await expect(dependantsRow.locator('del')).toContainText(numberOfDependants)
  })

  await test.step('Notify again with the cleared field', async () => {
    await triggerDeclarationAction(page, 'Notify with edits')
  })

  await test.step('Record no longer shows the previously entered date of birth or name', async () => {
    // The name was cleared, so the record can no longer be found by its title;
    // reopen it directly via the URL captured earlier.
    await page.goto(recordUrl)

    const searchResponse = page.waitForResponse(
      (res) => res.url().includes('event.search') && res.ok()
    )

    await searchResponse

    await expect(page.getByLabel('Assign record')).toBeVisible()
    await ensureAssignedToUser(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await switchEventTab(page, 'Record')

    // The cleared values must not persist: neither the date of birth nor the
    // name row may still display the value entered before the edit.
    await expect(page.getByTestId('deceased.dob-value')).not.toHaveText(
      dobValueBefore
    )
    await expect(page.getByTestId('deceased.name-value')).not.toHaveText(
      nameValueBefore
    )
    await expect(
      page.getByTestId('deceased.numberOfDependants-value')
    ).not.toContainText(numberOfDependants)
  })
})
