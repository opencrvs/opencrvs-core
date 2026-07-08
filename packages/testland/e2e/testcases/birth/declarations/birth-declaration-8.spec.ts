import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  goToSection,
  login,
  logout,
  triggerDeclarationAction,
  switchEventTab
} from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import { faker } from '@faker-js/faker'
import { REQUIRED_VALIDATION_ERROR } from '../helpers'
import { ensureAssignedToUser } from '../../../utils'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('8. Birth declaration case - 8', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }
    },
    informantType: 'Someone else',
    informant: {
      relation: 'Uncle'
    },
    mother: {
      maritalStatus: 'Not stated'
    },
    father: {
      maritalStatus: 'Not stated'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('8.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('8.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('8.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      /*
       * Expected result: should show additional fields:
       * - Relationship to child
       */
      await page
        .locator('#informant____other____relation')
        .fill(declaration.informant.relation)

      await goToSection(page, 'mother')
    })

    test("8.1.3 Fill mother's details", async () => {
      await page.locator('#mother____maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await continueForm(page)
    })

    test("8.1.4 Fill father's details", async () => {
      await page.locator('#father____maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('8.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('8.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should require
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toContainText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(
        page.getByTestId('row-value-child.placeOfBirth')
      ).toContainText(REQUIRED_VALIDATION_ERROR)

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(
        page.getByTestId('row-value-informant.relation')
      ).toContainText(declaration.informantType)
      await expect(
        page.getByTestId('row-value-informant.other.relation')
      ).toContainText(declaration.informant.relation)

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.getByTestId('row-value-informant.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
      /*
       * Expected result: should require
       * - Informant's date of birth
       */
      await expect(page.getByTestId('row-value-informant.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Informant's Type of Id
       */
      await expect(
        page.getByTestId('row-value-informant.idType')
      ).toContainText(REQUIRED_VALIDATION_ERROR)

      /*
       * Expected result: should require
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toContainText(declaration.mother.maritalStatus)

      /*
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.getByTestId('row-value-mother.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.getByTestId('row-value-father.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toContainText(declaration.father.maritalStatus)
    })

    test('8.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('8.1.8 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')

      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('8.2 Declaration Review by RO', async () => {
    test('8.2.1 Navigate to the declaration "Record" -tab', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Notifications').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await switchEventTab(page, 'Record')
    })

    test('8.2.2 Verify information on preview page', async () => {
      /*
       * Expected result: should require
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toContainText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(
        page.getByTestId('row-value-child.placeOfBirth')
      ).toContainText(REQUIRED_VALIDATION_ERROR)

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(
        page.getByTestId('row-value-informant.relation')
      ).toContainText(declaration.informantType)
      await expect(
        page.getByTestId('row-value-informant.other.relation')
      ).toContainText(declaration.informant.relation)

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.getByTestId('row-value-informant.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
      /*
       * Expected result: should require
       * - Informant's date of birth
       */
      await expect(page.getByTestId('row-value-informant.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Informant's Type of Id
       */
      await expect(
        page.getByTestId('row-value-informant.idType')
      ).toContainText(REQUIRED_VALIDATION_ERROR)

      /*
       * Expected result: should require
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toContainText(declaration.mother.maritalStatus)

      /*
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.getByTestId('row-value-mother.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.getByTestId('row-value-father.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toContainText(declaration.father.maritalStatus)
    })
  })
})
