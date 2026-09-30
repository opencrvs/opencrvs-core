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
  continueForm,
  drawSignature,
  goToSection,
  login,
  searchFromSearchBar,
  switchEventTab,
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
test.describe.serial('Approval of late birth registration', () => {
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
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    test('RO should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
      await page.getByRole('button', { name: 'Action', exact: true }).click()
    })

    test('Validate', async () => {
      const validateResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') && response.ok()
      )

      await selectAction(page, 'Validate')
      await page.getByRole('button', { name: 'Confirm' }).click()

      await validateResponse
    })
  })

  test.describe('Declaration Review by Registrar', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByText('Pending approval').click()

      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    test('LR should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })
  })

  test.describe('Declaration Review by PR(Provincial Registrar)', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
      await page.getByText('Pending approval').first().click()
      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    test('Approve action should be disabled before assignment', async () => {
      await validateActionMenuButton(page, 'Approve', false)
    })

    test('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    test('Fill comments field before confirming Approve declaration', async () => {
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

      const approveResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') && response.ok()
      )

      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()
      await approveResponse
    })

    test("Validate that the 'Approval required for late registration' -flag is removed after approval", async () => {
      await searchFromSearchBar(page, formatV2ChildName(declaration))

      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })
  })

  test.describe('Audit review by Registrar', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR, true)
      await searchFromSearchBar(page, formatV2ChildName(declaration))
    })

    test('Assign', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
    })

    test('LR should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })

    test('Validate that action and form field value appearing in audit trail', async () => {
      await switchEventTab(page, 'Audit')
      await page.getByRole('button', { name: 'Approved', exact: true }).click()
      await expect(
        page.getByText('Approving after verifying all late submission details.')
      ).toBeVisible()
    })
  })
})

test.describe('Birth with non-late registration will not have flag or Approve-action available', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

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
    declaration = res.declaration
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe.serial('Declaration started by CL', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.COMMUNITY_LEADER)
    })

    test('Navigate to the record', async () => {
      await page.getByText('Recent').click()

      await openRecordByTitle(page, formatV2ChildName(declaration))
    })

    test("Record should not have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    test('Record should not have the "Approve"-action available', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })
  })
})

test.describe
  .serial("'Approval required for late registration' -flag blocks direct registration", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by Registrar', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details with birth date from over a year ago', async () => {
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

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

      await page.locator('#informant____email').fill('test@example.com')

      await continueForm(page)
    })

    test("Fill mother's details", async () => {
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

    test("Fill father's details", async () => {
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

    test('Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Direct registration should be unavailable', async () => {
      await validateActionMenuButton(page, 'Declare')
      await validateActionMenuButton(page, 'Register', false)
    })

    test('Change child dob to recent date', async () => {
      await page.getByTestId('change-button-child.dob').click()
      await page.getByRole('button', { name: 'Continue' }).click()

      const [recentYear, recentMonth, recentDay] = recentDateString.split('-')
      await page.getByPlaceholder('dd').fill(recentDay)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)

      await page.getByRole('button', { name: 'Go to review' }).click()
    })

    test('Direct registration should be available', async () => {
      await validateActionMenuButton(page, 'Register')
    })
  })
})
