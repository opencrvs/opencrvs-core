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
  formatDateTo_dMMMMyyyy,
  login,
  switchEventTab,
  validateActionMenuButton,
  getEventIdFromUrl,
  triggerDeclarationAction,
  getToken
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { format, subDays } from 'date-fns'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  createDeclaration,
  Declaration,
  getDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

const recentDate = subDays(new Date(), 2)
const recentDateString = format(recentDate, 'yyyy-MM-dd')

const lateRegDate = subDays(recentDate, 500)
const lateRegDateString = format(lateRegDate, 'yyyy-MM-dd')

/* Use API to declare when form filling does not have any relevant tests. For registrar there is a use case. For CL not. */
test.describe
  .serial('Approval of late birth registration -flag can be removed during edit and redeclare', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
    const declarationRequest = await getDeclaration({
      token,
      partialDeclaration: {
        'child.dob': lateRegDateString,
        'child.reason': 'Late registration'
      },
      placeOfBirthType: 'PRIVATE_HOME'
    })
    const res = await createDeclaration(
      token,
      declarationRequest,
      ActionType.DECLARE,
      'PRIVATE_HOME'
    )
    declaration = res.declaration
  })
  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration Review by RO', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByText('Pending validation').click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    test('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    test('Select Edit-action', async () => {
      await selectAction(page, 'Edit')
    })

    test('Change child dob to recent date', async () => {
      await page.getByTestId('change-button-child.dob').click()
      const [recentYear, recentMonth, recentDay] = recentDateString.split('-')

      await page.getByPlaceholder('dd').fill(recentDay)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)
    })

    test('Go back to review', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    test('Declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')
    })

    test('Go to record', async () => {
      await page.getByText('Recent').click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    test("Event should not have the 'Approval required for late registration' -flag", async () => {
      await expect(page.getByTestId('flags-value')).toHaveText('Validated')
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
      await expect(page.getByTestId('flags-value')).not.toHaveText(
        'Edit in progress'
      )
    })
  })
})

test.describe
  .serial('Approval of late birth registration -flag can be added during edit and redeclare', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
    const declarationRequest = await getDeclaration({
      token,
      partialDeclaration: {
        'child.dob': recentDateString
      },
      placeOfBirthType: 'PRIVATE_HOME'
    })
    const res = await createDeclaration(
      token,
      declarationRequest,
      ActionType.DECLARE,
      'PRIVATE_HOME'
    )

    declaration = res.declaration
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration Review by Registrar', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByText('Pending registration').click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    test('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    test("Event should not have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    test('Select Edit-action', async () => {
      await selectAction(page, 'Edit')
    })

    test('Change child dob to over a year ago date', async () => {
      await page.getByTestId('change-button-child.dob').click()

      const [lateRegYear, lateRegMonth, lateRegDay] =
        lateRegDateString.split('-')
      await page.getByPlaceholder('dd').fill(lateRegDay)
      await page.getByPlaceholder('mm').fill(lateRegMonth)
      await page.getByPlaceholder('yyyy').fill(lateRegYear)
      await page.locator('#child____reason').fill('Late registration reason')
    })

    test('Go back to review', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    test('Register with edits should be unavailable', async () => {
      await validateActionMenuButton(page, 'Register with edits', false)
    })

    test('Declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')
    })

    test('Go to record', async () => {
      await page.getByText('Recent').click()

      await openRecordByTitle(page, formatV2ChildName(declaration))
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
      await expect(page.getByTestId('flags-value')).not.toHaveText('Validated')
      await expect(page.getByTestId('flags-value')).not.toHaveText(
        'Edit in progress'
      )
    })

    test('Assert audit trail', async () => {
      await switchEventTab(page, 'Audit')

      await page.getByRole('button', { name: 'Edited', exact: true }).click()
      await expect(
        page.getByText(
          'Date of birth' +
            formatDateTo_dMMMMyyyy(format(recentDate, 'yyyy-MM-dd')) +
            formatDateTo_dMMMMyyyy(format(lateRegDate, 'yyyy-MM-dd'))
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Reason for delayed registration-Late registration reason'
        )
      ).toBeVisible()
    })
  })
})
