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

test.describe.serial('4. Death declaration case - 4', () => {
  let page: Page

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
      maritalStatus: 'Divorced',
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
      mannerOfDeath: 'Homicide',
      date: getRandomDate(0, 20),
      causeOfDeathEstablished: true,
      sourceCauseDeath: 'Medically Certified Cause of Death',
      placeOfDeath: 'Health Institution',
      deathLocation: 'Ibombo District Hospital'
    },
    causeOfDeathDetails: {
      causeOfDeathA: {
        symptomOne: 'Sepsis, unspecified',
        duration: {
          interval: '4',
          unit: 'Hours'
        }
      },
      causeOfDeathB: {
        symptomOne: 'Adenoviral pneumonia',
        duration: {
          interval: '7',
          unit: 'Days'
        }
      },
      causeOfDeathOther: {
        symptomOne: 'Chronic obstructive pulmonary disease, unspecified',
        duration: {
          interval: '5',
          unit: 'Years'
        }
      }
    },
    informant: {
      relation: 'Son in law',
      email: faker.internet.email(),
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      age: 17,
      nationality: 'Malawi',
      idType: 'Birth Registration Number',
      brn: faker.string.numeric(10),
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
    },
    spouse: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      age: 42,
      nationality: 'Farajaland',
      idType: 'None',
      addressSameAs: false,
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

  test.describe('4.1 Declaration started by RO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('4.1.1 Fill deceased details', async () => {
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

    test('4.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.eventDetails.date.yyyy)

      await page.locator('#eventDetails____mannerOfDeath').click()
      await page
        .getByText(declaration.eventDetails.mannerOfDeath, { exact: true })
        .click()

      await page.getByLabel('Cause of death has been established').check()

      await page.locator('#eventDetails____sourceCauseDeath').click()
      await page
        .getByText(declaration.eventDetails.sourceCauseDeath, { exact: true })
        .click()

      await page.locator('#eventDetails____placeOfDeath').click()
      await page
        .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
        .click()

      await page
        .locator('#eventDetails____deathLocation')
        .fill(declaration.eventDetails.deathLocation.slice(0, 4))
      await page.getByText(declaration.eventDetails.deathLocation).click()

      await continueForm(page)
    })

    test('4.1.3 Fill cause of death details', async () => {
      await page
        .locator('#causeOfDeathDetails____causeOfDeathA____symptom____one')
        .fill(declaration.causeOfDeathDetails.causeOfDeathA.symptomOne)
      await page
        .getByText(declaration.causeOfDeathDetails.causeOfDeathA.symptomOne, {
          exact: true
        })
        .click()
      await page
        .locator('#causeOfDeathDetails____causeOfDeathA____interval')
        .fill(declaration.causeOfDeathDetails.causeOfDeathA.duration.interval)
      await page
        .locator('#causeOfDeathDetails____causeOfDeathA____interval-form-input')
        .getByTestId('select__unit')
        .click()
      await page
        .getByText(
          declaration.causeOfDeathDetails.causeOfDeathA.duration.unit,
          { exact: true }
        )
        .click()

      await page
        .locator('#causeOfDeathDetails____causeOfDeathB____symptom____one')
        .fill(declaration.causeOfDeathDetails.causeOfDeathB.symptomOne)
      await page
        .getByText(declaration.causeOfDeathDetails.causeOfDeathB.symptomOne, {
          exact: true
        })
        .click()
      await page
        .locator('#causeOfDeathDetails____causeOfDeathB____interval')
        .fill(declaration.causeOfDeathDetails.causeOfDeathB.duration.interval)
      await page
        .locator('#causeOfDeathDetails____causeOfDeathB____interval-form-input')
        .getByTestId('select__unit')
        .click()
      await page
        .getByText(
          declaration.causeOfDeathDetails.causeOfDeathB.duration.unit,
          { exact: true }
        )
        .click()

      await page
        .locator('#causeOfDeathDetails____causeOfDeathOther____symptom____one')
        .fill(declaration.causeOfDeathDetails.causeOfDeathOther.symptomOne)
      await page
        .getByText(
          declaration.causeOfDeathDetails.causeOfDeathOther.symptomOne,
          {
            exact: true
          }
        )
        .click()
      await page
        .locator('#causeOfDeathDetails____causeOfDeathOther____interval')
        .fill(
          declaration.causeOfDeathDetails.causeOfDeathOther.duration.interval
        )
      await page
        .locator(
          '#causeOfDeathDetails____causeOfDeathOther____interval-form-input'
        )
        .getByTestId('select__unit')
        .click()
      await page
        .getByText(
          declaration.causeOfDeathDetails.causeOfDeathOther.duration.unit,
          { exact: true }
        )
        .click()

      await continueForm(page)
    })

    test('4.1.4 Fill informant details', async () => {
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

      await page.locator('#informant____brn').fill(declaration.informant.brn)

      await page.locator('#informant____addressSameAs_NO').check()

      await page.locator('#province').click()
      await page
        .getByText(declaration.informant.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.informant.address.district, { exact: true })
        .click()
      await page.locator('#village').click()
      await page
        .getByText(declaration.informant.address.village, { exact: true })
        .click()
      await page.locator('#town').fill(declaration.informant.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.informant.address.residentialArea)
      await page.locator('#street').fill(declaration.informant.address.street)
      await page.locator('#number').fill(declaration.informant.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.informant.address.postcodeOrZip)

      await page
        .locator('#informant____email')
        .fill(declaration.informant.email)

      await continueForm(page)
    })

    test('4.1.5 Fill spouse details', async () => {
      await page.locator('#firstname').fill(declaration.spouse.name.firstname)
      await page.locator('#surname').fill(declaration.spouse.name.surname)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#spouse____age')
        .fill(declaration.spouse.age.toString())

      await page.locator('#spouse____idType').click()
      await page.getByText(declaration.spouse.idType, { exact: true }).click()

      await page.locator('#spouse____addressSameAs_NO').check()

      await page.locator('#country').click()
      await page
        .getByText(declaration.spouse.address.country, { exact: true })
        .click()

      await page.locator('#state').fill(declaration.spouse.address.state)
      await page.locator('#district2').fill(declaration.spouse.address.district)
      await page.locator('#cityOrTown').fill(declaration.spouse.address.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.spouse.address.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.spouse.address.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.spouse.address.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.spouse.address.postcodeOrZip)

      await continueForm(page)
    })

    test.describe('4.1.6 Upload supporting document', async () => {
      test('4.1.5.1 Upload proof for deceased', async () => {
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

      test('4.1.5.2 Upload proof for informant', async () => {
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

      test('4.1.5.3 Upload proof of death', async () => {
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

      test('4.1.5.4 Upload proof of cause of death', async () => {
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

    test('4.1.7 Verify information on preview page', async () => {
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
        'informant.brn',
        declaration.informant.brn
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
          declaration.informant.address.province +
          declaration.informant.address.district +
          declaration.informant.address.village +
          declaration.informant.address.town +
          declaration.informant.address.residentialArea +
          declaration.informant.address.street +
          declaration.informant.address.number +
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

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        page,
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.state +
          declaration.spouse.address.district +
          declaration.spouse.address.town +
          declaration.spouse.address.addressLine1 +
          declaration.spouse.address.addressLine2 +
          declaration.spouse.address.addressLine3 +
          declaration.spouse.address.postcodeOrZip
      )
    })

    test('4.1.8 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('4.1.9 Declare and validate', async () => {
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
  test.describe('4.2 Declaration Review by Registrar', async () => {
    test('4.2.1 Navigate to the declaration "Record" -tab', async () => {
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

    test('4.2.2 Verify information on "Record" tab', async () => {
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
       * - informant's Id Number
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.idType',
        declaration.informant.idType
      )
      await expectRowValue(page, 'informant.brn', declaration.informant.brn)

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValue(
        page,
        'informant.address',
        declaration.informant.address.country +
          declaration.informant.address.province +
          declaration.informant.address.district +
          declaration.informant.address.village +
          declaration.informant.address.town +
          declaration.informant.address.residentialArea +
          declaration.informant.address.street +
          declaration.informant.address.number +
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

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValue(
        page,
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.state +
          declaration.spouse.address.district +
          declaration.spouse.address.town +
          declaration.spouse.address.addressLine1 +
          declaration.spouse.address.addressLine2 +
          declaration.spouse.address.addressLine3 +
          declaration.spouse.address.postcodeOrZip
      )
    })

    test('4.2.3 Register', async () => {
      await triggerDeclarationAction(page, 'Register')

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
