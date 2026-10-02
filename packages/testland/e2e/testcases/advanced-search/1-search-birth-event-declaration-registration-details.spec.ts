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
import { faker } from '@faker-js/faker'
import { assertTexts, selectLocationOption, type } from '@e2e/support/utils'
import { format, subDays } from 'date-fns'
import { BIRTH_LATE_REGISTRATION_TARGET_DAYS } from '@countryconfig/events/utils'

async function expectSearchParams(
  page: Page,
  expected: Record<string, string | RegExp>
) {
  for (const [key, value] of Object.entries(expected)) {
    await expect
      .poll(() => new URL(page.url()).searchParams.get(key))
      .toEqual(typeof value === 'string' ? value : expect.stringMatching(value))
  }
}

const todayDate = `${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate().toString()}`
const thisMonth = `${new Date().getMonth() < 9 ? '0' : ''}${(new Date().getMonth() + 1).toString()}`
const thisYear = new Date().getFullYear().toString()

test.describe
  .serial('Advanced Search - Birth Event Declaration - Registration details', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const toDate = format(new Date(), 'yyyy-MM-dd')
    // Previously tested failed and had to retry consistently since with late registration "child.reason" becomes required.
    const fromDate = format(
      subDays(new Date(), BIRTH_LATE_REGISTRATION_TARGET_DAYS - 10),
      'yyyy-MM-dd'
    )

    await createDeclaration(token, {
      'mother.dob': '1995-09-12',
      'child.dob': faker.date
        // DOB must be at least 18 years after mother.dob to pass validation
        // Upper bound ensures the record appears on the first page of search results
        .between({ from: fromDate, to: toDate })
        .toISOString()
        .split('T')[0],
      'child.gender': 'female'
    })
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1 - Validate log in and load search page', async () => {
    await login(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test.describe
    .serial('1.5 - Validate search by registration details search fields', () => {
    test('1.5.1 - Validate Place of registration filters, Date of registration Status of Record and Time Period', async () => {
      await page.getByText('Registration details').click()

      await page
        .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
        .fill('Ibombo')
      await selectLocationOption(page, 'Ibombo District Office')

      await type(
        page,
        '[data-testid="event____legalStatuses____REGISTERED____acceptedAt-dd"]',
        todayDate
      )
      await type(
        page,
        '[data-testid="event____legalStatuses____REGISTERED____acceptedAt-mm"]',
        thisMonth
      )
      await type(
        page,
        '[data-testid="event____legalStatuses____REGISTERED____acceptedAt-yyyy"]',
        thisYear
      )

      await expect(
        page.getByRole('button', { name: 'Exact date unknown' })
      ).toBeVisible()

      await expect(page.locator('#event____status')).toBeVisible()
      await page.locator('#event____status').click()
      await expect(page.getByText('Registered')).toBeVisible()
      await page.getByText('Registered').click()
      await expect(page.getByText('Registered')).toHaveCount(2)

      await expect(page.locator('#event____updatedAt')).toBeVisible()
      await page.locator('#event____updatedAt').click()
      await expect(page.getByText('Last 7 days', { exact: true })).toBeVisible()
      await page.getByText('Last 7 days', { exact: true }).click()
      await expect(page.getByText('Last 7 days')).toHaveCount(2)
    })

    test('1.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)

      await expectSearchParams(page, {
        'event.legalStatuses.REGISTERED.acceptedAt': `${thisYear}-${thisMonth}-${todayDate}`,
        'event.legalStatuses.REGISTERED.createdAtLocation': /.+/,
        'event.status': 'REGISTERED',
        'event.updatedAt': /.+/
      })

      await expect(page.getByText('Search result')).toBeVisible()
      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await assertTexts({
        root: page,
        testId: 'search-result',
        texts: [
          'Event: Birth',
          `Date of registration: ${thisYear}-${thisMonth}-${todayDate}`,
          'Place of registration: Ibombo District Office',
          'Status of record: Registered',
          'Time period: Last 7 days'
        ]
      })

      // Check for Edit button
      await expect(
        page.getByRole('button', { name: 'Edit', exact: true })
      ).toBeVisible()
    })

    test('1.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit', exact: true }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)

      await expectSearchParams(page, {
        'event.legalStatuses.REGISTERED.acceptedAt': `${thisYear}-${thisMonth}-${todayDate}`,
        'event.legalStatuses.REGISTERED.createdAtLocation': /.+/,
        'event.status': 'REGISTERED',
        'event.updatedAt': /.+/
      })

      await expect(
        page.locator(
          '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation'
        )
      ).toHaveText('Ibombo District Office')
      await expect(
        page.locator('#event____legalStatuses____REGISTERED____acceptedAt-dd')
      ).toHaveValue(todayDate)
      await expect(
        page.locator('#event____legalStatuses____REGISTERED____acceptedAt-mm')
      ).toHaveValue(thisMonth)
      await expect(
        page.locator('#event____legalStatuses____REGISTERED____acceptedAt-yyyy')
      ).toHaveValue(thisYear)
    })
  })
})
