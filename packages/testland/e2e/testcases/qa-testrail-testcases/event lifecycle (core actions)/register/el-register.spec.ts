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
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS } from '../../../../constants'
import { ensureAssignedToUser } from '../../utils'
import { selectAction } from '../../../../utils'
import {
  createDeclaration as createBirthDeclaration,
  type Declaration as BirthDeclaration
} from '../../../../testcases/test-data/birth-declaration'
import {
  createDeclaration as createDeathDeclaration,
  type Declaration as DeathDeclaration
} from '../../../../testcases/test-data/death-declaration'
import { formatV2ChildName } from '../../../../testcases/birth/helpers'
import { getToken, joinValuesWith, login } from '../../../../helpers'
import { openRecordByTitle, searchFromSearchBar } from '../../helpers'

const formatV2DeceasedName = (declaration: {
  'deceased.name': { firstname: string; surname: string }
  [key: string]: any
}) =>
  joinValuesWith([
    declaration['deceased.name'].firstname,
    declaration['deceased.name'].surname
  ])

// TestRail TC-0071: Validate 'Register?' modal
// (1 of 2 e2e tests in this file covering this test case - birth events)
test("Validate the 'Register?' modal for birth events", async ({ page }) => {
  test.setTimeout(180_000)

  let declaration: BirthDeclaration

  await test.step('Registrar declares a birth record via API (auto-validated)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createBirthDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Login as Registrar and assign the record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  const confirmButton = page.getByRole('button', { name: 'Confirm' })
  const cancelButton = page.getByRole('button', { name: 'Cancel' })

  await test.step('Open the Register modal and inspect its contents', async () => {
    await selectAction(page, 'Register')

    await expect(page.getByText('Register?', { exact: true })).toBeVisible()
    await expect(
      page.getByText(
        'Registering this birth event will create an official civil registration record. Please ensure all details are correct before proceeding.'
      )
    ).toBeVisible()
    await expect(page.getByText('WARNING!', { exact: false })).toBeVisible()

    await expect(
      page.getByText('Supporting documents reviewed?')
    ).toBeVisible()
    await expect(page.getByText('Register book number')).toBeVisible()
    await expect(page.getByText('Register page number')).toBeVisible()
    await expect(page.getByText('Additional comments')).toBeVisible()
    await expect(cancelButton).toBeVisible()
  })

  await test.step("Confirm is disabled until 'Supporting documents reviewed?' is answered", async () => {
    await expect(confirmButton).toBeDisabled()
  })

  await test.step("Selecting an option for 'Supporting documents reviewed?' enables Confirm", async () => {
    await page.locator('#documents-verified').click()
    await page.locator('.react-select__option', { hasText: /^Yes$/ }).click()

    await expect(confirmButton).toBeEnabled()
  })

  await test.step('Cancel closes the modal without registering', async () => {
    await cancelButton.click()
    await expect(page.getByText('Register?', { exact: true })).not.toBeVisible()
    await expect(page.getByTestId('status-value')).toHaveText('Declared')
  })

  await test.step('Confirm registers the record', async () => {
    await selectAction(page, 'Register')
    await page.locator('#documents-verified').click()
    await page.locator('.react-select__option', { hasText: /^Yes$/ }).click()

    const registerResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.register') && res.ok()
    )
    await page.getByRole('button', { name: 'Confirm' }).click()
    await registerResponse

    // Register navigates the user out of the record view - re-find it.
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Registered')
  })
})

// TestRail TC-0071: Validate 'Register?' modal
// (2 of 2 e2e tests in this file covering this test case - death events)
test("Validate the 'Register?' modal for death events", async ({ page }) => {
  test.setTimeout(180_000)

  let declaration: DeathDeclaration

  await test.step('Registrar declares a death record via API (auto-validated)', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeathDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )
    declaration = res.declaration
  })

  await test.step('Login as Registrar and assign the record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await openRecordByTitle(page, formatV2DeceasedName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Open the Register modal and inspect its contents', async () => {
    await selectAction(page, 'Register')

    await expect(page.getByText('Register?', { exact: true })).toBeVisible()
    await expect(
      page.getByText(
        'Registering this death event will create an official civil registration record. Please ensure all details are correct before proceeding.'
      )
    ).toBeVisible()
    await expect(page.getByText('Additional comments')).toBeVisible()

    // Unlike birth, death's Register dialog has no required field, so it has
    // no 'Supporting documents reviewed?'/book/page-number fields either.
    await expect(
      page.getByText('Supporting documents reviewed?')
    ).not.toBeVisible()

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeEnabled()
  })

  await test.step('Cancel closes the modal without registering', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Register?', { exact: true })).not.toBeVisible()
    await expect(page.getByTestId('status-value')).toHaveText('Declared')
  })

  await test.step('Confirm registers the record', async () => {
    await selectAction(page, 'Register')

    const registerResponse = page.waitForResponse(
      (res) => res.url().includes('event.actions.register') && res.ok()
    )
    await page.getByRole('button', { name: 'Confirm' }).click()
    await registerResponse

    // Register navigates the user out of the record view - re-find it.
    await searchFromSearchBar(page, formatV2DeceasedName(declaration))
    await expect(page.getByTestId('status-value')).toHaveText('Registered')
  })
})
