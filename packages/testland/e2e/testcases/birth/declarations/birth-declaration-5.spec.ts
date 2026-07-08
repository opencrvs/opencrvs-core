import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateObjectTo_dMMMMyyyy,
  formatName,
  getRandomDate,
  goToSection,
  login,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { validateAddress } from '../helpers'

test.describe.serial('5. Birth declaration case - 5', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName() + ' the 3rd',
        familyName: faker.person.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Layperson',
    birthType: 'Higher multiple delivery',
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
    informantType: 'Brother',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      age: 16,
      nationality: 'Guernsey',
      identifier: {
        id: faker.string.numeric(10),
        type: 'Birth Registration Number'
      },
      address: {
        country: 'Haiti',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
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
      maritalStatus: 'Separated',
      levelOfEducation: 'Tertiary'
    },
    father: {
      detailsDontExist: true,
      reason: 'Father is a ghost'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('5.1 Declaration started by Registrar', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRAR_VILLAGE)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('5.1.1 Fill child details', async () => {
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

      await expect(
        page.locator('#child____birthLocation____other-form-input #village')
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

    test('5.1.2 Fill informant details', async () => {
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
        .locator('#informant____brn')
        .fill(declaration.informant.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.informant.address.country.slice(0, 3))
      await page
        .locator('#country')
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

      await continueForm(page)
    })

    test("5.1.3 Fill mother's details", async () => {
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

    test("5.1.4 Fill father's details", async () => {
      await page.getByLabel("Father's details are not available").check()
      await page.locator('#father____reason').fill(declaration.father.reason)
    })

    test('5.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('5.1.6 Verify information on review page', async () => {
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
      await expect(page.getByTestId('row-value-informant.brn')).toContainText(
        declaration.informant.identifier.id
      )

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
       * - Father's Details not available: true
       * - Reason of why father's details not available
       */
      await expect(
        page.getByTestId('row-value-father.detailsNotAvailable')
      ).toHaveText('Yes')
      await expect(page.getByTestId('row-value-father.reason')).toHaveText(
        declaration.father.reason
      )
    })

    test('5.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('5.1.8 Register', async () => {
      await triggerDeclarationAction(page, 'Register')

      await page.getByText('Pending certification').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })
})
