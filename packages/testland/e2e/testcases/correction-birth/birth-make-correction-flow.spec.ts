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
import { getToken, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../test-data/birth-declaration-with-mother-father'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  waitForCorrectionAction
} from '../../utils'
import { formatV2ChildName, REQUIRED_VALIDATION_ERROR } from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

test.describe.serial('Birth Record correction flow', () => {
  let declaration: Declaration
  let eventId: string
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )
    declaration = res.declaration
    eventId = res.eventId

    page = await browser.newPage()
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('Navigate to the correction form', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    await selectAction(page, 'Correct')
  })

  test('Try to continue without filling in required fields', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('#requester____type_error')).toHaveText(
      REQUIRED_VALIDATION_ERROR
    )
    await expect(page.locator('#reason____option_error')).toHaveText(
      REQUIRED_VALIDATION_ERROR
    )
  })

  test('Fill in the correction details form', async () => {
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
  })

  test('Fill in the supporting documents form', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const path = require('path')
    const attachmentPath = path.join(__dirname, '../test-data/image.png')
    const inputFile = await page.locator(
      'input[name="documents____supportingDocs"][type="file"]'
    )

    await page.getByTestId('select__documents____supportingDocs').click()
    await page.getByText('Affidavit', { exact: true }).click()

    await inputFile.setInputFiles(attachmentPath)

    await page.getByTestId('select__documents____supportingDocs').click()
    await page.getByText('Court Document', { exact: true }).click()
    await inputFile.setInputFiles(attachmentPath)

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Fill in the fees form', async () => {
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Review page should be displayed and continue button should be disabled', async () => {
    await expectInUrl(page, `/events/request-correction/${eventId}/review`)
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  test('Go through the declaration correction form without changing any details', async () => {
    await page
      .getByRole('button', { name: 'Change all', exact: true })
      .first()
      .click()

    await expect(
      page.getByRole('button', { name: 'Go to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.getByRole('button', { name: 'Go to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.getByRole('button', { name: 'Go to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.getByRole('button', { name: 'Go to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('When back on review page, continue button should still be disabled', async () => {
    await expectInUrl(page, `/events/request-correction/${eventId}/review`)
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  test('After changing a value, continue button should be enabled', async () => {
    await page.getByTestId('change-button-informant.email').click()

    await page
      .getByTestId('text__informant____email')
      .fill(faker.internet.email())

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  test('After changing the value back to the original, continue button should be disabled', async () => {
    await page.getByTestId('change-button-informant.email').click()

    await page
      .getByTestId('text__informant____email')
      .fill(declaration['informant.email'])

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  test('After changing another value to an invalid value, continue button should still be disabled', async () => {
    await page.getByTestId('change-button-child.dob').click()
    // Future date
    await page.getByTestId('child____dob-yyyy').fill('2045')
    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await expect(page.getByText('Must be a valid birth date')).toBeVisible()
  })

  const reasonForDelayedRegistration = faker.lorem.sentence(4)

  test('After changing the value to a valid value, continue button should be enabled', async () => {
    await page.getByTestId('change-button-child.dob').click()
    await page.getByTestId('child____dob-yyyy').fill('2024')
    await page.getByTestId('child____dob-mm').fill('06')
    await page.getByTestId('child____dob-dd').fill('24')
    await page
      .getByTestId('text__child____reason')
      .fill(reasonForDelayedRegistration)
    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  test('Continue to the summary page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(page, `/events/request-correction/${eventId}/summary`)
    await expect(
      page.getByRole('button', { name: 'Go to review' })
    ).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Correct' })).toBeEnabled()
  })

  test('Press Fees change link and change the fee amount', async () => {
    await page.getByTestId('change-fees.amount').click()
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())
  })

  test('Return to summary page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Preview a file on summary page', async () => {
    await expect(
      page.getByRole('button', { name: 'Court Document' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Affidavit' }).click()

    await expect(
      page.getByRole('img', { name: 'Supporting Document' })
    ).toBeVisible()

    await page.locator('#preview_close').click()
  })

  test('Record correction', async () => {
    await page.getByRole('button', { name: 'Correct' }).click()

    await expect(page.getByText('Correct record?')).toBeVisible()

    await waitForCorrectionAction(page, 'approve', async () => {
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    })
    await expectInUrl(page, `/workqueue/pending-certification`)
  })

  test('Assign', async () => {
    await openRecordByTitle(page, formatV2ChildName(declaration))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
  })

  test('Record Correction audit history modal opens when action is clicked', async () => {
    await page.getByRole('button', { name: 'Audit' }).click()

    await page
      .getByRole('button', { name: 'Record corrected', exact: true })
      .click()

    await expect(
      page.getByRole('heading', { name: 'Record corrected', exact: true })
    ).toBeVisible()
    await expect(page.getByText('Informant (Mother)')).toBeVisible()
    await expect(
      page.getByText('Myself or an agent made a mistake (Clerical error)')
    ).toBeVisible()

    await expect(page.getByText('Correction(s)', { exact: true })).toBeVisible()
    await expect(page.getByText("Child's details")).toBeVisible()
    await expect(page.getByText(reasonForDelayedRegistration)).toBeVisible()

    await page.locator('#close-dialog').click()
  })
})
