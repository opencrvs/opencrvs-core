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
import { login } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import path from 'path'
import { ASSETS_DIR } from '@e2e/support/paths'

test('1. Settings Page', async ({ page }) => {
  await login(page, CREDENTIALS.REGISTRAR)

  // 1.1.1 Navigate to settings page
  async function openSettings() {
    await page.getByRole('button', { name: 'Profile' }).click()

    await page
      .locator('#ProfileMenu-Dropdown-Content')
      .waitFor({ state: 'visible' })

    await page.locator('li').filter({ hasText: 'Settings' }).click()
  }

  await test.step('1.1 Registrar Settings page', async () => {
    await test.step('1.1.2 Validate content', async () => {
      await openSettings()

      // User details displayed
      await expect(page.getByTestId('name-value')).toContainText(
        'Kennedy Mweene'
      )
      await expect(page.getByTestId('phone-number-value')).toContainText(
        '0923232323'
      )
      await expect(page.getByTestId('email-address-value')).toContainText(
        'kalushabwa.lya17@gmail.com'
      )
      await expect(page.getByTestId('role-value')).toContainText('Registrar')
      await expect(page.getByTestId('assigned-office-value')).toContainText(
        'Ibombo District Office'
      )

      // Editable fields
      await expect(
        page.getByTestId('change-phone-button').first()
      ).toBeEnabled()
      await expect(
        page.getByTestId('change-email-address').first()
      ).toBeEnabled()
      await expect(page.getByTestId('change-avatar').first()).toBeEnabled()
      await expect(page.locator('#BtnChangeLanguage').first()).toBeEnabled()
      await expect(page.locator('#btnChangePassword').first()).toBeEnabled()

      await expect(
        page
          .getByTestId('profile-image-value')
          .getByRole('img', { name: 'Kennedy Mweene' })
      ).toBeVisible()
    })

    await test.step('1.1.3 Change avatar', async () => {
      await openSettings()

      await page.getByTestId('change-avatar').first().click()

      const attachmentPath = path.join(ASSETS_DIR, 'image.png')

      await page
        .locator('#image_file_uploader_field')
        .first()
        .setInputFiles(attachmentPath)

      await page.getByRole('button', { name: 'Apply' }).click()

      await page.waitForResponse(
        (resp) =>
          resp.url().includes('/users/') &&
          resp.url().endsWith('.jpeg') &&
          resp.status() === 200
      )

      await page.getByText('Profile image successfully updated')

      const newAvatar = page.getByTestId('profile-image-value').locator('img')
      await expect(newAvatar).toBeVisible()

      const profileSettingsImageSrc = await page.locator(
        '[popovertarget="ProfileMenu-Dropdown-Content"] img'
      )
      expect(profileSettingsImageSrc).toHaveAttribute(
        'src',
        (await newAvatar.getAttribute('src')) as string
      )

      // starts with ´/´ otherwise it does not render.
      await expect(newAvatar).toHaveAttribute('src', /^\//)
    })
  })
})
