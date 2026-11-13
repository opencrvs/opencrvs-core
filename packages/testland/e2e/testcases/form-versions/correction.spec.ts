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
import { BirthVersion } from '@countryconfig/events/birth/versions'
import { CREDENTIALS } from '@e2e/support/constants'
import { getToken, login, searchFromSearchBar } from '@e2e/support/helpers'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { createVersionedRecord } from '@e2e/support/form-versions'

/** Opens a correction of the record of version `version` and fills in the requester and the reason. */
async function startCorrection(page: Page, version: BirthVersion) {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const { declaration } = await createVersionedRecord(token, version)

  await login(page, CREDENTIALS.REGISTRAR)
  await searchFromSearchBar(page, formatV2ChildName(declaration))
  await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  await selectAction(page, 'Correct')

  await page.locator('#requester____type').click()
  await page.getByText('Informant (Mother)', { exact: true }).click()
  await page.locator('#reason____option').click()
  await page
    .getByText('Myself or an agent made a mistake (Clerical error)', {
      exact: true
    })
    .click()
  await page.getByRole('button', { name: 'Continue' }).click()
}

/** Fills in the fees page that comes after the supporting documents page. */
async function fillFees(page: Page) {
  await page.locator('#fees____amount').fill('10')
  await page.getByRole('button', { name: 'Continue' }).click()
}

test.describe('Correction of a birth version', () => {
  test("A record of version 'v2' asks to verify the requester's identity", async ({
    page
  }) => {
    await startCorrection(page, BirthVersion.V2)

    await expect(page.getByText('Verify their identity')).toBeVisible()
    await page.getByRole('button', { name: 'Verified', exact: true }).click()

    await expect(
      page.getByTestId('select__documents____supportingDocs')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
    await fillFees(page)

    await expect(page.getByTestId('change-button-mother.name')).toBeVisible()
    await expect(
      page.getByTestId('change-button-mother.maritalStatus')
    ).toHaveCount(0)
  })

  test("A record of version 'initial' skips the identity check and has the marital status", async ({
    page
  }) => {
    await startCorrection(page, BirthVersion.INITIAL)

    await expect(
      page.getByTestId('select__documents____supportingDocs')
    ).toBeVisible()
    await expect(page.getByText('Verify their identity')).toHaveCount(0)
    await page.getByRole('button', { name: 'Continue' }).click()
    await fillFees(page)

    await expect(
      page.getByTestId('change-button-mother.maritalStatus')
    ).toBeVisible()
  })
})
