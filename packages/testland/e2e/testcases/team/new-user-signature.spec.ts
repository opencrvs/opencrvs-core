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
import path from 'path'
import { test, expect, type Response } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import { continueForm, getToken, login } from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { ASSETS_DIR } from '@e2e/support/paths'

const OFFICE = 'Ibombo District Office'

async function readCreatedUserId(response: Response): Promise<string> {
  const body = await response.json()
  const [first] = Array.isArray(body) ? body : [body]
  const data = first.result.data
  return (data.json ?? data).id
}

test('A signature attached while creating a user is shown to other sessions', async ({
  page,
  browser
}) => {
  const name = {
    firstname: faker.person.firstName('male'),
    surname: `${faker.person.lastName('male')}${faker.string.numeric(5)}`
  }
  let userId = ''

  await test.step('National system admin creates a Registrar with a signature', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

    await page.getByRole('button', { name: 'Team' }).click()
    await expect(
      page
        .locator('#location-range-picker-action')
        .getByText('HQ Office')
        .first()
    ).toBeVisible()
    await page
      .getByRole('button', { name: /HQ Office/ })
      .first()
      .click()
    await page.getByTestId('locationSearchInput').fill(OFFICE)
    await page.getByText(new RegExp(OFFICE)).first().click()

    await page.locator('#add-user').first().click()
    await expect(page.getByText('User details')).toBeVisible()

    await page.locator('#surname').fill(name.surname)
    await page.locator('#firstname').fill(name.firstname)
    await page.locator('#email').fill(faker.internet.email().toLowerCase())
    await page.locator('#role').click()
    await page.getByText('Registrar', { exact: true }).click()
    await continueForm(page)

    await page.setInputFiles(
      'input[type="file"]',
      path.join(ASSETS_DIR, 'sign1.png')
    )
    await continueForm(page)

    const createResponse = page.waitForResponse(
      (res) => res.url().includes('user.create') && res.ok()
    )
    await page.getByRole('button', { name: 'Create user' }).click()
    userId = await readCreatedUserId(await createResponse)

    await expect(page.locator('#header')).toContainText(OFFICE)
  })

  await test.step('The signature file is stored under the real user id', async () => {
    const token = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

    const user = await client.user.get.query(userId)
    const signature = 'signature' in user ? user.signature : undefined

    expect(signature).toBeTruthy()
    expect.soft(signature).not.toContain('tmp-')

    const { presignedURL } = await client.event.file.getPresignedUrl.query({
      filePath: signature!
    })
    const file = await fetch(presignedURL)

    expect.soft(file.status).toBe(200)
  })

  await test.step('Another session sees the signature on the user review page', async () => {
    const otherPage = await browser.newPage()
    await login(otherPage, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

    await otherPage.goto(`${CLIENT_URL}/settings/users/${userId}/review`)

    const signatureImage = otherPage.getByRole('img', {
      name: 'Signature preview'
    })
    await expect(signatureImage).toBeVisible()

    await expect
      .poll(async () =>
        signatureImage.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
        )
      )
      .toBe(true)

    await otherPage.close()
  })
})
