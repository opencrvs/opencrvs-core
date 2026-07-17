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

import {
  formatName,
  goToSection,
  login,
  triggerDeclarationAction,
  switchEventTab
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'

const ANNOTATION_COMMENT = 'Test annotation comment'

test.describe.serial('2: Annotations on draft records', () => {
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

  test('2.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('2.1 Create a birth draft and navigate to review page', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(name.firstNames)
    await page.locator('#surname').fill(name.familyName)

    await goToSection(page, 'review')
  })

  test('2.2 Fill annotation comment and Save & Exit', async () => {
    await page.locator('#review____comment').fill(ANNOTATION_COMMENT)

    await triggerDeclarationAction(page, 'Save & Exit')
  })

  test('2.3 Re-open draft — annotation comment is visible in Annotations section', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()

    await page.getByRole('button', { name: formattedName }).click()
    await switchEventTab(page, 'Record')

    await expect(
      page.getByText(ANNOTATION_COMMENT, { exact: true })
    ).toBeVisible()
  })
})
