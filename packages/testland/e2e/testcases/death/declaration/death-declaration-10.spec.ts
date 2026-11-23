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
  expectRowValueWithChangeButton,
  goToSection,
  login,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction
} from '@e2e/support/utils'
import { REQUIRED_VALIDATION_ERROR } from '@e2e/support/birth/helpers'

test.describe.serial('10. Death declaration case - 10', () => {
  let page: Page

  const declaration = {
    deceased: {
      nationality: 'Farajaland',
      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo'
      }
    },
    informant: {
      relation: 'Grandson'
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
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('10.1.1 Fill deceased details', async () => {
      await continueForm(page)
    })

    test('10.1.2 Fill event details', async () => {
      // A place of death is needed, since hospital official may only declare a record in their own location
      await page.getByTestId('select__eventDetails____placeOfDeath').click()
      await page.getByText('Health Institution', { exact: true }).click()

      await page.locator('#eventDetails____deathLocation').fill('Klow Village')
      await page.getByText('Klow Village Hospital').click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('10.1.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informant.relation, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('10.1.4 Go to preview', async () => {
      await goToSection(page, 'review')
    })

    test('10.1.5 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.gender',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.nationality',
        'Farajaland'
      )
      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district
      )

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.date',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.email',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.nationality',
        'Farajaland'
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(page, 'spouse.addressSameAs', 'Yes')
    })

    test('10.1.6 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('10.1.7 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')

      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to assigned to you workqueue
       */
      await expectInUrl(page, 'assigned-to-you')

      await page.getByText('Recent').click()

      await expect(
        page
          .getByRole('button', {
            name: 'No name provided'
          })
          .first()
      ).toBeVisible()
    })
  })

  test.describe('10.1b Attestation by Health Administrator', async () => {
    test('Health Administrator attests the notification', async () => {
      await login(page, CREDENTIALS.HEALTH_ADMINISTRATOR)

      await page.getByText('Pending attestation').click()
      await page
        .getByRole('button', { name: 'No name provided' })
        .first()
        .click()

      await ensureAssignedToUser(page, CREDENTIALS.HEALTH_ADMINISTRATOR)
      await selectAction(page, 'Attest')
      await page.locator('#comments').fill('Attested for review')

      const attestResponse = page.waitForResponse(
        (response) =>
          response.url().includes('event.actions.custom') &&
          response.status() === 200
      )
      await page.getByRole('button', { name: 'Confirm' }).click()
      await attestResponse
    })
  })

  test.describe('10.2 Declaration Review by RO', async () => {
    test('10.2.1 Navigate to the declaration Edit-action', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Notifications').click()

      await page
        .getByRole('button', {
          name: 'No name provided'
        })
        .first()
        .click()

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await selectAction(page, 'Edit')
    })

    test('10.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.gender',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.nationality',
        'Farajaland'
      )
      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district
      )

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.date',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.email',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.nationality',
        'Farajaland'
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(page, 'spouse.addressSameAs', 'Yes')
    })
  })
})
