import { expect, Page, test } from '@playwright/test'
import {
  goToSection,
  login,
  logout,
  triggerDeclarationAction
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { fillChildDetails, openBirthDeclaration } from './helpers'
import { selectAction } from '../../utils'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

/**
 * Skipping tests until the outbox workqueue is implemented.
 * Develop is already in broken state. We'll revisit this when we have ungloc the pipeline and can dedicate time on which change caused the error.
 */
test.describe('Save and delete drafts', () => {
  test.describe.serial('Save draft', () => {
    let childName = ''
    let page: Page
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await openBirthDeclaration(page)
    })

    test('Save draft via Save & Exit', async () => {
      childName = await fillChildDetails(page)
      await page.getByRole('button', { name: 'Save & Exit' }).click()
      await expect(
        page.getByText(
          'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?'
        )
      ).toBeVisible()

      const draftResponse = page.waitForResponse(
        (res) => res.url().includes('event.draft.create') && res.ok()
      )
      await page.getByRole('button', { name: 'Confirm' }).click()
      await draftResponse

      await page.getByRole('button', { name: 'Drafts' }).click()
      await openRecordByTitle(page, childName)

      await expect(page.locator('#content-name')).toHaveText(childName)
    })

    test('Saved draft is not visible to other users', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRAR)

      await page.getByText('Drafts').click()

      await expect(
        page.getByRole('button', { name: childName, exact: true })
      ).not.toBeVisible()
    })

    test('Login as Registration Officer', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRATION_OFFICER, true)
    })

    test('Delete saved draft', async () => {
      await page.getByRole('button', { name: 'Drafts' }).click()
      await openRecordByTitle(page, childName)

      await selectAction(page, 'Update')
      await triggerDeclarationAction(page, 'Delete declaration')

      await expect(
        page.getByRole('button', { name: childName, exact: true })
      ).not.toBeVisible()
    })
  })

  test.describe.serial('Exit without saving', () => {
    let page: Page
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await openBirthDeclaration(page)
    })
    test('Exit without saving', async () => {
      const childName = await fillChildDetails(page)
      await goToSection(page, 'review')
      await page.getByTestId('exit-button').click()

      await expect(
        page.getByText(
          'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?'
        )
      ).toBeVisible()

      await page.getByRole('button', { name: 'Confirm', exact: true }).click()

      await page.getByRole('button', { name: 'Assigned to you' }).click()

      await expect(
        page.getByRole('button', { name: childName, exact: true })
      ).not.toBeVisible()
    })
  })
})
