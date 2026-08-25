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
import { Page } from '@playwright/test'
import { Declaration } from '@e2e/support/test-data/death-declaration'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { CREDENTIALS } from '@e2e/support/constants'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

export async function selectCertificationType(page: Page, type: string) {
  await page.locator('#certificateTemplateId svg').click()
  await page
    .locator('.react-select__menu')
    .getByText(type, { exact: true })
    .click()
}

export async function selectRequesterType(page: Page, type: string) {
  await page.locator('#collector____requesterId').click()
  await page.getByText(type, { exact: true }).click()
}

export async function navigateToCertificatePrintAction(
  page: Page,
  declaration: Declaration,
  username: (typeof CREDENTIALS)[keyof typeof CREDENTIALS]
) {
  const deceasedName = `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
  await openRecordByTitle(page, deceasedName)

  await ensureAssignedToUser(page, username)
  await selectAction(page, 'Print')
}
