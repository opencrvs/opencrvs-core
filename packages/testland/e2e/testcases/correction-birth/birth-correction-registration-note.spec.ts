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
import { faker } from '@faker-js/faker'
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS } from '@e2e/support/constants'
import { getToken, login, triggerDeclarationAction } from '@e2e/support/helpers'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  waitForCorrectionAction
} from '@e2e/support/utils'
import {
  fillChildDetails,
  formatV2ChildName,
  openBirthDeclaration
} from '@e2e/support/birth/helpers'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration-with-mother-father'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

const REGISTRATION_NOTE = '#child____registrationNote'

test('A corrected event-conditional field is shown in the "Record corrected" modal', async ({
  page
}) => {
  const registrationNote = faker.lorem.sentence(5)
  const correctedRegistrationNote = faker.lorem.sentence(6)

  let declaration: Declaration
  let eventId: string

  await test.step('Declare a birth record', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      token,
      undefined,
      ActionType.DECLARE,
      'HEALTH_FACILITY'
    )
    declaration = res.declaration
    eventId = res.eventId

    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('Registration note is not available while declaring', async () => {
    await openBirthDeclaration(page)

    await expect(page.locator('#child____weightAtBirth')).toBeVisible()
    await expect(page.locator(REGISTRATION_NOTE)).toBeHidden()

    await fillChildDetails(page)
    await page.getByTestId('exit-button').click()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  })

  await test.step('Registration note is available once the record is declared', async () => {
    await page.getByRole('button', { name: 'Pending registration' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-child.registrationNote').click()
    await expect(page.locator(REGISTRATION_NOTE)).toBeVisible()
    await page.locator(REGISTRATION_NOTE).fill(registrationNote)

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(
      page.getByTestId('child.registrationNote-value')
    ).toContainText(registrationNote)
  })

  await test.step('Register the record with a registration note', async () => {
    await triggerDeclarationAction(page, 'Register with edits')
  })

  await test.step('Open a correction on the registered record', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
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
    await page.getByRole('button', { name: 'Verified' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#fees____amount').fill('0')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(page, `/events/request-correction/${eventId}/review`)
  })

  await test.step('Change the registration note', async () => {
    await page.getByTestId('change-button-child.registrationNote').click()
    await page.locator(REGISTRATION_NOTE).fill(correctedRegistrationNote)
    await page.getByRole('button', { name: 'Go to review' }).click()

    await expectInUrl(page, `/events/request-correction/${eventId}/review`)

    await expect(
      page.getByTestId('child.registrationNote-value').getByRole('deletion')
    ).toHaveText(registrationNote)
    await expect(
      page
        .getByTestId('child.registrationNote-value')
        .getByText(correctedRegistrationNote)
    ).toBeVisible()
  })

  await test.step('Submit the correction', async () => {
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expectInUrl(page, `/events/request-correction/${eventId}/summary`)

    await page.getByRole('button', { name: 'Correct' }).click()
    await expect(page.getByText('Correct record?')).toBeVisible()

    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })

    await expectInUrl(page, `/workqueue/pending-certification`)
  })

  await test.step('Record corrected modal shows the registration note change', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Audit' }).click()

    const recordCorrected = page.getByRole('button', {
      name: 'Record corrected',
      exact: true
    })
    const nextPage = page.getByRole('button', { name: 'Next page' })

    await expect(async () => {
      if (!(await recordCorrected.isVisible())) {
        await nextPage.click({ timeout: 2_000 })
      }
      await expect(recordCorrected).toBeVisible({ timeout: 2_000 })
    }).toPass({ timeout: 30_000 })

    await recordCorrected.click()

    await expect(
      page.getByRole('heading', { name: 'Record corrected', exact: true })
    ).toBeVisible()

    await expect(
      page.locator('#listTable-corrections-table-child')
    ).toContainText(
      `Registration note${registrationNote}${correctedRegistrationNote}`
    )

    await page.locator('#close-dialog').click()
  })
})
