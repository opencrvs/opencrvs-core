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
import { expect, test, type Page } from '@playwright/test'
import { login, saveAndExit } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  fillChildDetails,
  openBirthDeclaration,
  selectHealthInstitution,
  validateAddress
} from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { selectLocationOption } from '@e2e/support/utils'

async function selectFirstAvailableAdministrativeArea(page: Page, id: string) {
  const input = page.locator(`#${id}`)
  if ((await input.count()) === 0) {
    return undefined
  }
  if (!(await input.isDisabled())) {
    await input.click()
    const firstOption = page.locator('[id^="locationOption"]').first()
    const name = await firstOption.textContent()
    if (name) {
      await selectLocationOption(page, name)
    }
  }
  return (
    (await page
      .locator(`#searchable-select-${id} .react-select__single-value`)
      .textContent()) ?? undefined
  )
}

async function fillPrivateHomeAddress(page: Page) {
  await page.locator('#child____placeOfBirth').click()
  await page.getByText('Residential address', { exact: true }).click()

  const province = await selectFirstAvailableAdministrativeArea(
    page,
    'province'
  )
  const district = await selectFirstAvailableAdministrativeArea(
    page,
    'district'
  )
  const village = await selectFirstAvailableAdministrativeArea(page, 'village')

  return { province, district, village }
}

test.describe('Draft birth declarations show the Record tab to their own creator', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('Hospital Official sees the Record tab on their own draft after selecting their health facility', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await openBirthDeclaration(page)

    const childName = await fillChildDetails(page)
    const facilityName = await selectHealthInstitution(page)

    await saveAndExit(page)

    await page.getByRole('button', { name: 'Drafts' }).click()
    await openRecordByTitle(page, childName)

    await expect(
      page.getByRole('button', { name: 'Record', exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Record', exact: true }).click()

    await expect(page.getByTestId('child.birthLocation-value')).toContainText(
      facilityName ?? ''
    )
  })

  test('Embassy Official sees the Record tab on their own draft after editing the address', async () => {
    await login(page, CREDENTIALS.EMBASSY_OFFICIAL)
    await openBirthDeclaration(page)

    const childName = await fillChildDetails(page)
    const address = await fillPrivateHomeAddress(page)

    await saveAndExit(page)

    await page.getByRole('button', { name: 'Drafts' }).click()
    await openRecordByTitle(page, childName)

    await expect(
      page.getByRole('button', { name: 'Record', exact: true })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Record', exact: true }).click()

    await validateAddress(
      page,
      address,
      'child.birthLocation.privateHome-value'
    )
  })
})
