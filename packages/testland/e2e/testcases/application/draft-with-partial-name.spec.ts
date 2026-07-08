import { expect, test, type Page } from '@playwright/test'

import { formatName, login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'

test.describe.serial('Validate draft with partial name', () => {
  let page: Page
  const name1 = {
    firstNames: faker.person.firstName('male')
  }
  const name2 = {
    familyName: faker.person.lastName('male')
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Record does not appear in draft', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name1)
    )
    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name2)
    )
  })

  test('Create a draft with only firstname', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(name1.firstNames)

    const draftResponse = page.waitForResponse(
      (res) => res.url().includes('event.draft.create') && res.ok()
    )
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await draftResponse
  })

  test('Create a draft with only lastname', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#surname').fill(name2.familyName)

    const draftResponse = page.waitForResponse(
      (res) => res.url().includes('event.draft.create') && res.ok()
    )
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await draftResponse
  })

  test('Records appear in draft', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).toContainText(
      formatName(name1)
    )
    await expect(page.getByTestId('search-result')).toContainText(
      formatName(name2)
    )
  })

  test('Records do not appear in draft for other user: RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name1)
    )
    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name2)
    )
  })

  test('Records do not appear in draft for other user: LR', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name1)
    )
    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name2)
    )
  })
})
