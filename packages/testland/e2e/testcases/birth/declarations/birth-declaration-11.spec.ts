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

import { test, expect } from '@playwright/test'
import {
  continueForm,
  formatName,
  goToSection,
  login,
  triggerDeclarationAction
} from '@e2e/support/helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '@e2e/support/constants'

test('11. Birth declaration case - 11', async ({ page }) => {
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }
    }
  }

  await test.step('11.1 Hospital official can notify with blank mother/father address', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await test.step('11.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await continueForm(page)
    })

    await test.step('11.1.2 Go to review', async () => {
      await goToSection(page, 'review')
    })

    await test.step('11.1.3 Notify', async () => {
      await triggerDeclarationAction(page, 'Notify')

      await page.getByText('Recent').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })
})
