import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  goToSection,
  login,
  logout,
  triggerDeclarationAction,
  switchEventTab,
  uploadImage,
  uploadImageToSection
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { REQUIRED_VALIDATION_ERROR } from '../helpers'
import { ensureAssignedToUser } from '../../../utils'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('7. Birth declaration case - 7', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }
    },
    attendantAtBirth: 'None',
    informantType: 'Legal guardian',
    mother: {
      detailsDontExist: true,
      reason: 'Mother is unknown'
    },
    father: {
      detailsDontExist: true,
      reason: 'Father is unknown'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('7.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await page.locator('#child____attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()
      await continueForm(page)
    })

    test('7.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("7.1.3 Fill mother's details", async () => {
      await page.getByLabel("Mother's details are not available").check()
      await page.locator('#mother____reason').fill(declaration.mother.reason)
      await continueForm(page)
    })

    test("7.1.4 Fill father's details", async () => {
      await page.getByLabel("Father's details are not available").check()
      await page.locator('#father____reason').fill(declaration.father.reason)
    })

    test('7.1.5 Hospital official should skip Documents page', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.6 Verify information on review page', async () => {
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
       * - Reason of why mother's details not available
       */
      await expect(page.getByTestId('row-value-mother.reason')).toContainText(
        declaration.mother.reason
      )

      /*
       * Expected result: should require
       * - Reason of why father's details not available
       */
      await expect(page.getByTestId('row-value-father.reason')).toContainText(
        declaration.father.reason
      )
    })

    test('7.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('7.1.8 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')

      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('7.2 Declaration Review by RO', async () => {
    test('7.2.1 Navigate to the declaration "Record" -tab', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await page.getByText('Notifications').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await switchEventTab(page, 'Record')
    })

    test('7.2.2 Verify information on review page', async () => {
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
    })
  })
})
