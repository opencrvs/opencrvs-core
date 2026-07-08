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

test.describe.serial('1. Death declaration case - 1', () => {
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
      maritalStatus: 'Single',
      numberOfDependants: 3,
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
      mannerOfDeath: 'Natural causes',
      date: getRandomDate(0, 20),
      causeOfDeathEstablished: true,
      sourceCauseDeath: 'Physician',
      placeOfDeath: 'Health Institution',
      deathLocation: 'Klow Village Hospital'
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
      relation: 'Spouse',
      email: faker.internet.email()
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
      addressSameAs: true
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

  test.describe('1.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('1.1.1 Fill deceased details', async () => {
      await page.locator('#firstname').fill(declaration.deceased.name.firstname)
      await page.locator('#surname').fill(declaration.deceased.name.surname)
      await page.locator('#deceased____gender').click()
      await page.getByText(declaration.deceased.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.deceased.dob.dd)
      await page.getByPlaceholder('mm').fill(declaration.deceased.dob.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.deceased.dob.yyyy)

      await page.locator('#deceased____idType').click()
      await page.getByText(declaration.deceased.idType, { exact: true }).click()

      await page.locator('#deceased____nid').fill(declaration.deceased.nid)

      await page.locator('#deceased____maritalStatus').click()
      await page
        .getByText(declaration.deceased.maritalStatus, { exact: true })
        .click()

      await page
        .locator('#deceased____numberOfDependants')
        .fill(declaration.deceased.numberOfDependants.toString())

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

    test('1.1.2 Fill event details', async () => {
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

    test('1.1.3 Fill cause of death details', async () => {
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

    test('1.1.4 Fill informant details', async () => {
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

    test('1.1.5 Fill spouse details', async () => {
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

    test('1.1.6 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('1.1.7 Verify information on preview page', async () => {
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
       * - Number of Deceased's Dependants
       */
      await expectRowValueWithChangeButton(
        page,
        'deceased.numberOfDependants',
        declaration.deceased.numberOfDependants.toString()
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
      await expectRowValueWithChangeButton(page, 'spouse.addressSameAs', 'Yes')
    })

    test('1.1.8 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('1.1.9 Declare', async () => {
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
  test.describe('1.2 Declaration Review by RO', async () => {
    test('1.2.1 Navigate to the declaration "Record" -tab', async () => {
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

    test('1.2.2 Verify information on review page', async () => {
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
        'deceased.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.deceased.dob)
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
      await expectRowValue(page, 'deceased.nid', declaration.deceased.nid)

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
       * - Number of Deceased's Dependants
       */
      await expectRowValue(
        page,
        'deceased.numberOfDependants',
        declaration.deceased.numberOfDependants.toString()
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
      await expectRowValue(page, 'spouse.nid', declaration.spouse.nid)

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValue(page, 'spouse.addressSameAs', 'Yes')
    })
  })
})
