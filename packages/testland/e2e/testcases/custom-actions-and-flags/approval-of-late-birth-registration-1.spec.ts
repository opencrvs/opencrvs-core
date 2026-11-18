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
  continueForm,
  drawSignature,
  goToSection,
  login,
  searchFromSearchBar,
  switchEventTab,
  uploadImage,
  validateActionMenuButton,
  getToken
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'
import { format, subDays } from 'date-fns'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import {
  createDeclaration,
  getDeclaration
} from '@e2e/support/test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

const recentDate = subDays(new Date(), 2)
const recentDateString = format(recentDate, 'yyyy-MM-dd')

const lateRegDate = subDays(recentDate, 500)
const lateRegDateString = format(lateRegDate, 'yyyy-MM-dd')

/* Use API to declare when form filling does not have any relevant tests. For registrar there is a use case. For CL not. */
test('Approval of late birth registration', async ({ page }) => {
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
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    })

    await test.step("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    await test.step('RO should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
      await page.getByRole('button', { name: 'Action', exact: true }).click()
    })

    await test.step('Validate', async () => {
      const validateResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') && response.ok()
      )

      await selectAction(page, 'Validate')
      await page.getByRole('button', { name: 'Confirm' }).click()

      await validateResponse
    })
  })

  await test.step('Declaration Review by Registrar', async () => {
    await test.step('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByText('Pending approval').click()

      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    await test.step('LR should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })
  })

  await test.step('Declaration Review by PR(Provincial Registrar)', async () => {
    await test.step('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
      await page.getByText('Pending approval').first().click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    await test.step('Approve action should be disabled before assignment', async () => {
      await validateActionMenuButton(page, 'Approve', false)
    })

    await test.step('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
    })

    await test.step("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    await test.step('Fill comments field and add file before confirming Approve declaration', async () => {
      await selectAction(page, 'Approve')
      await expect(
        page.getByText(
          'Approving this declaration confirms it as legally accepted and eligible for registration.'
        )
      ).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeEnabled()

      const notesField = page.locator('#notes')
      await notesField.fill(
        'Approving after verifying all late submission details.'
      )

      // Upload a document in the action form so it can be asserted on the Documents tab against the Approve action.
      await uploadImage(page, page.locator('button[name="approvalNotice"]'))

      const approveResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') && response.ok()
      )

      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()
      await approveResponse
    })

    await test.step("Validate that the 'Approval required for late registration' -flag is removed after approval", async () => {
      await searchFromSearchBar(page, formatV2ChildName(declaration))

      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })
  })

  await test.step('Audit review by Registrar', async () => {
    await test.step('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR, true)
      await searchFromSearchBar(page, formatV2ChildName(declaration))
    })

    await test.step('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    await test.step('LR should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })

    await test.step('Validate that action and form field value appearing in audit trail', async () => {
      await switchEventTab(page, 'Audit')
      await page.getByRole('button', { name: 'Approved', exact: true }).click()
      await expect(
        page.getByText('Approving after verifying all late submission details.')
      ).toBeVisible()
      await page.getByTestId('close-dialog').click()
    })

    await test.step('Documents tab shows the document uploaded by the Approve action', async () => {
      await switchEventTab(page, 'Documents')

      const documentRows = page.locator('#listTable-documents [id^="row_"]')
      await expect(documentRows).toHaveCount(1)
      await expect(
        documentRows.first().getByText('Approval notice')
      ).toBeVisible()
      // The "Record action" column shows the action's configured label.
      await expect(
        documentRows.first().getByText('Approve', { exact: true })
      ).toBeVisible()
    })
  })
})

test('Birth with non-late registration will not have flag or Approve-action available', async ({
  page
}) => {
  const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
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

  await test.step('Declaration started by CL', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)

    await test.step('Navigate to the record', async () => {
      await page.getByText('Recent').click()

      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    await test.step("Record should not have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    await test.step('Record should not have the "Approve"-action available', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })
  })
})

test("'Approval required for late registration' -flag blocks direct registration", async ({
  page
}) => {
  await test.step('Declaration started by Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await test.step('Fill child details with birth date from over a year ago', async () => {
      await page.locator('#firstname').fill(faker.person.firstName())
      await page.locator('#surname').fill(faker.person.lastName())
      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      const [lateRegYear, lateRegMonth, lateRegDay] =
        lateRegDateString.split('-')
      await page.getByPlaceholder('dd').fill(lateRegDay)
      await page.getByPlaceholder('mm').fill(lateRegMonth)
      await page.getByPlaceholder('yyyy').fill(lateRegYear)
      await page.locator('#child____reason').fill('Late registration reason')

      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()
      await page
        .locator('#child____birthLocation')
        .fill('Ibombo District Hospital'.slice(0, 3))
      await page.getByText('Ibombo District Hospital').click()

      await continueForm(page)
    })

    await test.step('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

      await page.locator('#informant____email').fill('test@example.com')

      await continueForm(page)
    })

    await test.step("Fill mother's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('female'))
      await page.locator('#surname').fill(faker.person.lastName('female'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1980')

      await page.locator('#country').click()
      await page.locator('#country input').fill('Far')
      await page
        .locator('#country')
        .getByText('Farajaland', { exact: true })
        .click()

      await page.locator('#village').click()
      await page.getByText('Klow', { exact: true }).click()

      await page.locator('#mother____idType').click()
      await page.getByText('None', { exact: true }).click()

      await continueForm(page)
    })

    await test.step("Fill father's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('male'))
      await page.locator('#surname').fill(faker.person.lastName('male'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1985')

      await page.locator('#father____idType').click()
      await page.getByText('None', { exact: true }).click()

      await page.locator('#father____nationality').click()
      await page.getByText('Gabon', { exact: true }).click()

      await page.locator('#father____addressSameAs_YES').click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('Go to review', async () => {
      await goToSection(page, 'review')
    })

    await test.step('Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    await test.step('Direct registration should be unavailable', async () => {
      await validateActionMenuButton(page, 'Declare')
      await validateActionMenuButton(page, 'Register', false)
    })

    await test.step('Change child dob to recent date', async () => {
      await page.getByTestId('change-button-child.dob').click()

      const [recentYear, recentMonth, recentDay] = recentDateString.split('-')
      await page.getByPlaceholder('dd').fill(recentDay)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)

      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    await test.step('Direct registration should be available', async () => {
      await validateActionMenuButton(page, 'Register')
    })
  })
})
