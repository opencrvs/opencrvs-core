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
import { getToken, login, logout } from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration-with-mother-father'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction,
  type,
  waitForCorrectionAction
} from '@e2e/support/utils'
import {
  formatV2ChildName,
  REQUIRED_VALIDATION_ERROR
} from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { ASSETS_DIR } from '@e2e/support/paths'

test('Birth correction flow', async ({ page }) => {
  test.setTimeout(180_000)
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const res = await createDeclaration(
    token,
    undefined,
    undefined,
    'HEALTH_FACILITY'
  )
  const declaration = res.declaration
  const eventId = res.eventId
  await login(page, CREDENTIALS.REGISTRATION_OFFICER)

  await test.step('Navigate to the correction form', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await openRecordByTitle(page, formatV2ChildName(declaration))
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    await selectAction(page, 'Correct')
  })

  await test.step('Try to continue without filling in required fields', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('#requester____type_error')).toHaveText(
      REQUIRED_VALIDATION_ERROR
    )
    await expect(page.locator('#reason____option_error')).toHaveText(
      REQUIRED_VALIDATION_ERROR
    )
  })

  await test.step('Fill in the correction details form', async () => {
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

  await test.step('Fill in the supporting documents form', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const path = require('path')
    const attachmentPath = path.join(ASSETS_DIR, 'image.png')
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

  await test.step('Fill in the fees form', async () => {
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Review page should be displayed and continue button should be disabled', async () => {
    await expectInUrl(page, `/events/request-correction/${eventId}/review`)
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  await test.step('Go through the declaration correction form without changing any details', async () => {
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

  await test.step('When back on review page, continue button should still be disabled', async () => {
    await expectInUrl(page, `/events/request-correction/${eventId}/review`)
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  await test.step('After changing a value, continue button should be enabled', async () => {
    await page.getByTestId('change-button-informant.email').click()

    await page
      .getByTestId('text__informant____email')
      .fill(faker.internet.email())

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  await test.step('After changing the value back to the original, continue button should be disabled', async () => {
    await page.getByTestId('change-button-informant.email').click()

    await page
      .getByTestId('text__informant____email')
      .fill(declaration['informant.email'])

    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  await test.step('After changing another value to an invalid value, continue button should still be disabled', async () => {
    await page.getByTestId('change-button-child.dob').click()
    // Future date
    await page.getByTestId('child____dob-yyyy').fill('2045')
    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await expect(page.getByText('Must be a valid birth date')).toBeVisible()
  })

  const newFirstName = faker.person.firstName()
  const reasonForDelayedRegistration = faker.lorem.sentence(4)

  await test.step('After changing the value to a valid value, continue button should be enabled', async () => {
    await page.getByTestId('change-button-child.dob').click()
    await page.getByTestId('child____dob-yyyy').fill('2024')
    await page.getByTestId('child____dob-mm').fill('06')
    await page.getByTestId('child____dob-dd').fill('24')
    await page
      .getByTestId('text__child____reason')
      .fill(reasonForDelayedRegistration)

    await type(page, '#firstname', newFirstName)
    await page.getByRole('button', { name: 'Go to review' }).click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  await test.step('Continue to the summary page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(page, `/events/request-correction/${eventId}/summary`)
    await expect(
      page.getByRole('button', { name: 'Go to review' })
    ).toBeEnabled()
    await expect(
      page.getByRole('button', { name: 'Submit correction request' })
    ).toBeEnabled()
  })

  await test.step('Press Fees change link and change the fee amount', async () => {
    await page.getByTestId('change-fees.amount').click()
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())
  })

  await test.step('Return to summary page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Preview a file on summary page', async () => {
    await expect(
      page.getByRole('button', { name: 'Court Document' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Affidavit' }).click()

    await expect(
      page.getByRole('img', { name: 'Supporting Document' })
    ).toBeVisible()

    await page.locator('#preview_close').click()
  })

  await test.step('Submit correction request', async () => {
    await page
      .getByRole('button', { name: 'Submit correction request' })
      .click()

    const correctionResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.correction.request') && res.ok()
    )

    await expect(page.getByText('Request record correction?')).toBeVisible()

    await page.getByRole('button', { name: 'Confirm', exact: true }).click()

    await correctionResponse
    await expectInUrl(page, `/workqueue/pending-certification`)
  })

  await test.step("Event appears in 'Recent' workqueue", async () => {
    await page.getByText('Recent').click()

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
  })

  await test.step('Approve correction request', async () => {
    await test.step('Login as Registrar', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRAR)
    })

    await test.step("Find the event in the 'Pending corrections' workflow", async () => {
      await page.getByRole('button', { name: 'Pending corrections' }).click()

      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    await test.step('Correction request action appears in audit history', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await page.getByRole('button', { name: 'Audit' }).click()
      await expect(
        page.getByRole('button', { name: 'Correction requested', exact: true })
      ).toBeVisible()
    })

    await test.step('Correction request audit history modal opens when action is clicked', async () => {
      await page
        .getByRole('button', { name: 'Correction requested', exact: true })
        .click()

      await expect(page.getByText('RequesterInformant (Mother)')).toBeVisible()
      await expect(
        page.getByText(
          'Reason for correctionMyself or an agent made a mistake (Clerical error)'
        )
      ).toBeVisible()

      await expect(page.getByText("Child's details")).toBeVisible()
      await expect(
        page.getByText(
          `Reason for delayed registration-${reasonForDelayedRegistration}`
        )
      ).toBeVisible()

      await page.locator('#close-dialog').click()
    })

    await test.step('Navigate to correction review', async () => {
      await selectAction(page, 'Review correction request')

      await expect(page.getByText('RequesterInformant (Mother)')).toBeVisible()
      await expect(
        page.getByText(
          'Reason for correctionMyself or an agent made a mistake (Clerical error)'
        )
      ).toBeVisible()

      await expect(
        page.getByRole('heading', { name: "Child's details" })
      ).toBeVisible()
    })

    await test.step('Approve correction request', async () => {
      await page.getByRole('button', { name: 'Approve', exact: true }).click()
      await waitForCorrectionAction(page, 'approve', async () => {
        await page.getByRole('button', { name: 'Confirm', exact: true }).click()
      })
      await expectInUrl(page, `/workqueue/correction-requested`)

      await page.getByRole('button', { name: 'Pending certification' }).click()
      const childName = formatV2ChildName({
        'child.name': {
          firstname: newFirstName,
          surname: declaration['child.name'].surname
        }
      })
      await openRecordByTitle(page, childName)
    })

    await test.step('Correction approved action appears in audit history', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await page.getByRole('button', { name: 'Audit' }).click()

      await expect(
        page.getByRole('button', { name: 'Correction approved', exact: true })
      ).toBeVisible()
    })

    await test.step('Enter the direct correction form to ensure form is reset', async () => {
      await selectAction(page, 'Correct')

      await expect(page.locator('#requester____type')).toHaveText('Select')
      await expect(page.locator('#reason____option')).toHaveText('Select')
      await page.getByTestId('exit-button')
    })
  })
})
