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
  getRandomDate,
  drawSignature,
  goToSection,
  uploadImageToSection,
  continueForm,
  login,
  formatDateObjectTo_dMMMMyyyy,
  expectRowValue,
  expectRowValueWithChangeButton,
  switchEventTab,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  ensureAssignedToUser,
  expectInUrl,
  selectAction
} from '@e2e/support/utils'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

test.describe.serial('8. Validate declaration review page', () => {
  let page: Page

  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      gender: 'Male',
      dob: getRandomDate(75, 200),
      nationality: 'Farajaland',
      idType: 'National ID',
      nid: faker.string.numeric(10),
      passport: '',
      brn: '',
      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo',
        village: 'Klow'
      }
    },
    eventDetails: {
      date: getRandomDate(0, 20),
      causeOfDeathEstablished: false,
      placeOfDeath: 'Health Institution',
      deathLocation: 'Klow Village Hospital'
    },
    informant: {
      relation: 'Spouse',
      name: {
        firstname: '',
        surname: ''
      },
      dob: { dd: '', mm: '', yyyy: '' },
      nationality: '',
      idType: '',
      passport: '',
      nid: '',
      email: faker.internet.email(),
      addressSameAs: true
    },
    spouse: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      dob: getRandomDate(50, 200),
      nationality: 'Farajaland',
      idType: 'National ID',
      nid: faker.string.numeric(10),
      brn: '',
      passport: '',
      addressSameAs: true
    }
  }
  const annotation = {
    review: {
      comment: 'He was a good man'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('8.1 Hospital Official actions', async () => {
    test.describe('8.1.0 Fill up death registration form', async () => {
      test('8.1.0.1 Fill deceased details', async () => {
        await page
          .locator('#firstname')
          .fill(declaration.deceased.name.firstname)
        await page.locator('#surname').fill(declaration.deceased.name.surname)
        await page.locator('#deceased____gender').click()
        await page
          .getByText(declaration.deceased.gender, { exact: true })
          .click()

        await page.getByPlaceholder('dd').fill(declaration.deceased.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.deceased.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.deceased.dob.yyyy)

        await page.locator('#deceased____idType').click()
        await page
          .getByText(declaration.deceased.idType, { exact: true })
          .click()

        await page.locator('#deceased____nid').fill(declaration.deceased.nid)

        await continueForm(page)
      })

      test('8.1.0.2 Fill event details', async () => {
        await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
        await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.eventDetails.date.yyyy)

        // Place of death must be users own location for HO
        await page.getByTestId('select__eventDetails____placeOfDeath').click()
        await page
          .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
          .click()

        await page.locator('#eventDetails____deathLocation').fill('Klo')
        await page.getByText(declaration.eventDetails.deathLocation).click()

        await continueForm(page)
      })

      test('8.1.0.3 Fill informant details', async () => {
        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informant.relation, {
            exact: true
          })
          .click()

        await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased

        await page
          .locator('#informant____email')
          .fill(declaration.informant.email)

        await continueForm(page)
      })

      test('8.1.0.4 Fill spouse details', async () => {
        await page.locator('#firstname').fill(declaration.spouse.name.firstname)
        await page.locator('#surname').fill(declaration.spouse.name.surname)

        await page.getByPlaceholder('dd').fill(declaration.spouse.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.spouse.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.spouse.dob.yyyy)

        await page.locator('#spouse____idType').click()
        await page.getByText(declaration.spouse.idType, { exact: true }).click()

        await page.locator('#spouse____nid').fill(declaration.spouse.nid)

        await continueForm(page)
      })
    })

    test.describe('8.1.1 Navigate to declaration preview page', async () => {
      test('8.1.1.1 Verify information added on previous pages', async () => {
        await goToSection(page, 'review')

        /*
         * Expected result: should include
         * - Deceased's First Name
         * - Deceased's Family Name
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'deceased.name',
          declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        )

        /*
         * Expected result: should include
         * - Deceased's Gender
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'deceased.gender',
          declaration.deceased.gender
        )

        /*
         * Expected result: should include
         * - Deceased's date of death
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'deceased.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.deceased.dob)
        )

        /*
         * Expected result: should include
         * - Deceased's Nationality
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'deceased.nationality',
          declaration.deceased.nationality
        )
        /*
         * Expected result: should include
         * - Deceased's Type of Id
         * - Deceased's Id Number
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'deceased.idType',
          declaration.deceased.idType
        )
        await expectRowValueWithChangeButton(
          page,
          'deceased.nid',
          declaration.deceased.nid
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
         * Expected result: should include
         * - Date of death
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'eventDetails.date',
          formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
        )

        /*
         * Expected result: should include
         * - Place of death
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'eventDetails.placeOfDeath',
          declaration.eventDetails.placeOfDeath
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
         * Expected result: should include
         * - Informant's Email
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'informant.email',
          declaration.informant.email
        )

        /*
         * Expected result: should include
         * - Spouse's First Name
         * - Spouse's Family Name
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'spouse.name',
          declaration.spouse.name.firstname +
            ' ' +
            declaration.spouse.name.surname
        )

        /*
         * Expected result: should include
         * - Spouse's date of birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'spouse.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.spouse.dob)
        )

        /*
         * Expected result: should include
         * - Spouse's Nationality
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'spouse.nationality',
          declaration.spouse.nationality
        )
        /*
         * Expected result: should include
         * - Spouse's Type of Id
         * - Spouse's Id Number
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'spouse.idType',
          declaration.spouse.idType
        )
        await expectRowValueWithChangeButton(
          page,
          'spouse.nid',
          declaration.spouse.nid
        )

        /*
         * Expected result: should include
         * - Spouse's address
         * - Change button
         */
        await expectRowValueWithChangeButton(
          page,
          'spouse.addressSameAs',
          'Yes'
        )
      })
    })

    test.describe('8.1.2 Click any "Change" link', async () => {
      test("8.1.2.1 Change deceased's name", async () => {
        await page.getByTestId('change-button-deceased.name').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.name.firstname = faker.person.firstName('male')
        declaration.deceased.name.surname = faker.person.lastName('male')
        await page
          .locator('#firstname')
          .fill(declaration.deceased.name.firstname)
        await page.locator('#surname').fill(declaration.deceased.name.surname)

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change deceased's name
         */
        await expect(page.getByTestId('deceased.name-value')).toContainText(
          declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        )
      })

      test("8.1.2.2 Change deceased's gender", async () => {
        await page.getByTestId('change-button-deceased.gender').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.gender = 'Female'

        await page.locator('#deceased____gender').click()
        await page
          .getByText(declaration.deceased.gender, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's gender
         */
        await expect(page.getByTestId('deceased.gender-value')).toContainText(
          declaration.deceased.gender
        )
      })

      test("8.1.2.3 Change deceased's birthday", async () => {
        await page.getByTestId('change-button-deceased.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.dob = getRandomDate(5, 200)
        await page.getByPlaceholder('dd').fill(declaration.deceased.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.deceased.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.deceased.dob.yyyy)

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's birthday
         */
        await expect(page.getByTestId('deceased.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.deceased.dob)
        )
      })

      test("8.1.2.4 Change deceased's ID type", async () => {
        await page.getByTestId('change-button-deceased.idType').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.idType = 'Passport'

        await page.locator('#deceased____idType').click()
        await page
          .getByText(declaration.deceased.idType, { exact: true })
          .click()

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's place of birth
         */
        await expect(page.getByTestId('deceased.idType-value')).toContainText(
          declaration.deceased.idType
        )
      })
      test("8.1.2.5 Change deceased's ID", async () => {
        await page.getByTestId('change-button-deceased.passport').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.passport = faker.string.numeric(10)

        await page
          .locator('#deceased____passport')
          .fill(declaration.deceased.passport)

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change deceased's ID
         */
        await expect(page.getByTestId('deceased.passport-value')).toContainText(
          declaration.deceased.passport
        )
      })

      test('8.1.2.7 Change informant type', async () => {
        await page.getByTestId('change-button-informant.relation').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.informant.relation = 'Father'

        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informant.relation, {
            exact: true
          })
          .click()

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change informant type
         */
        await expect(
          page.getByTestId('informant.relation-value')
        ).toContainText(declaration.informant.relation)
      })

      test('8.1.2.8 Change registration email', async () => {
        await page.getByTestId('change-button-informant.email').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.informant.email = faker.internet.email()
        await page
          .locator('#informant____email')
          .fill(declaration.informant.email)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change registration email
         */
        await expect(page.getByTestId('informant.email-value')).toContainText(
          declaration.informant.email
        )
      })

      test("8.1.2.9 Change spouse's name", async () => {
        await page.getByTestId('change-button-spouse.name').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.name.firstname = faker.person.firstName('female')
        declaration.spouse.name.surname = faker.person.lastName('female')
        await page.locator('#firstname').fill(declaration.spouse.name.firstname)
        await page.locator('#surname').fill(declaration.spouse.name.surname)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's name
         */
        await expect(page.getByTestId('spouse.name-value')).toContainText(
          declaration.spouse.name.firstname +
            ' ' +
            declaration.spouse.name.surname
        )
      })
      test("8.1.2.10 Change spouse's birthday", async () => {
        await page.getByTestId('change-button-spouse.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.dob = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.spouse.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.spouse.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.spouse.dob.yyyy)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's birthday
         */

        await expect(page.getByTestId('spouse.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.spouse.dob)
        )
      })
      test("8.1.2.11 Change spouse's nationality", async () => {
        await page.getByTestId('change-button-spouse.nationality').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.nationality = 'Holy See'
        await page.locator('#spouse____nationality').click()
        await page
          .getByText(declaration.spouse.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's nationality
         */
        await expect(
          page.getByTestId('spouse.nationality-value')
        ).toContainText(declaration.spouse.nationality)
      })
      test("8.1.2.12 Change spouse's ID type", async () => {
        await page.getByTestId('change-button-spouse.idType').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.idType = 'Passport'
        await page.locator('#spouse____idType').click()
        await page
          .getByText(declaration.spouse.idType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's ID type
         */
        await expect(page.getByTestId('spouse.idType-value')).toContainText(
          declaration.spouse.idType
        )
      })
      test("8.1.2.13 Change spouse's ID", async () => {
        await page.getByTestId('change-button-spouse.passport').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.passport = faker.string.numeric(10)
        await page
          .locator('#spouse____passport')
          .fill(declaration.spouse.passport)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's ID
         */
        await expect(page.getByTestId('spouse.passport-value')).toContainText(
          declaration.spouse.passport
        )
      })
    })

    test.describe('8.1.3 Validate supporting document', async () => {
      test('8.1.3.0 Go to upload supporting document page', async () => {
        await page
          .locator('#Accordion_documents-accordion')
          .getByRole('button', { name: 'Change all', exact: true })
          .click()

        await page.getByRole('button', { name: 'Continue' }).click()
      })

      test('8.1.3.1 Upload proof for deceased', async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth Certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfDeceased'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfDeceased"]'
            )
          })
        }
      })

      test('8.1.3.2 Upload proof for informant', async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth Certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfInformant'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfInformant"]'
            )
          })
        }
      })

      test('8.1.3.3 Upload proof of death', async () => {
        const imageUploadSectionTitles = [
          'Attested letter of death',
          'Police certificate of death',
          'Hospital certificate of death',
          "Coroner's report",
          'Certified copy of burial receipt',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfDeath'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfDeath"]'
            )
          })
        }
      })

      test('8.1.3.4 Go back to preview', async () => {
        await page.getByRole('button', { name: 'Go to review' }).click()
      })
    })
    test('8.1.4 Validate additional comments box', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
    })
    test.describe('8.1.5 Validate the declaration send button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.1.6 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('8.1.7 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')
    })

    test('8.1.8 Validate that declaration is available on "Recent"', async () => {
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to assigned to you workqueue
       */
      await expectInUrl(page, 'assigned-to-you')

      await page.getByText('Recent').click()
      /*
       * Expected result: The declaration should be in recent
       */
      await expect(
        page.getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
      ).toBeVisible()
    })
  })

  test.describe('8.1b Attestation by Health Administrator', async () => {
    test('Health Administrator attests the notification', async () => {
      await login(page, CREDENTIALS.HEALTH_ADMINISTRATOR)

      await page.getByText('Pending attestation').click()
      await openRecordByTitle(
        page,
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

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

  test.describe('8.2 Registration Officer actions', async () => {
    test('8.2.1 Navigate to the declaration preview page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Notifications').click()

      await openRecordByTitle(
        page,
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )
    })

    test('8.2.1.1 Verify information added on previous pages', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await selectAction(page, 'Edit')
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.gender',
        declaration.deceased.gender
      )

      /*
       * Expected result: should include
       * - Deceased's date of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.nationality',
        declaration.deceased.nationality
      )
      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.idType',
        declaration.deceased.idType
      )
      await expectRowValueWithChangeButton(
        page,
        'deceased.passport',
        declaration.deceased.passport
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
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.email',
        declaration.informant.email
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.name',
        declaration.spouse.name.firstname +
          ' ' +
          declaration.spouse.name.surname
      )

      /*
       * Expected result: should include
       * - Spouse's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.spouse.dob)
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.nationality',
        declaration.spouse.nationality
      )

      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.idType',
        declaration.spouse.idType
      )
      await expectRowValueWithChangeButton(
        page,
        'spouse.passport',
        declaration.spouse.passport
      )

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(page, 'spouse.addressSameAs', 'Yes')

      /*
       * Expected result: should show additional comment
       */
      await expect(page.locator('#review____comment')).toContainText(
        annotation.review.comment
      )
    })

    test.describe('8.2.2 Click any "Change" link', async () => {
      test("8.2.2.1 Change deceased's name", async () => {
        await page.getByTestId('change-button-deceased.name').click()

        declaration.deceased.name.firstname = faker.person.firstName('male')
        declaration.deceased.name.surname = faker.person.lastName('male')
        await page
          .locator('#firstname')
          .fill(declaration.deceased.name.firstname)
        await page.locator('#surname').fill(declaration.deceased.name.surname)

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change deceased's name
         */
        await expect(page.getByTestId('deceased.name-value')).toContainText(
          declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        )
      })

      test("8.2.2.2 Change deceased's gender", async () => {
        await page.getByTestId('change-button-deceased.gender').click()

        declaration.deceased.gender = 'Male'

        await page.locator('#deceased____gender').click()
        await page
          .getByText(declaration.deceased.gender, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's gender
         */
        await expect(page.getByTestId('deceased.gender-value')).toContainText(
          declaration.deceased.gender
        )
      })

      test("8.2.2.3 Change deceased's birthday", async () => {
        await page.getByTestId('change-button-deceased.dob').click()

        declaration.deceased.dob = getRandomDate(5, 200)
        await page.getByPlaceholder('dd').fill(declaration.deceased.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.deceased.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.deceased.dob.yyyy)

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's birthday
         */
        await expect(page.getByTestId('deceased.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.deceased.dob)
        )
      })

      test("8.2.2.4 Change deceased's ID type", async () => {
        await page.getByTestId('change-button-deceased.idType').click()

        declaration.deceased.idType = 'Birth Registration Number'

        await page.locator('#deceased____idType').click()
        await page
          .getByText(declaration.deceased.idType, { exact: true })
          .click()

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's place of birth
         */
        await expect(page.getByTestId('deceased.idType-value')).toContainText(
          declaration.deceased.idType
        )
      })
      test("8.2.2.5 Change deceased's ID", async () => {
        await page.getByTestId('change-button-deceased.brn').click()

        declaration.deceased.brn = faker.string.numeric(10)

        await page.locator('#deceased____brn').fill(declaration.deceased.brn)

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change deceased's ID
         */
        await expect(page.getByTestId('deceased.brn-value')).toContainText(
          declaration.deceased.brn
        )
      })

      test("8.2.2.6 Change deceased's address", async () => {
        await page.getByTestId('change-button-deceased.address').click()

        declaration.deceased.address.province = 'Central'
        declaration.deceased.address.district = 'Ibombo'
        declaration.deceased.address.village = 'Olani'

        await page.locator('#province').click()
        await page
          .locator('#locationOption0')
          .getByText(declaration.deceased.address.province, { exact: true })
          .click()

        await page.locator('#district').click()
        await page
          .getByText(declaration.deceased.address.district, { exact: true })
          .click()
        await page.locator('#village').click()
        await page
          .getByText(declaration.deceased.address.village, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        await expect(page.getByTestId('deceased.address-value')).toContainText(
          declaration.deceased.address.district
        )
        await expect(page.getByTestId('deceased.address-value')).toContainText(
          declaration.deceased.address.province
        )
      })

      test('8.2.2.7 Change informant type', async () => {
        await page.getByTestId('change-button-informant.relation').click()

        declaration.informant.relation = 'Spouse'

        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informant.relation, {
            exact: true
          })
          .click()

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change informant type
         */
        await expect(
          page.getByTestId('informant.relation-value')
        ).toContainText(declaration.informant.relation)
      })

      test('8.2.2.8 Change registration email', async () => {
        await page.getByTestId('change-button-informant.email').click()
        declaration.informant.email = faker.internet.email()
        await page
          .locator('#informant____email')
          .fill(declaration.informant.email)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change registration email
         */
        await expect(page.getByTestId('informant.email-value')).toContainText(
          declaration.informant.email
        )
      })

      test("8.2.2.9 Change spouse's name", async () => {
        await page.getByTestId('change-button-spouse.name').click()
        declaration.spouse.name.firstname = faker.person.firstName('female')
        declaration.spouse.name.surname = faker.person.lastName('female')
        await page.locator('#firstname').fill(declaration.spouse.name.firstname)
        await page.locator('#surname').fill(declaration.spouse.name.surname)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's name
         */
        await expect(page.getByTestId('spouse.name-value')).toContainText(
          declaration.spouse.name.firstname +
            ' ' +
            declaration.spouse.name.surname
        )
      })
      test("8.2.2.10 Change spouse's birthday", async () => {
        await page.getByTestId('change-button-spouse.dob').click()
        declaration.spouse.dob = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.spouse.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.spouse.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.spouse.dob.yyyy)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's birthday
         */

        await expect(page.getByTestId('spouse.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.spouse.dob)
        )
      })
      test("8.2.2.11 Change spouse's nationality", async () => {
        await page.getByTestId('change-button-spouse.nationality').click()
        declaration.spouse.nationality = 'Japan'
        await page.locator('#spouse____nationality').click()
        await page
          .getByText(declaration.spouse.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's nationality
         */
        await expect(
          page.getByTestId('spouse.nationality-value')
        ).toContainText(declaration.spouse.nationality)
      })
      test("8.2.2.12 Change spouse's ID type", async () => {
        await page.getByTestId('change-button-spouse.idType').click()
        declaration.spouse.idType = 'Birth Registration Number'
        await page.locator('#spouse____idType').click()
        await page
          .getByText(declaration.spouse.idType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's ID type
         */
        await expect(page.getByTestId('spouse.idType-value')).toContainText(
          declaration.spouse.idType
        )
      })
      test("8.2.2.13 Change spouse's ID", async () => {
        await page.getByTestId('change-button-spouse.brn').click()
        declaration.spouse.brn = faker.string.numeric(10)
        await page.locator('#spouse____brn').fill(declaration.spouse.brn)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's ID
         */
        await expect(page.getByTestId('spouse.brn-value')).toContainText(
          declaration.spouse.brn
        )
      })
    })
    test.describe('8.2.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.5 Validate the declaration send button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.2.6 Declare and validate', async () => {
      await triggerDeclarationAction(page, 'Declare with edits')
    })

    test('8.2.7 Confirm the declaration to send for approval', async () => {
      await page.getByText('Recent').click()
      /*
       * @TODO: When workflows are implemented on V2, this should navigate to correct workflow first.
       */
      await expect(
        page.getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
      ).toBeVisible()
    })
  })

  test.describe('8.3 Registrar actions', async () => {
    test('8.3.1 Navigate to the declaration "Record" tab', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await page.getByText('Pending registration').click()

      await openRecordByTitle(
        page,
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await switchEventTab(page, 'Record')
    })
    test('8.3.1.1 Verify information added on previous pages', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValue(
        page,
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValue(page, 'deceased.gender', declaration.deceased.gender)

      /*
       * Expected result: should include
       * - Deceased's date of death
       * - Change button
       */
      await expectRowValue(
        page,
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValue(
        page,
        'deceased.nationality',
        declaration.deceased.nationality
      )
      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectRowValue(page, 'deceased.idType', declaration.deceased.idType)
      await expectRowValue(page, 'deceased.brn', declaration.deceased.brn)

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValue(
        page,
        'deceased.address',
        declaration.deceased.address.country
      )
      await expectRowValue(
        page,
        'deceased.address',
        declaration.deceased.address.district
      )
      await expectRowValue(
        page,
        'deceased.address',
        declaration.deceased.address.province
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValue(page, 'informant.email', declaration.informant.email)

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectRowValue(
        page,
        'spouse.name',
        declaration.spouse.name.firstname +
          ' ' +
          declaration.spouse.name.surname
      )

      /*
       * Expected result: should include
       * - Spouse's date of birth
       * - Change button
       */
      await expectRowValue(
        page,
        'spouse.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.spouse.dob)
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValue(
        page,
        'spouse.nationality',
        declaration.spouse.nationality
      )

      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectRowValue(page, 'spouse.idType', declaration.spouse.idType)
      await expectRowValue(page, 'spouse.brn', declaration.spouse.brn)

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValue(page, 'spouse.addressSameAs', 'Yes')
    })

    test.describe('8.3.2 Click any "Change" link', async () => {
      test('8.3.2.0 Navigate to Edit-action', async () => {
        await selectAction(page, 'Edit')
      })

      test("8.3.2.1 Change deceased's name", async () => {
        await page.getByTestId('change-button-deceased.name').click()

        declaration.deceased.name.firstname = faker.person.firstName('male')
        declaration.deceased.name.surname = faker.person.lastName('male')
        await page
          .locator('#firstname')
          .fill(declaration.deceased.name.firstname)
        await page.locator('#surname').fill(declaration.deceased.name.surname)

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change deceased's name
         */
        await expect(page.getByTestId('deceased.name-value')).toContainText(
          declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        )
      })

      test("8.3.2.2 Change deceased's gender", async () => {
        await page.getByTestId('change-button-deceased.gender').click()

        declaration.deceased.gender = 'Female'

        await page.locator('#deceased____gender').click()
        await page
          .getByText(declaration.deceased.gender, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's gender
         */
        await expect(page.getByTestId('deceased.gender-value')).toContainText(
          declaration.deceased.gender
        )
      })

      test("8.3.2.3 Change deceased's birthday", async () => {
        await page.getByTestId('change-button-deceased.dob').click()

        declaration.deceased.dob = getRandomDate(1, 200)
        await page.getByPlaceholder('dd').fill(declaration.deceased.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.deceased.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.deceased.dob.yyyy)

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's birthday
         */
        await expect(page.getByTestId('deceased.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.deceased.dob)
        )
      })

      test("8.3.2.4 Change deceased's ID type", async () => {
        await page.getByTestId('change-button-deceased.idType').click()

        declaration.deceased.idType = 'Passport'

        await page.locator('#deceased____idType').click()
        await page
          .getByText(declaration.deceased.idType, { exact: true })
          .click()

        await page.getByRole('button', { name: 'Go to review' }).click()

        /*
         * Expected result: should change deceased's place of birth
         */
        await expect(page.getByTestId('deceased.idType-value')).toContainText(
          declaration.deceased.idType
        )
      })
      test("8.3.2.5 Change deceased's ID", async () => {
        await page.getByTestId('change-button-deceased.passport').click()

        declaration.deceased.nid = faker.string.numeric(10)

        await page
          .locator('#deceased____passport')
          .fill(declaration.deceased.passport)

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change deceased's ID
         */
        await expect(page.getByTestId('deceased.passport-value')).toContainText(
          declaration.deceased.passport
        )
      })

      test("8.3.2.6 Change deceased's address", async () => {
        await page.getByTestId('change-button-deceased.address').click()

        declaration.deceased.address.village = 'Pemba'

        await page.locator('#village').click()
        await page
          .getByText(declaration.deceased.address.village, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change deceased's address
         */
        await expect(page.getByTestId('deceased.address-value')).toContainText(
          declaration.deceased.address.district
        )
        await expect(page.getByTestId('deceased.address-value')).toContainText(
          declaration.deceased.address.province
        )
      })

      test('8.3.2.7 Change informant type', async () => {
        await page.getByTestId('change-button-informant.relation').click()

        declaration.informant = {
          relation: 'Father',
          name: {
            firstname: faker.person.firstName('male'),
            surname: faker.person.lastName('male')
          },
          dob: getRandomDate(20, 50),
          nationality: 'Farajaland',
          idType: 'National ID',
          nid: faker.string.numeric(10),
          passport: '',
          addressSameAs: true,
          email: faker.internet.email()
        }

        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informant.relation, {
            exact: true
          })
          .click()

        await page
          .locator('#firstname')
          .fill(declaration.informant.name.firstname)
        await page.locator('#surname').fill(declaration.informant.name.surname)

        await page.getByPlaceholder('dd').fill(declaration.informant.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.informant.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.informant.dob.yyyy)

        await page.locator('#informant____idType').click()
        await page
          .getByText(declaration.informant.idType, { exact: true })
          .click()

        await page.locator('#informant____nid').fill(declaration.informant.nid)

        await page
          .locator('#informant____email')
          .fill(declaration.informant.email)

        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change informant type
         */
        await expect(
          page.getByTestId('informant.relation-value')
        ).toContainText(declaration.informant.relation)
      })

      test('8.3.2.8 Change registration email', async () => {
        await page.getByTestId('change-button-informant.email').click()
        declaration.informant.email = faker.internet.email()
        await page
          .locator('#informant____email')
          .fill(declaration.informant.email)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change registration email
         */
        await expect(page.getByTestId('informant.email-value')).toContainText(
          declaration.informant.email
        )
      })

      test("8.3.2.9 Change spouse's name", async () => {
        await page.getByTestId('change-button-spouse.name').click()
        declaration.spouse.name.firstname = faker.person.firstName('female')
        declaration.spouse.name.surname = faker.person.lastName('female')
        await page.locator('#firstname').fill(declaration.spouse.name.firstname)
        await page.locator('#surname').fill(declaration.spouse.name.surname)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's name
         */
        await expect(page.getByTestId('spouse.name-value')).toContainText(
          declaration.spouse.name.firstname +
            ' ' +
            declaration.spouse.name.surname
        )
      })
      test("8.3.2.10 Change spouse's birthday", async () => {
        await page.getByTestId('change-button-spouse.dob').click()
        declaration.spouse.dob = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.spouse.dob.dd)
        await page.getByPlaceholder('mm').fill(declaration.spouse.dob.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.spouse.dob.yyyy)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's birthday
         */

        await expect(page.getByTestId('spouse.dob-value')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.spouse.dob)
        )
      })
      test("8.3.2.11 Change spouse's nationality", async () => {
        await page.getByTestId('change-button-spouse.nationality').click()
        declaration.spouse.nationality = 'Holy See'
        await page.locator('#spouse____nationality').click()
        await page
          .getByText(declaration.spouse.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's nationality
         */
        await expect(
          page.getByTestId('spouse.nationality-value')
        ).toContainText(declaration.spouse.nationality)
      })
      test("8.3.2.12 Change spouse's ID type", async () => {
        await page.getByTestId('change-button-spouse.idType').click()
        declaration.spouse.idType = 'Passport'
        await page.locator('#spouse____idType').click()
        await page
          .getByText(declaration.spouse.idType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's ID type
         */
        await expect(page.getByTestId('spouse.idType-value')).toContainText(
          declaration.spouse.idType
        )
      })
      test("8.3.2.13 Change spouse's ID", async () => {
        await page.getByTestId('change-button-spouse.passport').click()
        declaration.spouse.passport = faker.string.numeric(10)
        await page
          .locator('#spouse____passport')
          .fill(declaration.spouse.passport)
        await page.getByRole('button', { name: 'Go to review' }).click()
        /*
         * Expected result: should change spouse's ID
         */
        await expect(page.getByTestId('spouse.passport-value')).toContainText(
          declaration.spouse.passport
        )
      })
    })
    test.describe('8.3.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.3.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.3.5 Validate the register button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.3.6 Register with edits', async () => {
      await triggerDeclarationAction(page, 'Register with edits')
    })

    test('8.3.7 Confirm the declaration to "Pending certification"-workqueue', async () => {
      await page.getByText('Pending certification').click()

      await expect(
        page.getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
      ).toBeVisible()
    })
  })
})
