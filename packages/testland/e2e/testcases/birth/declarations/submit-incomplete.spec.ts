import { test, expect, type Page } from '@playwright/test'
import {
  formatName,
  goToSection,
  login,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test.describe.serial('Submit and verify incomplete birth declaration', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      }
    },

    placeOfBirth: 'Health Institution'
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
    })

    test('Go to review and send for review', async () => {
      await goToSection(page, 'review')
      await triggerDeclarationAction(page, 'Notify')
    })

    test('Verify summary page', async () => {
      await page.getByText('Recent').click()

      await openRecordByTitle(page, formatName(declaration.child.name))

      await expect(page.getByText('Notified', { exact: true })).toBeVisible()
      await expect(page.locator('#content-name')).toContainText(
        formatName(declaration.child.name)
      )
      await expect(
        page.getByTestId('status-value').locator('span')
      ).toContainText('Notified')
      await expect(
        page.getByTestId('event-value').locator('span')
      ).toContainText('Birth')
      await expect(
        page.getByTestId('child.dob-value').locator('span')
      ).toBeHidden()
      await expect(
        page.getByTestId('registrationNumber-value').locator('span')
      ).toContainText('No registration number')
      await expect(
        page.getByTestId('informant.contact-value').locator('span')
      ).toBeHidden()
      await expect(
        page.getByTestId('assignedTo-value').locator('span')
      ).toContainText('Not assigned')

      await expect(
        page.getByTestId('child.birthLocation-value').locator('span')
      ).toBeHidden()
    })
  })
})
