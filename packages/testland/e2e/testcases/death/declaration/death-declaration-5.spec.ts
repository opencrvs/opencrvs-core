import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  expectRowValueWithChangeButton,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  goToSection,
  login,
  switchEventTab,
  expectRowValue,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureAssignedToUser, expectInUrl } from '../../../utils'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('5. Death declaration case - 5', () => {
  let page: Page

  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('female') + '-Peter',
        surname: faker.person.lastName('female')
      },
      gender: 'Female',
      age: 45,
      nationality: 'Farajaland',
      idType: 'None',
      maritalStatus: 'Separated',
      address: {
        country: 'Guam',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    eventDetails: {
      date: getRandomDate(0, 20),
      mannerOfDeath: 'Manner undetermined',
      causeOfDeathEstablished: false,
      placeOfDeath: 'Other',
      deathLocationOther: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo',
        village: 'Olani',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    informant: {
      relation: 'Daughter in law',
      email: faker.internet.email(),
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      age: 17,
      nationality: 'Malawi',
      idType: 'None',
      addressSameAs: false,
      address: {
        country: 'Comoros',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    spouse: {
      detailsNotAvailable: true,
      reason: 'Spouse ran away'
    }
  }
  const annotation = {
    review: {
      comment: "He was a great person, we'll miss him"
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('5.1 Declaration started by RO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('5.1.1 Fill deceased details', async () => {
      await page.locator('#firstname').fill(declaration.deceased.name.firstname)
      await page.locator('#surname').fill(declaration.deceased.name.surname)
      await page.locator('#deceased____gender').click()
      await page.getByText(declaration.deceased.gender, { exact: true }).click()

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#deceased____age')
        .fill(declaration.deceased.age.toString())

      await page.locator('#deceased____idType').click()
      await page.getByText(declaration.deceased.idType, { exact: true }).click()

      await page.locator('#deceased____maritalStatus').click()
      await page
        .getByText(declaration.deceased.maritalStatus, { exact: true })
        .click()

      await page.locator('#country').click()
      await page
        .getByText(declaration.deceased.address.country, { exact: true })
        .click()

      await page.locator('#state').fill(declaration.deceased.address.state)
      await page
        .locator('#district2')
        .fill(declaration.deceased.address.district)
      await page.locator('#cityOrTown').fill(declaration.deceased.address.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.deceased.address.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.deceased.address.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.deceased.address.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.deceased.address.postcodeOrZip)
      await continueForm(page)
    })

    test('5.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.eventDetails.date.yyyy)

      await page.locator('#eventDetails____mannerOfDeath').click()
      await page
        .getByText(declaration.eventDetails.mannerOfDeath, { exact: true })
        .click()

      await page.locator('#eventDetails____placeOfDeath').click()
      await page
        .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
        .click()

      await page.locator('#village').click()
      await page
        .getByText(declaration.eventDetails.deathLocationOther.village, {
          exact: true
        })
        .click()
      await page
        .locator('#town')
        .fill(declaration.eventDetails.deathLocationOther.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.eventDetails.deathLocationOther.residentialArea)
      await page
        .locator('#street')
        .fill(declaration.eventDetails.deathLocationOther.street)
      await page
        .locator('#number')
        .fill(declaration.eventDetails.deathLocationOther.number)
      await page
        .locator('#zipCode')
        .fill(declaration.eventDetails.deathLocationOther.postcodeOrZip)

      await continueForm(page)
    })

    test('5.1.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informant.relation, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased

      await page
        .locator('#firstname')
        .fill(declaration.informant.name.firstname)
      await page.locator('#surname').fill(declaration.informant.name.surname)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#informant____age')
        .fill(declaration.informant.age.toString())

      await page.locator('#informant____nationality').click()
      await page
        .getByText(declaration.informant.nationality, { exact: true })
        .click()

      await page.locator('#informant____idType').click()
      await page
        .getByText(declaration.informant.idType, { exact: true })
        .click()

      await page.locator('#informant____addressSameAs_NO').check()

      await page.locator('#country').click()
      await page
        .getByText(declaration.informant.address.country, { exact: true })
        .click()

      await page.locator('#state').fill(declaration.informant.address.state)
      await page
        .locator('#district2')
        .fill(declaration.informant.address.district)
      await page.locator('#cityOrTown').fill(declaration.informant.address.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.informant.address.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.informant.address.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.informant.address.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.informant.address.postcodeOrZip)

      await page
        .locator('#informant____email')
        .fill(declaration.informant.email)

      await continueForm(page)
    })

    test('5.1.4 Fill spouse details', async () => {
      await page.getByLabel("Spouse's details are not available").check()

      await page.locator('#spouse____reason').fill(declaration.spouse.reason)

      await continueForm(page)
    })

    test('5.1.5 Go to preview', async () => {
      await goToSection(page, 'review')
    })

    test('5.1.6 Verify information on preview page', async () => {
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
       * - Deceased's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.age',
        declaration.deceased.age.toString()
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

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.maritalStatus',
        declaration.deceased.maritalStatus
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
          declaration.deceased.address.state +
          declaration.deceased.address.district +
          declaration.deceased.address.town +
          declaration.deceased.address.addressLine1 +
          declaration.deceased.address.addressLine2 +
          declaration.deceased.address.addressLine3 +
          declaration.deceased.address.postcodeOrZip
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
       * - Manner of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.mannerOfDeath',
        declaration.eventDetails.mannerOfDeath
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
       * - Death location address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.deathLocationOther',
        declaration.eventDetails.deathLocationOther.country +
          declaration.eventDetails.deathLocationOther.province +
          declaration.eventDetails.deathLocationOther.district +
          declaration.eventDetails.deathLocationOther.village +
          declaration.eventDetails.deathLocationOther.town +
          declaration.eventDetails.deathLocationOther.residentialArea +
          declaration.eventDetails.deathLocationOther.street +
          declaration.eventDetails.deathLocationOther.number +
          declaration.eventDetails.deathLocationOther.postcodeOrZip
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
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.name',
        declaration.informant.name.firstname +
          ' ' +
          declaration.informant.name.surname
      )

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.age',
        declaration.informant.age.toString()
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.nationality',
        declaration.informant.nationality
      )

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.idType',
        declaration.informant.idType
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.address',
        declaration.informant.address.country +
          declaration.informant.address.state +
          declaration.informant.address.district +
          declaration.informant.address.town +
          declaration.informant.address.addressLine1 +
          declaration.informant.address.addressLine2 +
          declaration.informant.address.addressLine3 +
          declaration.informant.address.postcodeOrZip
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
       * - Spouse's details not available
       * - Reason
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.detailsNotAvailable',
        'Yes'
      )

      await expectRowValueWithChangeButton(
        page,
        'spouse.reason',
        declaration.spouse.reason
      )
    })

    test('5.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('5.1.8 Declare and validate', async () => {
      await triggerDeclarationAction(page, 'Declare')

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
  test.describe('5.2 Declaration Review by Registrar', async () => {
    test('5.2.1 Navigate to the declaration "Record" -tab', async () => {
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

    test('5.2.2 Verify information on "Record" tab', async () => {
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
       * - Deceased's age
       * - Change button
       */
      await expectRowValue(
        page,
        'deceased.age',
        declaration.deceased.age.toString()
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

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectRowValue(
        page,
        'deceased.maritalStatus',
        declaration.deceased.maritalStatus
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValue(
        page,
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.state +
          declaration.deceased.address.district +
          declaration.deceased.address.town +
          declaration.deceased.address.addressLine1 +
          declaration.deceased.address.addressLine2 +
          declaration.deceased.address.addressLine3 +
          declaration.deceased.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expectRowValue(
        page,
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expectRowValue(
        page,
        'eventDetails.mannerOfDeath',
        declaration.eventDetails.mannerOfDeath
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectRowValue(
        page,
        'eventDetails.placeOfDeath',
        declaration.eventDetails.placeOfDeath
      )

      /*
       * Expected result: should include
       * - Death location address
       * - Change button
       */
      await expectRowValue(
        page,
        'eventDetails.deathLocationOther',
        declaration.eventDetails.deathLocationOther.country +
          declaration.eventDetails.deathLocationOther.province +
          declaration.eventDetails.deathLocationOther.district +
          declaration.eventDetails.deathLocationOther.village +
          declaration.eventDetails.deathLocationOther.town +
          declaration.eventDetails.deathLocationOther.residentialArea +
          declaration.eventDetails.deathLocationOther.street +
          declaration.eventDetails.deathLocationOther.number +
          declaration.eventDetails.deathLocationOther.postcodeOrZip
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
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.name',
        declaration.informant.name.firstname +
          ' ' +
          declaration.informant.name.surname
      )

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.age',
        declaration.informant.age.toString()
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.nationality',
        declaration.informant.nationality
      )

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.idType',
        declaration.informant.idType
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.address',
        declaration.informant.address.country +
          declaration.informant.address.state +
          declaration.informant.address.district +
          declaration.informant.address.town +
          declaration.informant.address.addressLine1 +
          declaration.informant.address.addressLine2 +
          declaration.informant.address.addressLine3 +
          declaration.informant.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValue(page, 'informant.email', declaration.informant.email)
      /*
       * Expected result: should include
       * - Spouse's details not available
       * - Reason
       * - Change button
       */
      await expectRowValue(page, 'spouse.detailsNotAvailable', 'Yes')

      await expectRowValue(page, 'spouse.reason', declaration.spouse.reason)
    })
  })
})
