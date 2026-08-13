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
import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import path from 'path'

test.describe.serial('1. Settings Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 Registrar Settings page', async () => {
    test('1.1.1 Navigate to settings page', async () => {
      await page.getByRole('button', { name: 'Profile' }).click()

      await page
        .locator('#ProfileMenu-Dropdown-Content')
        .waitFor({ state: 'visible' })

      await page.locator('li').filter({ hasText: 'Settings' }).click()
    })

    test('1.1.2 Validate content', async () => {
      // Target desktop view only, ignore mobile duplicates
      const desktopView = page.locator('[data-testid="list-view-value"]')

      // User details displayed
      await expect(
        desktopView.filter({ hasText: 'Kennedy Mweene' }).first()
      ).toBeVisible()
      await expect(
        desktopView.filter({ hasText: '0923232323' }).first()
      ).toBeVisible()
      await expect(
        desktopView.filter({ hasText: 'kalushabwa.lya17@gmail.com' }).first()
      ).toBeVisible()
      await expect(
        desktopView.filter({ hasText: 'Registrar' }).first()
      ).toBeVisible()
      await expect(
        desktopView.filter({ hasText: 'Ibombo District Office' }).first()
      ).toBeVisible()

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
        desktopView.getByRole('img', { name: 'Kennedy Mweene' }).first()
      ).toBeVisible()
    })

    test('1.1.3 Change avatar', async () => {
      await page.getByTestId('change-avatar').first().click()

      // Until a photo is uploaded the avatar renders initials, not an image.
      await expect(
        page.locator('[data-testid="list-view-value"] img')
      ).toHaveCount(0)

      const attachmentPath = path.join(__dirname, '../test-data/image.png')

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

      const newAvatar = page
        .locator('[data-testid="list-view-value"] img')
        .first()
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
