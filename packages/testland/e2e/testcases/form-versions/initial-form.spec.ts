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
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  getToken,
  goToSection,
  login,
  searchFromSearchBar
} from '@e2e/support/helpers'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import {
  BirthVersionLabel,
  createVersionedRecord,
  startBirthDeclaration
} from '@e2e/support/form-versions'

const DEPRECATED_NOTE =
  'This is a deprecated form version. It was in use before 1 September 2026.'

test.describe("Birth form version 'initial'", () => {
  test('The form has the fields of version initial', async ({ page }) => {
    await login(page, CREDENTIALS.REGISTRAR)
    await startBirthDeclaration(page, BirthVersionLabel[BirthVersion.INITIAL])

    await test.step('The introduction page shows the deprecated note', async () => {
      await expect(page.getByText(DEPRECATED_NOTE)).toBeVisible()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('Child page', async () => {
      await expect(page.getByText("Child's details")).toBeVisible()
      await expect(page.getByText('Facility of occurrence')).toBeVisible()
      await expect(page.getByText('Place of delivery')).toHaveCount(0)
      await expect(page.locator('#child____birthType')).toHaveCount(0)
      await expect(page.locator('#child____weightAtBirth')).toHaveCount(0)
    })

    await test.step('Informant page offers brother and sister, not legal guardian', async () => {
      await goToSection(page, 'informant')
      await page.locator('#informant____relation').click()
      await expect(page.getByText('Brother', { exact: true })).toBeVisible()
      await expect(page.getByText('Sister', { exact: true })).toBeVisible()
      await expect(
        page.getByText('Legal guardian', { exact: true })
      ).toHaveCount(0)
      await page.keyboard.press('Escape')
    })

    await test.step('Mother page has marital status and no date of birth validation', async () => {
      await goToSection(page, 'mother')
      await expect(page.locator('#mother____maritalStatus')).toBeVisible()

      const nextYear = String(new Date().getFullYear() + 1)
      await page.locator('#mother____dob-dd').fill('01')
      await page.locator('#mother____dob-mm').fill('01')
      await page.locator('#mother____dob-yyyy').fill(nextYear)
      await page.locator('#mother____dob-yyyy').blur()
      await expect(page.locator('#mother____dob_error')).toHaveCount(0)
    })

    await test.step('Father page has marital status', async () => {
      await goToSection(page, 'father')
      await expect(page.locator('#father____maritalStatus')).toBeVisible()
    })

    await test.step('Review page does not ask for the signature of the informant', async () => {
      await goToSection(page, 'review')
      await expect(page.locator('#review____comment')).toBeVisible()
      await expect(page.getByText('Signature of informant')).toHaveCount(0)
    })
  })

  test('A record of version initial can be registered', async ({ page }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const { declaration, registrationNumber } = await createVersionedRecord(
      token,
      BirthVersion.INITIAL
    )
    expect(registrationNumber).toBeTruthy()

    await login(page, CREDENTIALS.REGISTRAR)
    await searchFromSearchBar(page, formatV2ChildName(declaration))
    await expect(page.getByTestId('configVersion-value')).toHaveText(
      BirthVersion.INITIAL
    )
    await expect(page.getByTestId('status-value')).toHaveText('Registered')
  })
})
