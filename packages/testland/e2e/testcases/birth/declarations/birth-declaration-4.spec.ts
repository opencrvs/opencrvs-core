import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateObjectTo_dMMMMyyyy,
  formatName,
  getRandomDate,
  goToSection,
  login,
  logout,
  triggerDeclarationAction,
  switchEventTab
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { fillDate, validateAddress } from '../helpers'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('4. Birth declaration case - 4', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName() + '-Peter',
        familyName: faker.person.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Other paramedical personnel',
    birthType: 'Quadruplet',
    placeOfBirth: 'Other',
    birthLocation: {
      country: 'Farajaland',
      province: 'Central',
      district: 'Ibombo',
      town: faker.location.city(),
      residentialArea: faker.location.county(),
      street: faker.location.street(),
      number: faker.location.buildingNumber(),
      postcodeOrZip: faker.location.zipCode()
    },
    informantType: 'Grandmother',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      age: 60,
      nationality: 'Guernsey',
      identifier: {
        id: faker.string.numeric(10),
        type: 'Passport'
      },
      address: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Ama',
        village: 'Kitu',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      age: 25,
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      address: {
        country: 'Guam',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      },
      maritalStatus: 'Divorced',
      levelOfEducation: 'Tertiary'
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      maritalStatus: 'Divorced',
      levelOfEducation: 'Tertiary',
      address: {
        sameAsMother: false,
        country: 'Grenada',
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
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('4.1 Declaration started by RO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER_VILLAGE)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('4.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#firstname').blur()
      await page.locator('#surname').fill(declaration.child.name.familyName)
      await page.locator('#surname').blur()
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()

      // Province and district are disabled because the user jurisdiction is limited to user's administrative area
      await expect(
        page.locator('#child____birthLocation____other-form-input #province')
      ).toBeDisabled()

      await expect(
        page.locator('#child____birthLocation____other-form-input #district')
      ).toBeDisabled()

      await page.locator('#town').fill(declaration.birthLocation.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.birthLocation.residentialArea)
      await page.locator('#street').fill(declaration.birthLocation.street)
      await page.locator('#number').fill(declaration.birthLocation.number)
      await page
        .locator('#zipCode')
        .fill(declaration.birthLocation.postcodeOrZip)

      await page.locator('#child____attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()
      await page.locator('#child____birthType').click()
      await page
        .getByText(declaration.birthType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test('4.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      /*
       * Expected result: should show additional fields:
       * - Full Name
       * - Date of birth
       * - Nationality
       * - Id
       * - Usual place of residence
       */
      await page
        .locator('#firstname')
        .fill(declaration.informant.name.firstNames)
      await page.locator('#surname').fill(declaration.informant.name.familyName)
      await page.locator('#surname').blur()

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
        .getByText(declaration.informant.identifier.type, { exact: true })
        .click()

      await page
        .locator('#informant____passport')
        .fill(declaration.informant.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.informant.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.informant.address.country, { exact: true })
        .click()

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

      await continueForm(page)
    })

    test("4.1.3 Fill mother's details", async () => {
      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#firstname').blur()
      await page.locator('#surname').fill(declaration.mother.name.familyName)
      await page.locator('#surname').blur()

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#mother____age')
        .fill(declaration.mother.age.toString())

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#state').fill(declaration.mother.address.state)
      await page.locator('#district2').fill(declaration.mother.address.district)
      await page.locator('#cityOrTown').fill(declaration.mother.address.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.mother.address.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.mother.address.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.mother.address.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.mother.address.postcodeOrZip)

      await page.locator('#mother____maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await page.locator('#mother____educationalAttainment').click()
      await page
        .getByText(declaration.mother.levelOfEducation, { exact: true })
        .click()

      await continueForm(page)
    })

    test("4.1.4 Fill father's details", async () => {
      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#firstname').blur()
      await page.locator('#surname').fill(declaration.father.name.familyName)
      await page.locator('#surname').blur()

      await fillDate(page, declaration.father.birthDate)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page.getByLabel('No', { exact: true }).check()
      await page
        .locator('#country input')
        .fill(declaration.father.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.father.address.country, { exact: true })
        .click()

      await page.locator('#state').fill(declaration.father.address.state)
      await page.locator('#district2').fill(declaration.father.address.district)
      await page.locator('#cityOrTown').fill(declaration.father.address.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.father.address.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.father.address.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.father.address.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.father.address.postcodeOrZip)

      await page.locator('#father____maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.locator('#father____educationalAttainment').click()
      await page
        .getByText(declaration.father.levelOfEducation, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('4.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('4.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toHaveText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toHaveText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('row-value-child.placeOfBirth')).toHaveText(
        declaration.placeOfBirth
      )
      await validateAddress(
        page,
        declaration.birthLocation,
        'row-value-child.birthLocation.other'
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(
        page.getByTestId('row-value-child.attendantAtBirth')
      ).toHaveText(declaration.attendantAtBirth)

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.getByTestId('row-value-child.birthType')).toHaveText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.getByTestId('row-value-informant.relation')).toHaveText(
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toHaveText(
        declaration.informantEmail
      )
      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.getByTestId('row-value-informant.name')).toHaveText(
        declaration.informant.name.firstNames +
          ' ' +
          declaration.informant.name.familyName
      )

      /*
       * Expected result: should include
       * - Informant's date of birth
       */
      await expect(page.getByTestId('row-value-informant.age')).toHaveText(
        declaration.informant.age.toString()
      )

      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      await expect(
        page.getByTestId('row-value-informant.nationality')
      ).toContainText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - Informant's address
       */
      await validateAddress(
        page,
        declaration.informant.address,
        'row-value-informant.address'
      )

      /*
       * Expected result: should include
       * - Informant's Type of Id
       * - Informant's Id
       */
      await expect(
        page.getByTestId('row-value-informant.idType')
      ).toContainText(declaration.informant.identifier.type)
      await expect(
        page.getByTestId('row-value-informant.passport')
      ).toContainText(declaration.informant.identifier.id)

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.name')).toHaveText(
        declaration.mother.name.firstNames +
          ' ' +
          declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.age')).toContainText(
        declaration.mother.age.toString()
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.getByTestId('row-value-mother.nationality')).toHaveText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toHaveText(declaration.mother.maritalStatus)

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(
        page.getByTestId('row-value-mother.educationalAttainment')
      ).toHaveText(declaration.mother.levelOfEducation)

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.getByTestId('row-value-mother.idType')).toHaveText(
        declaration.mother.identifier.type
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await validateAddress(
        page,
        declaration.mother.address,
        'row-value-mother.address'
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toHaveText(
        declaration.father.name.firstNames +
          ' ' +
          declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.getByTestId('row-value-father.nationality')).toHaveText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       */
      await expect(page.getByTestId('row-value-father.idType')).toHaveText(
        declaration.father.identifier.type
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toHaveText(declaration.father.maritalStatus)

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(
        page.getByTestId('row-value-father.educationalAttainment')
      ).toHaveText(declaration.father.levelOfEducation)

      /*
       * Expected result: should include
       * - Father's address
       */
      await validateAddress(
        page,
        declaration.father.address,
        'row-value-father.address'
      )
    })
    test('4.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })
    test('4.1.8 Declare', async () => {
      await triggerDeclarationAction(page, 'Declare')

      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('4.2 Declaration Review by Registrar', async () => {
    test('4.2.1 Navigate to the declaration "Record" -tab', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRAR_VILLAGE)

      await page.getByText('Pending registration').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await switchEventTab(page, 'Record')
    })

    test('4.2.2 Verify information on "Record" tab', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toHaveText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )
      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toHaveText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('row-value-child.placeOfBirth')).toHaveText(
        declaration.placeOfBirth
      )
      await validateAddress(
        page,
        declaration.birthLocation,
        'row-value-child.birthLocation.other'
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(
        page.getByTestId('row-value-child.attendantAtBirth')
      ).toHaveText(declaration.attendantAtBirth)

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.getByTestId('row-value-child.birthType')).toHaveText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.getByTestId('row-value-informant.relation')).toHaveText(
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toHaveText(
        declaration.informantEmail
      )
      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.getByTestId('row-value-informant.name')).toHaveText(
        declaration.informant.name.firstNames +
          ' ' +
          declaration.informant.name.familyName
      )

      /*
       * Expected result: should include
       * - Informant's date of birth
       */
      await expect(page.getByTestId('row-value-informant.age')).toContainText(
        declaration.informant.age.toString()
      )
      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      await expect(
        page.getByTestId('row-value-informant.nationality')
      ).toContainText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - Informant's address
       */
      await validateAddress(
        page,
        declaration.informant.address,
        'row-value-informant.address'
      )

      /*
       * Expected result: should include
       * - Informant's Type of Id
       * - Informant's Id
       */
      await expect(
        page.getByTestId('row-value-informant.idType')
      ).toContainText(declaration.informant.identifier.type)
      await expect(
        page.getByTestId('row-value-informant.passport')
      ).toContainText(declaration.informant.identifier.id)

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.name')).toHaveText(
        declaration.mother.name.firstNames +
          ' ' +
          declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.age')).toContainText(
        declaration.mother.age.toString()
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.getByTestId('row-value-mother.nationality')).toHaveText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toHaveText(declaration.mother.maritalStatus)

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(
        page.getByTestId('row-value-mother.educationalAttainment')
      ).toHaveText(declaration.mother.levelOfEducation)

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.getByTestId('row-value-mother.idType')).toHaveText(
        declaration.mother.identifier.type
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await validateAddress(
        page,
        declaration.mother.address,
        'row-value-mother.address'
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toHaveText(
        declaration.father.name.firstNames +
          ' ' +
          declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.getByTestId('row-value-father.nationality')).toHaveText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       */
      await expect(page.getByTestId('row-value-father.idType')).toHaveText(
        declaration.father.identifier.type
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toHaveText(declaration.father.maritalStatus)

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(
        page.getByTestId('row-value-father.educationalAttainment')
      ).toHaveText(declaration.father.levelOfEducation)

      /*
       * Expected result: should include
       * - Father's address
       */
      await validateAddress(
        page,
        declaration.father.address,
        'row-value-father.address'
      )
    })
  })
})
