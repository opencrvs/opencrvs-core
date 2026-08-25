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
import { faker } from '@faker-js/faker'

import { login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'

async function openDeathDeclaration(page: Page) {
  await page.click('#header-new-event')
  await page.getByLabel('Death').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('#firstname').fill(faker.person.firstName())
  await page.getByRole('button', { name: 'Continue' }).click()

  return page
}

test.describe('Death form - place of death jurisdiction restrictions', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('Hospital Official should only be able to choose Health Institution as place of death', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL_OTHER)
    await openDeathDeclaration(page)

    await page.locator('#eventDetails____placeOfDeath').click()

    await expect(
      page.getByText('Health Institution', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText("Deceased's usual place of residence", { exact: true })
    ).toBeHidden()
    await expect(page.getByText('Other', { exact: true })).toBeHidden()
  })

  test('Hospital Official should be able to only choose their own location as Health Institution', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL_OTHER)
    await openDeathDeclaration(page)

    await page.locator('#eventDetails____placeOfDeath').click()
    await page.getByText('Health Institution', { exact: true }).click()

    const locationInput = await page.locator('#eventDetails____deathLocation')
    await locationInput.click()

    const dropdown = await page.locator(
      '#searchable-select-eventDetails____deathLocation .react-select__menu'
    )
    await expect(dropdown).toBeVisible()

    // Make sure select menu only has one visible option and that it contains the user's own health institution
    const options = await dropdown.locator('[role="list"] > li')
    await expect(options).toHaveCount(1)
  })

  test('Embassy Official should not be able to choose Health Institution as place of death', async () => {
    await login(page, CREDENTIALS.EMBASSY_OFFICIAL)
    await openDeathDeclaration(page)

    await page.locator('#eventDetails____placeOfDeath').click()

    await expect(
      page.getByText('Health Institution', { exact: true })
    ).toBeHidden()
    await expect(
      page.getByText("Deceased's usual place of residence", { exact: true })
    ).toBeVisible()
    await expect(page.getByText('Other', { exact: true })).toBeVisible()
  })

  test('Community Leader should not be able to choose Health Institution as place of death', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
    await openDeathDeclaration(page)

    await page.locator('#eventDetails____placeOfDeath').click()

    await expect(
      page.getByText('Health Institution', { exact: true })
    ).toBeHidden()
    await expect(
      page.getByText("Deceased's usual place of residence", { exact: true })
    ).toBeVisible()
    await expect(page.getByText('Other', { exact: true })).toBeVisible()
  })

  test('Registrar should be able to choose all place of death options', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await openDeathDeclaration(page)

    await page.locator('#eventDetails____placeOfDeath').click()

    await expect(
      page.getByText('Health Institution', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText("Deceased's usual place of residence", { exact: true })
    ).toBeVisible()
    await expect(page.getByText('Other', { exact: true })).toBeVisible()
  })
})
