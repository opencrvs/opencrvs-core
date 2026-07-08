import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  expectRowValueWithChangeButton,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  login,
  switchEventTab,
  uploadImageToSection,
  expectRowValue,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureAssignedToUser, expectInUrl } from '../../../utils'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('2. Death declaration case - 2', () => {
  let page: Page
  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      gender: 'Female',
      age: 65,
      nationality: 'Guernsey',
      idType: 'Passport',
      passport: faker.string.numeric(10),
      maritalStatus: 'Married',
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Zobwe',
        village: 'Chuma',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    eventDetails: {
      mannerOfDeath: 'Accident',
      date: getRandomDate(0, 20),
      causeOfDeathEstablished: true,
      sourceCauseDeath: 'Lay reported',
      description: "T'was an accident sire",
      placeOfDeath: 'Health Institution',
      deathLocation: 'Klow Village Hospital'
    },
    informant: {
      relation: 'Son',
      email: faker.internet.email(),
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      dob: getRandomDate(50, 200),
      nationality: 'Farajaland',
      idType: 'National ID',
      nid: faker.string.numeric(10),
      addressSameAs: true
    },
    spouse: {
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      age: 68,
      nationality: 'Canada',
      idType: 'Passport',
      passport: faker.string.numeric(10),
      addressSameAs: false,
      address: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        village: 'Oro',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
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

  test.describe('2.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('2.1.1 Fill deceased details', async () => {
      await page.locator('#firstname').fill(declaration.deceased.name.firstname)
      await page.locator('#surname').fill(declaration.deceased.name.surname)
      await page.locator('#deceased____gender').click()
      await page.getByText(declaration.deceased.gender, { exact: true }).click()

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#deceased____age')
        .fill(declaration.deceased.age.toString())

      await page.locator('#deceased____nationality').click()
      await page
        .getByText(declaration.deceased.nationality, { exact: true })
        .click()

      await page.locator('#deceased____idType').click()
      await page.getByText(declaration.deceased.idType, { exact: true }).click()

      await page
        .locator('#deceased____passport')
        .fill(declaration.deceased.passport)

      await page.locator('#deceased____maritalStatus').click()
      await page
        .getByText(declaration.deceased.maritalStatus, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
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
      await page.locator('#town').fill(declaration.deceased.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.deceased.address.residentialArea)
      await page.locator('#street').fill(declaration.deceased.address.street)
      await page.locator('#number').fill(declaration.deceased.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.deceased.address.postcodeOrZip)
      await continueForm(page)
    })

    test('2.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.eventDetails.date.yyyy)

      await page.getByLabel('Cause of death has been established').check()

      await page.locator('#eventDetails____sourceCauseDeath').click()
      await page
        .getByText(declaration.eventDetails.sourceCauseDeath, { exact: true })
        .click()

      await page.locator('#eventDetails____mannerOfDeath').click()
      await page
        .getByText(declaration.eventDetails.mannerOfDeath, { exact: true })
        .click()

      await page
        .locator('#eventDetails____description')
        .fill(declaration.eventDetails.description)

      await page.locator('#eventDetails____placeOfDeath').click()
      await page
        .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
        .click()

      await page.locator('#eventDetails____deathLocation').fill('Klow Village')
      await expect(
        page.getByText(declaration.eventDetails.deathLocation)
      ).toBeVisible()
      await page.getByText(declaration.eventDetails.deathLocation).click()

      await continueForm(page)
    })

    test('2.1.3 Fill informant details', async () => {
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

      await continueForm(page)
    })

    test('2.1.4 Fill spouse details', async () => {
      await page.locator('#firstname').fill(declaration.spouse.name.firstname)
      await page.locator('#surname').fill(declaration.spouse.name.surname)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#spouse____age')
        .fill(declaration.spouse.age.toString())

      await page.locator('#spouse____nationality').click()
      await page
        .getByText(declaration.spouse.nationality, { exact: true })
        .click()

      await page.locator('#spouse____idType').click()
      await page.getByText(declaration.spouse.idType, { exact: true }).click()

      await page
        .locator('#spouse____passport')
        .fill(declaration.spouse.passport)

      await page.locator('#spouse____addressSameAs_NO').check()

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.spouse.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.spouse.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.spouse.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.spouse.address.district, { exact: true })
        .click()
      await page.locator('#village').click()
      await page
        .getByText(declaration.spouse.address.village, { exact: true })
        .click()
      await page.locator('#town').fill(declaration.spouse.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.spouse.address.residentialArea)
      await page.locator('#street').fill(declaration.spouse.address.street)
      await page.locator('#number').fill(declaration.spouse.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.spouse.address.postcodeOrZip)

      await continueForm(page)
    })

    test.describe('2.1.5 Upload supporting document', async () => {
      test('2.1.5.1 Upload proof for deceased', async () => {
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

      test('2.1.5.2 Upload proof for informant', async () => {
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

      test('2.1.5.3 Upload proof of death', async () => {
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

      test('2.1.5.4 Upload proof of cause of death', async () => {
        const imageUploadSectionTitles = [
          'Medically Certified Cause of Death',
          'Verbal autopsy report',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfCauseOfDeath'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfCauseOfDeath"]'
            )
          })
        }
        await continueForm(page)
      })
    })

    test('2.1.6 Verify information on preview page', async () => {
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
      await expectRowValueWithChangeButton(
        page,
        'deceased.passport',
        declaration.deceased.passport
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
          declaration.deceased.address.province +
          declaration.deceased.address.district +
          declaration.deceased.address.village +
          declaration.deceased.address.town +
          declaration.deceased.address.residentialArea +
          declaration.deceased.address.street +
          declaration.deceased.address.number +
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
       * - Cause of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.causeOfDeathEstablished',
        'Yes'
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.sourceCauseDeath',
        declaration.eventDetails.sourceCauseDeath
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'eventDetails.description',
        declaration.eventDetails.description
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
       * - informant's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.informant.dob)
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
       * - informant's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.idType',
        declaration.informant.idType
      )
      await expectRowValueWithChangeButton(
        page,
        'informant.nid',
        declaration.informant.nid
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'informant.addressSameAs',
        'Yes'
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
       * - Spouse's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.age',
        declaration.spouse.age.toString()
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
      await expectRowValueWithChangeButton(
        page,
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.province +
          declaration.spouse.address.district +
          declaration.spouse.address.village +
          declaration.spouse.address.town +
          declaration.spouse.address.residentialArea +
          declaration.spouse.address.street +
          declaration.spouse.address.number +
          declaration.spouse.address.postcodeOrZip
      )
    })

    test('2.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('2.1.8 Declare', async () => {
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
  test.describe('2.2 Declaration Review by RO', async () => {
    test('2.2.1 Navigate to the declaration "Record" -tab', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Pending validation').click()

      await openRecordByTitle(
        page,
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await switchEventTab(page, 'Record')
    })

    test('2.2.2 Verify information on "Record" tab', async () => {
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
      await expectRowValue(
        page,
        'deceased.passport',
        declaration.deceased.passport
      )

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
          declaration.deceased.address.province +
          declaration.deceased.address.district +
          declaration.deceased.address.village +
          declaration.deceased.address.town +
          declaration.deceased.address.residentialArea +
          declaration.deceased.address.street +
          declaration.deceased.address.number +
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
       * - Cause of death has been established
       * - Change button
       */
      await expectRowValue(page, 'eventDetails.causeOfDeathEstablished', 'Yes')

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectRowValue(
        page,
        'eventDetails.sourceCauseDeath',
        declaration.eventDetails.sourceCauseDeath
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectRowValue(
        page,
        'eventDetails.description',
        declaration.eventDetails.description
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
       * - informant's date of birth
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.informant.dob)
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
       * - informant's Id Number
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.idType',
        declaration.informant.idType
      )
      await expectRowValue(page, 'informant.nid', declaration.informant.nid)

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValue(page, 'informant.addressSameAs', 'Yes')

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
       * - Spouse's age
       * - Change button
       */
      await expectRowValue(
        page,
        'spouse.age',
        declaration.spouse.age.toString()
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
      await expectRowValue(page, 'spouse.passport', declaration.spouse.passport)

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValue(
        page,
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.province +
          declaration.spouse.address.district +
          declaration.spouse.address.village +
          declaration.spouse.address.town +
          declaration.spouse.address.residentialArea +
          declaration.spouse.address.street +
          declaration.spouse.address.number +
          declaration.spouse.address.postcodeOrZip
      )
    })
  })
})
