/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { expect, test, type Page } from '@playwright/test'
import { getToken, login } from '@e2e/support/helpers'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '@e2e/support/constants'
import { getMonthFormatted } from '@e2e/support/advanced-search/helper'
import { assertTexts, expectInUrl, type } from '@e2e/support/utils'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Mother's details", () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let record: Awaited<ReturnType<typeof createDeclaration>>

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRAR)

    record = await createDeclaration(token)
    ;[yyyy, mm, dd] = record.declaration['mother.dob'].split('-')
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

  test.describe.serial("2.5 - Validate search by Mother's details", () => {
    test('2.5.1 - Validate filling name and dob filters', async () => {
      await page.getByText('Mother details').click()
      await type(
        page,
        '[data-testid="text__firstname"]',
        record.declaration['mother.name'].firstname
      )
      await type(
        page,
        '[data-testid="text__surname"]',
        record.declaration['mother.name'].surname
      )
      await type(page, '[data-testid="mother____dob-dd"]', dd)
      await type(page, '[data-testid="mother____dob-mm"]', mm)
      await type(page, '[data-testid="mother____dob-yyyy"]', yyyy)
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      expect(page.url()).toContain(`mother.dob=${yyyy}-${mm}-${dd}`)
      const param = new URL(page.url()).searchParams.get('mother.name')!
      const decoded = decodeURIComponent(param)
      const name = JSON.parse(decoded)
      expect(name).toEqual({
        firstname: record.declaration['mother.name'].firstname,
        surname: record.declaration['mother.name'].surname
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
          `Mother's Date of birth: ${yyyy}-${mm}-${dd}`,
          `Mother's Name: ${record.declaration['mother.name'].firstname} ${record.declaration['mother.name'].surname}`
        ]
      })

      await expect(
        page.getByRole('button', { name: 'Edit', exact: true })
      ).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit', exact: true }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      expect(page.url()).toContain(`mother.dob=${yyyy}-${mm}-${dd}`)

      const param = new URL(page.url()).searchParams.get('mother.name')!
      const decoded = decodeURIComponent(param)
      const name = JSON.parse(decoded)

      expect(name).toEqual({
        firstname: record.declaration['mother.name'].firstname,
        surname: record.declaration['mother.name'].surname
      })
      await expect(page.locator('#tab_birth')).toHaveText('Birth')
      await expect(page.getByTestId('mother____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('mother____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('mother____dob-yyyy')).toHaveValue(yyyy)
      await expect(page.locator('#firstname')).toHaveValue(
        record.declaration['mother.name'].firstname
      )
      await expect(page.locator('#surname')).toHaveValue(
        record.declaration['mother.name'].surname
      )
    })

    test('2.5.4 - Validate mother.dob range input', async () => {
      const motherDOBRangeButton = page.locator(
        '#mother____dob-date_range_button'
      )
      if (await motherDOBRangeButton.isVisible()) {
        await page.locator('#mother____dob-date_range_button').click()
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
          'input[type="checkbox"][name="mother____dobdate_range_toggle"]'
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
