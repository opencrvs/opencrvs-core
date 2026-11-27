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
  formatDateTo_dMMMMyyyy,
  goToSection,
  login,
  switchEventTab,
  uploadImage,
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
test('Approval of late birth registration -flag can be removed during edit and redeclare', async ({
  page
}) => {
  test.setTimeout(240_000)
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
  const declaration = res.declaration

  await test.step('Declaration Review by RO', async () => {
    await test.step('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByText('Pending validation').click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    await test.step('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    })

    await test.step("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    await test.step('Select Edit-action', async () => {
      await selectAction(page, 'Edit')
    })

    await test.step('Change child dob to recent date', async () => {
      await page.getByTestId('change-button-child.dob').click()
      const [recentYear, recentMonth, recentDay] = recentDateString.split('-')

      await page.getByPlaceholder('dd').fill(recentDay)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)
    })

    await test.step('Go back to review', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    await test.step('Declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')
    })

    await test.step('Go to record', async () => {
      await page.getByText('Recent').click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    await test.step("Event should not have the 'Approval required for late registration' -flag", async () => {
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

test('Approval of late birth registration -flag can be added during edit and redeclare', async ({
  page
}) => {
  test.setTimeout(240_000)
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

  const declaration = res.declaration

  await test.step('Declaration Review by Registrar', async () => {
    await test.step('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByText('Pending registration').click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    await test.step('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    await test.step("Event should not have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    await test.step('Select Edit-action', async () => {
      await selectAction(page, 'Edit')
    })

    await test.step('Change child dob to over a year ago date', async () => {
      await page.getByTestId('change-button-child.dob').click()

      const [lateRegYear, lateRegMonth, lateRegDay] =
        lateRegDateString.split('-')
      await page.getByPlaceholder('dd').fill(lateRegDay)
      await page.getByPlaceholder('mm').fill(lateRegMonth)
      await page.getByPlaceholder('yyyy').fill(lateRegYear)
      await page.locator('#child____reason').fill('Late registration reason')
    })

    await test.step('Upload a document during edit', async () => {
      await goToSection(page, 'documents')
      await uploadImage(
        page,
        page.locator('button[name="documents____proofOfBirth"]')
      )
    })

    await test.step('Go back to review', async () => {
      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    await test.step('Register with edits should be unavailable', async () => {
      await validateActionMenuButton(page, 'Register with edits', false)
    })

    await test.step('Declare with edits', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')
    })

    await test.step('Go to record', async () => {
      await page.getByText('Recent').click()

      await openRecordByTitle(page, formatV2ChildName(declaration))
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    await test.step("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
      await expect(page.getByTestId('flags-value')).not.toHaveText('Validated')
      await expect(page.getByTestId('flags-value')).not.toHaveText(
        'Edit in progress'
      )
    })

    await test.step('Assert audit trail', async () => {
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

      await page.getByTestId('close-dialog').click()
    })

    await test.step('Documents tab shows the document added during edit', async () => {
      await switchEventTab(page, 'Documents')
      await expect(
        page.locator('#listTable-documents').getByText('Proof of birth')
      ).toBeVisible()
    })
  })
})
