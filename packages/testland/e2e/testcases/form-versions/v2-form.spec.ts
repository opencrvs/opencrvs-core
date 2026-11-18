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
import { ActionType } from '@opencrvs/toolkit/events'
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { CREDENTIALS } from '@e2e/support/constants'
import { getToken, goToSection, login } from '@e2e/support/helpers'
import {
  createDeclaration,
  getNotificationDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { startBirthDeclaration } from '@e2e/support/form-versions'

test.describe("Birth form version 'v2'", () => {
  test('The form has the fields and validation of version v2', async ({
    page
  }) => {
    await login(page, CREDENTIALS.REGISTRAR)
    await startBirthDeclaration(page)

    await test.step('The introduction page has no deprecated note', async () => {
      await expect(
        page.getByText('This is a deprecated form version')
      ).toHaveCount(0)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('Child page', async () => {
      await expect(page.getByText("Child's details")).toBeVisible()
      await expect(page.getByText('Place of delivery')).toBeVisible()
      await expect(page.getByText('Facility of occurrence')).toHaveCount(0)
      await expect(page.locator('#child____birthType')).toBeVisible()
      await expect(page.locator('#child____weightAtBirth')).toBeVisible()

      // The mother's date of birth is validated against this date.
      await page.getByPlaceholder('dd').fill('10')
      await page.getByPlaceholder('mm').fill('01')
      await page.getByPlaceholder('yyyy').fill('2026')
    })

    await test.step('Informant page offers legal guardian, not brother or sister', async () => {
      await goToSection(page, 'informant')
      await page.locator('#informant____relation').click()
      await expect(
        page.getByText('Legal guardian', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('Brother', { exact: true })).toHaveCount(0)
      await expect(page.getByText('Sister', { exact: true })).toHaveCount(0)
      await page.keyboard.press('Escape')
    })

    await test.step('Mother page has no marital status and validates the date of birth', async () => {
      await goToSection(page, 'mother')
      await expect(page.locator('#mother____maritalStatus')).toHaveCount(0)

      const nextYear = String(new Date().getFullYear() + 1)
      await page.locator('#mother____dob-dd').fill('01')
      await page.locator('#mother____dob-mm').fill('01')
      await page.locator('#mother____dob-yyyy').fill(nextYear)
      await page.locator('#mother____dob-yyyy').blur()
      await expect(page.locator('#mother____dob_error')).toHaveText(
        'Must be a valid birth date'
      )

      // 11 years before the child's date of birth
      await page.locator('#mother____dob-yyyy').fill('2015')
      await page.locator('#mother____dob-yyyy').blur()
      await expect(page.locator('#mother____dob_error')).toHaveText(
        "Birth date must be 18 years before child's birth date"
      )
    })

    await test.step('Father page has no marital status', async () => {
      await goToSection(page, 'father')
      await expect(page.locator('#father____maritalStatus')).toHaveCount(0)
    })

    await test.step('Review page asks for the signature of the informant', async () => {
      await goToSection(page, 'review')
      await expect(page.getByText('Signature of informant')).toBeVisible()
    })
  })

  test('A notification of version v2 requires the type of birth', async () => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    const { 'child.birthType': _, ...declaration } =
      await getNotificationDeclaration({ token })

    await expect(
      createDeclaration(
        token,
        declaration,
        ActionType.NOTIFY,
        undefined,
        undefined,
        BirthVersion.V2
      )
    ).rejects.toThrow()
  })

  test('A notification of version initial does not need the type of birth', async () => {
    const token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
    const { 'child.birthType': _, ...declaration } =
      await getNotificationDeclaration({ token })

    const { eventId } = await createDeclaration(
      token,
      declaration,
      ActionType.NOTIFY,
      undefined,
      undefined,
      BirthVersion.INITIAL
    )
    expect(eventId).toBeTruthy()
  })
})
