import { expect, test, type Page } from '@playwright/test'

import { formatName, login, triggerDeclarationAction } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { getRowByTitle } from '../print-certificate/birth/helpers'

test.describe.serial('1: Validate my draft tab', () => {
  let page: Page
  const name = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male')
  }
  const formattedName = formatName(name)

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1 Record does not appear in draft ', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formattedName
    )
  })

  test('1.2 Create a draft', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(name.firstNames)
    await page.locator('#surname').fill(name.familyName)

    const draftResponse = page.waitForResponse(
      (res) => res.url().includes('event.draft.create') && res.ok()
    )
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await draftResponse
  })

  test('1.3 Record appears in draft', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).toContainText(formattedName)
  })

  test('1.4 Record has "Update" -CTA', async () => {
    const row = getRowByTitle(page, formattedName)
    await row.getByRole('button', { name: 'Update' }).click()
    await expect(page.getByTestId('row-value-child.name')).toHaveText(
      formattedName
    )
    await expect(page.getByTestId('change-button-child.name')).toBeVisible()
  })

  test('1.5 Record does not appear in draft for other user: RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formattedName
    )
  })

  test('1.6 Record does not appear in draft for other user: LR ', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formattedName
    )
  })

  test('1.7 Record does not appear in draft after notifying ', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL, true)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await getRowByTitle(page, formattedName)
      .getByRole('button', {
        name: 'Update'
      })
      .click()

    await triggerDeclarationAction(page, 'Notify')

    await expect(page.getByTestId('search-result')).toContainText('Drafts')
    await expect(page.getByTestId('search-result')).not.toContainText(
      formattedName
    )
  })
})
