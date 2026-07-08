import { expect, test, type Page } from '@playwright/test'
import { getToken, login } from '../../helpers'
import {
  createDeclaration,
  Declaration
} from '../test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { getMonthFormatted } from './helper'
import { assertTexts, expectInUrl, type } from '../../utils'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Father's details", () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let record: { eventId: string; declaration: Declaration }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRAR)
    record = await createDeclaration(token, {}, 'REGISTER', 'HEALTH_FACILITY')
    ;[yyyy, mm, dd] = (record.declaration['father.dob'] ?? '').split('-')
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('2.1 - Validate log in and load search page', async () => {
    await login(page)
    await page.click('#searchType')
    await expectInUrl(page, 'advanced-search')
    await page.getByText('Birth').click()
  })

  test.describe.serial("2.5 - Validate search by Father's details", () => {
    test('2.5.1 - Validate filling name and dob filters', async () => {
      await page.getByText('Father details').click()

      await type(
        page,
        '#firstname',
        record.declaration['father.name'].firstname ?? faker.person.firstName
      )
      await type(page, '#surname', record.declaration['father.name'].surname)

      await type(page, '[data-testid="father____dob-dd"]', dd)
      await type(page, '[data-testid="father____dob-mm"]', mm)
      await type(page, '[data-testid="father____dob-yyyy"]', yyyy)
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      expect(page.url()).toContain(`father.dob=${yyyy}-${mm}-${dd}`)
      const param = new URL(page.url()).searchParams.get('father.name')!
      const decoded = decodeURIComponent(param)
      const name = JSON.parse(decoded)

      expect(name).toEqual({
        firstname: record.declaration['father.name'].firstname,
        surname: record.declaration['father.name'].surname
      })
      await expect(page.getByText('Search results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await assertTexts({
        root: page,
        testId: 'search-result',
        texts: [
          'Event: Birth',
          `Father's Date of birth: ${yyyy}-${mm}-${dd}`,
          `Father's Name: ${record.declaration['father.name'].firstname ?? faker.person.firstName} ${record.declaration['father.name'].surname}`
        ]
      })
      await expect(
        page.getByRole('button', { name: 'Edit', exact: true })
      ).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit', exact: true }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      expect(page.url()).toContain(`father.dob=${yyyy}-${mm}-${dd}`)

      const param = new URL(page.url()).searchParams.get('father.name')!
      const decoded = decodeURIComponent(param)
      const name = JSON.parse(decoded)

      expect(name).toEqual({
        firstname: record.declaration['father.name'].firstname,
        surname: record.declaration['father.name'].surname
      })

      await expect(page.locator('#tab_birth')).toHaveText('Birth')
      await expect(page.getByTestId('father____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('father____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('father____dob-yyyy')).toHaveValue(yyyy)
      await expect(page.locator('#firstname')).toHaveValue(
        record.declaration['father.name'].firstname ?? faker.person.firstName
      )
      await expect(page.locator('#surname')).toHaveValue(
        record.declaration['father.name'].surname
      )
    })

    test('2.5.4 - Validate father.dob range input', async () => {
      const fatherDOBRangeButton = page.locator(
        '#father____dob-date_range_button'
      )
      if (await fatherDOBRangeButton.isVisible()) {
        await page.locator('#father____dob-date_range_button').click()
        await expect(page.locator('#picker-modal')).toBeVisible()

        const currentMonth = new Date().getMonth() + 1
        const shortMonth = getMonthFormatted(currentMonth)
        const month = getMonthFormatted(currentMonth, { month: 'long' })
        await expect(
          page.getByRole('button', { name: shortMonth })
        ).toHaveCount(2)
        await expect(page.locator('#date-range-confirm-action')).toBeVisible()

        await page.locator('#date-range-confirm-action').click()
        await expect(page.locator('#picker-modal')).toBeHidden()

        const checkbox = page.locator(
          'input[type="checkbox"][name="father____dobdate_range_toggle"]'
        )
        await expect(checkbox).toBeVisible()
        await expect(checkbox).toBeChecked()

        const currentYear = new Date().getFullYear()
        const lastYear = currentYear - 1
        // ex: 'May 2024 to May 2025' is visible after date range selection
        await expect(
          page.getByText(`${month} ${lastYear} to ${month} ${currentYear}`)
        ).toBeVisible()
      }
    })
  })
})
