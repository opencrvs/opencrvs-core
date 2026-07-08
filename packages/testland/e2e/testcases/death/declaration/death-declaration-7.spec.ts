import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  expectRowValueWithChangeButton,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  goToSection,
  login,
  triggerDeclarationAction,
  switchEventTab
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureAssignedToUser, expectInUrl } from '../../../utils'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('7. Death declaration case - 7', () => {
  let page: Page
  async function expectRowValue(fieldName: string, assertionText: string) {
    await expect(page.getByTestId(`row-value-${fieldName}`)).toContainText(
      assertionText
    )
  }

  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      gender: 'Female',
      age: 45,
      nationality: 'Farajaland',
      idType: 'None',
      maritalStatus: 'Not stated',
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
      mannerOfDeath: 'Manner undetermined',
      date: getRandomDate(0, 20),
      causeOfDeathEstablished: false,
      placeOfDeath: 'Other',
      deathLocationOther: {
        country: 'Germany',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    informant: {
      relation: 'Father',
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

  test.describe('7.1 Declaration started by National Registrar', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.1 Fill deceased details', async () => {
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

    test('7.1.2 Fill event details', async () => {
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

      await page.locator('#country').click()
      await page
        .getByText(declaration.eventDetails.deathLocationOther.country, {
          exact: true
        })
        .click()

      await page
        .locator('#state')
        .fill(declaration.eventDetails.deathLocationOther.state)
      await page
        .locator('#district2')
        .fill(declaration.eventDetails.deathLocationOther.district)
      await page
        .locator('#cityOrTown')
        .fill(declaration.eventDetails.deathLocationOther.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.eventDetails.deathLocationOther.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.eventDetails.deathLocationOther.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.eventDetails.deathLocationOther.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.eventDetails.deathLocationOther.postcodeOrZip)

      await continueForm(page)
    })

    test('7.1.3 Fill informant details', async () => {
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

    test('7.1.4 Fill spouse details', async () => {
      await page.getByLabel("Spouse's details are not available").check()

      await page.locator('#spouse____reason').fill(declaration.spouse.reason)

      await continueForm(page)
    })

    test('7.1.5 Go to preview', async () => {
      await goToSection(page, 'review')
    })

    test('7.1.6 Verify information on preview page', async () => {
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
          declaration.eventDetails.deathLocationOther.state +
          declaration.eventDetails.deathLocationOther.district +
          declaration.eventDetails.deathLocationOther.town +
          declaration.eventDetails.deathLocationOther.addressLine1 +
          declaration.eventDetails.deathLocationOther.addressLine2 +
          declaration.eventDetails.deathLocationOther.addressLine3 +
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
        declaration.spouse.detailsNotAvailable ? 'Yes' : 'No'
      )
      await expectRowValueWithChangeButton(
        page,
        'spouse.reason',
        declaration.spouse.reason
      )
    })

    test('7.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('7.1.8 Register', async () => {
      await triggerDeclarationAction(page, 'Register')

      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to assigned to you workqueue
       */
      await expectInUrl(page, 'assigned-to-you')

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
    test('7.1.8 Verify information on "Record" tab', async () => {
      await openRecordByTitle(
        page,
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await switchEventTab(page, 'Record')

      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       */
      await expectRowValue(
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       */
      await expectRowValue('deceased.gender', declaration.deceased.gender)

      /*
       * Expected result: should include
       * - Deceased's age
       */
      await expectRowValue('deceased.age', declaration.deceased.age.toString())

      /*
       * Expected result: should include
       * - Deceased's Nationality
       */
      await expectRowValue(
        'deceased.nationality',
        declaration.deceased.nationality
      )

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       */
      await expectRowValue('deceased.idType', declaration.deceased.idType)

      /*
       * Expected result: should include
       * - Deceased's marital status
       */
      await expectRowValue(
        'deceased.maritalStatus',
        declaration.deceased.maritalStatus
      )

      /*
       * Expected result: should include
       * - Deceased's address
       */
      await expectRowValue(
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
       */
      await expectRowValue(
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       */
      await expectRowValue(
        'eventDetails.mannerOfDeath',
        declaration.eventDetails.mannerOfDeath
      )

      /*
       * Expected result: should include
       * - Place of death
       */
      await expectRowValue(
        'eventDetails.placeOfDeath',
        declaration.eventDetails.placeOfDeath
      )

      /*
       * Expected result: should include
       * - Death location address
       */
      await expectRowValue(
        'eventDetails.deathLocationOther',
        declaration.eventDetails.deathLocationOther.country +
          declaration.eventDetails.deathLocationOther.state +
          declaration.eventDetails.deathLocationOther.district +
          declaration.eventDetails.deathLocationOther.town +
          declaration.eventDetails.deathLocationOther.addressLine1 +
          declaration.eventDetails.deathLocationOther.addressLine2 +
          declaration.eventDetails.deathLocationOther.addressLine3 +
          declaration.eventDetails.deathLocationOther.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Informant type
       */
      await expectRowValue('informant.relation', declaration.informant.relation)

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expectRowValue(
        'informant.name',
        declaration.informant.name.firstname +
          ' ' +
          declaration.informant.name.surname
      )

      /*
       * Expected result: should include
       * - informant's age
       */
      await expectRowValue(
        'informant.age',
        declaration.informant.age.toString()
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       */
      await expectRowValue(
        'informant.nationality',
        declaration.informant.nationality
      )

      /*
       * Expected result: should include
       * - informant's Type of Id
       */
      await expectRowValue('informant.idType', declaration.informant.idType)

      /*
       * Expected result: should include
       * - informant's address
       */
      await expectRowValue(
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
       */
      await expectRowValue('informant.email', declaration.informant.email)

      /*
       * Expected result: should include
       * - Spouse's details not available
       * - Reason
       */
      await expectRowValue(
        'spouse.detailsNotAvailable',
        declaration.spouse.detailsNotAvailable ? 'Yes' : 'No'
      )
      await expectRowValue('spouse.reason', declaration.spouse.reason)
    })
  })
})
