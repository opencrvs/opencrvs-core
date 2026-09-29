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
  formatName,
  goToSection,
  login,
  switchEventTab,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import { REQUIRED_VALIDATION_ERROR } from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test.describe.serial('10. Birth declaration case - 10', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.lastName(),
        familyName: faker.person.lastName()
      }
    },
    informantType: 'Father',
    mother: {
      detailsDontExist: true
    },
    father: {
      detailsDontExist: false
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('10.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('10.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await continueForm(page)
    })

    test('10.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test("10.1.3 Fill mother's details", async () => {
      await page.getByLabel("Mother's details are not available").check()
      await continueForm(page)
    })

    test("10.1.4 Fill father's details", async () => {
      await continueForm(page)
    })

    test('10.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('10.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('child.name-value')).toContainText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.getByTestId('child.gender-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.getByTestId('child.dob-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('child.placeOfBirth-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.getByTestId('informant.relation-value')).toContainText(
        declaration.informantType
      )

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('informant.email-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Reason of why mother's details not available
       */
      await expect(page.getByTestId('mother.reason-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('father.name-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.getByTestId('father.dob-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.getByTestId('father.idType-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    })

    test('10.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('10.1.8 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')

      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('10.2 Declaration Review by RO', async () => {
    test("10.2.1 Navigate to the declaration 'Record' tab", async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Notifications').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await switchEventTab(page, 'Record')
    })

    test("10.2.2 Verify information on 'Record' tab", async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * * should require
       * - Child's Family Name
       */
      await expect(page.getByTestId('child.name-value')).toContainText(
        declaration.child.name.firstNames
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.getByTestId('child.gender-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.getByTestId('child.dob-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('child.placeOfBirth-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.getByTestId('informant.relation-value')).toContainText(
        declaration.informantType
      )

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('informant.email-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Reason of why mother's details not available
       */
      await expect(page.getByTestId('mother.reason-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('father.name-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.getByTestId('father.dob-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.getByTestId('father.idType-value')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    })
  })
})
