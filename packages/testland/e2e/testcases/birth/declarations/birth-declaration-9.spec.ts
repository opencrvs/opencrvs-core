import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  goToSection,
  login,
  triggerDeclarationAction,
  switchEventTab
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { assertRecordInWorkqueue, REQUIRED_VALIDATION_ERROR } from '../helpers'
import { ensureAssignedToUser } from '../../../utils'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'
import { title } from 'process'

test.describe.serial('9. Birth declaration case - 9', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }
    },
    informantType: 'Mother',
    mother: {
      detailsDontExist: false
    },
    father: {
      detailsDontExist: true
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('9.1 Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await continueForm(page)
    })

    test('9.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test("9.1.3 Fill mother's details", async () => {
      await continueForm(page)
    })

    test("9.1.4 Fill father's details", async () => {
      await page.getByLabel("Father's details are not available").check()
      await continueForm(page)
    })

    test('9.1.5 Go to preview', async () => {
      await goToSection(page, 'review')
    })

    test('9.1.6 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Child's Family Name
       * * should require
       * - Child's First Name
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

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

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
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.getByTestId('row-value-mother.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Reason of why father's details not available
       */
      await expect(page.getByTestId('row-value-father.reason')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    })

    test('9.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('9.1.8 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          {
            title: 'Recent',
            exists: true
          }
        ]
      })
    })
  })

  test.describe('9.2 Declaration Review by RO', async () => {
    test('9.2.0 Login', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    })

    test('9.2.1 Navigate to the declaration review page', async () => {
      await page.getByRole('button', { name: 'Notifications' }).click()
      await openRecordByTitle(page, formatName(declaration.child.name))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)
      await switchEventTab(page, 'Record')
    })

    test('9.2.2 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Child's Family Name
       * * should require
       * - Child's First Name
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

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

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
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.getByTestId('row-value-mother.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Reason of why father's details not available
       */
      await expect(page.getByTestId('row-value-father.reason')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    })
  })
})
