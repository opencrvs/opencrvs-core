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
import { expect, test } from '@playwright/test'

import {
  formatName,
  goToSection,
  login,
  triggerDeclarationAction,
  switchEventTab
} from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { faker } from '@faker-js/faker'

const ANNOTATION_COMMENT = 'Test annotation comment'

test('2: Annotations on draft records', async ({ page }) => {
  const name = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male')
  }
  const formattedName = formatName(name)

  await test.step('2.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  await test.step('2.1 Create a birth draft and navigate to review page', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(name.firstNames)
    await page.locator('#surname').fill(name.familyName)

    await goToSection(page, 'review')
  })

  await test.step('2.2 Fill annotation comment and Save & Exit', async () => {
    await page.locator('#review____comment').fill(ANNOTATION_COMMENT)

    await triggerDeclarationAction(page, 'Save & Exit')
  })

  await test.step('2.3 Re-open draft — annotation comment is visible in Annotations section', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()

    await page.getByRole('button', { name: formattedName }).click()
    await switchEventTab(page, 'Record')

    await expect(
      page.getByText(ANNOTATION_COMMENT, { exact: true })
    ).toBeVisible()
  })
})
