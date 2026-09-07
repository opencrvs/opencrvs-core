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
  getRandomDate,
  getToken,
  login,
  switchEventTab,
  triggerDeclarationAction,
  validateActionMenuButton
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { REQUIRED_VALIDATION_ERROR } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  createDeclaration,
  type Declaration
} from '@e2e/support/test-data/death-declaration'
import { ActionType } from '@opencrvs/toolkit/events'

test('Spouse details restored on a later edit are reflected in review and audit (#13701)', async ({
  browser
}) => {
  test.setTimeout(180_000)

  const page = await browser.newPage()

  // Informant we switch to during the first edit. Any non-spouse relation makes
  // the "Spouse's details are not available" checkbox appear.
  const newInformant = {
    relation: 'Son',
    name: {
      firstNames: faker.person.firstName('male'),
      familyName: faker.person.lastName('male')
    },
    birthDate: getRandomDate(22, 200),
    email: faker.internet.email()
  }
  const notAvailableReason = 'Spouse could not be located at the time of edit'

  // Spouse details re-entered during the second edit. Because the first edit
  // clears the hidden spouse values, they come back empty and must be typed
  // again — so we assert against these, not the originally seeded values.
  const restoredSpouse = {
    name: {
      firstNames: faker.person.firstName('female'),
      familyName: faker.person.lastName('female')
    },
    birthDate: getRandomDate(20, 200)
  }
  const restoredSpouseName = `${restoredSpouse.name.firstNames} ${restoredSpouse.name.familyName}`

  let declaration: Declaration
  let deceasedName: string

  await test.step('Seed a declared death record with Spouse as informant (via API)', async () => {
    // The default death mock declares informant.relation = SPOUSE with a full
    // set of spouse details, which is exactly the starting state we need.
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER_VILLAGE)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)

    declaration = res.declaration
    // The death mock stores names as { firstname, surname }.
    deceasedName = `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
  })

  await test.step('Registrar opens the declared record and starts editing', async () => {
    await login(page, CREDENTIALS.REGISTRAR_VILLAGE)

    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, deceasedName)
    await expect(page.getByTestId('status-value')).toHaveText('Declared')

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
    await selectAction(page, 'Edit')
  })

  await test.step('Edit #1: change informant from Spouse to Son', async () => {
    await page.getByTestId('change-button-informant.relation').click()

    await page.locator('#informant____relation').click()
    await page.getByText(newInformant.relation, { exact: true }).click()
    await page.locator('#informant____email').fill(newInformant.email)

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Edit #1: fill the now-required informant details', async () => {
    await page.getByTestId('change-button-informant.name').click()

    await page.locator('#firstname').fill(newInformant.name.firstNames)
    await page.locator('#surname').fill(newInformant.name.familyName)

    await page.getByPlaceholder('dd').fill(newInformant.birthDate.dd)
    await page.getByPlaceholder('mm').fill(newInformant.birthDate.mm)
    await page.getByPlaceholder('yyyy').fill(newInformant.birthDate.yyyy)

    await page.getByTestId('select__informant____idType').click()
    await page.getByText('None', { exact: true }).click()

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Edit #1: mark spouse details as not available with a reason', async () => {
    // The spouse section is still shown (details present); open it to toggle.
    await page.getByTestId('change-button-spouse.name').click()

    await page.getByLabel("Spouse's details are not available").check()
    await page.locator('#spouse____reason').fill(notAvailableReason)

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByText(REQUIRED_VALIDATION_ERROR)).not.toBeVisible()
  })

  await test.step('Edit #1: Declare with edits', async () => {
    await validateActionMenuButton(page, 'Declare with edits')
    await triggerDeclarationAction(page, 'Declare with edits')
  })

  await test.step('Registrar re-opens the record and starts editing again', async () => {
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, deceasedName)

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
    await selectAction(page, 'Edit')
  })

  await test.step('Edit #2: uncheck not-available and re-enter spouse details', async () => {
    // Now that the flag is set, it is shown on review — open it to uncheck.
    await page.getByTestId('change-button-spouse.detailsNotAvailable').click()
    await page.getByLabel("Spouse's details are not available").uncheck()

    // The first edit cleared the hidden spouse values, so the fields come back
    // empty and required — re-enter them.
    await page.locator('#firstname').fill(restoredSpouse.name.firstNames)
    await page.locator('#surname').fill(restoredSpouse.name.familyName)
    await page.getByPlaceholder('dd').fill(restoredSpouse.birthDate.dd)
    await page.getByPlaceholder('mm').fill(restoredSpouse.birthDate.mm)
    await page.getByPlaceholder('yyyy').fill(restoredSpouse.birthDate.yyyy)
    await page.getByTestId('select__spouse____idType').click()
    await page.getByText('None', { exact: true }).click()

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByText(REQUIRED_VALIDATION_ERROR)).not.toBeVisible()
  })

  await test.step('Edit #2: review page shows the restored spouse details', async () => {
    // Sanity check: the spouse name is visible on review once re-entered. (The
    // stronger "shown as a change" indication is asserted via the audit entry
    // below, which is where the #13701 regression is observable.)
    await expect(page.getByTestId('spouse.name-value')).toContainText(
      restoredSpouseName
    )
  })

  await test.step('Edit #2: Register with edits', async () => {
    await validateActionMenuButton(page, 'Register with edits')
    await triggerDeclarationAction(page, 'Register with edits')
  })

  await test.step('Record tab shows the restored spouse details', async () => {
    // Sanity check on the final persisted state.
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await openRecordByTitle(page, deceasedName)
    await expect(page.getByTestId('status-value')).toHaveText('Registered')

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
    await switchEventTab(page, 'Record')
    await expect(page.getByTestId('spouse.name-value')).toHaveText(
      restoredSpouseName
    )
  })

  await test.step('Record Audit second edit contains the spouse details page', async () => {
    await switchEventTab(page, 'Summary')
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_VILLAGE)
    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: '2', exact: true }).click()

    await page.getByRole('button', { name: 'Edited', exact: true }).click()

    await expect(
      page.getByText("Spouse's name" + '-' + restoredSpouseName)
    ).toBeVisible()

    await page.locator('#close-dialog').click()
  })
})
