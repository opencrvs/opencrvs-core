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
import fs from 'fs'
import path from 'path'
import { expect, Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@opencrvs/toolkit/api'
import {
  continueForm,
  createPIN,
  getAuthTokens,
  getToken,
  login,
  loginWithNewUser,
  NEW_USER_PASSWORD,
  waitForAuthenticatedLanding
} from '@e2e/support/helpers'
import {
  AUTH_URL,
  CLIENT_URL,
  CREDENTIALS,
  GATEWAY_HOST,
  TEST_USER_PASSWORD
} from '@e2e/support/constants'
import { ASSETS_DIR } from '@e2e/support/paths'

export async function createRegistrarWithSignature(page: Page, office: string) {
  const firstName = faker.person.firstName('male')
  // The username is derived from the name, and a collision with an existing
  // user makes the server pick a different one - which the test then cannot
  // guess. The digits keep it unique.
  const surname = `${faker.person.lastName('male')}${faker.string.numeric(5)}`
  const username = `${firstName[0]}.${surname}`.toLowerCase()

  await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

  await page.getByRole('button', { name: 'Team' }).click()
  await expect(
    page.locator('#location-range-picker-action').getByText('HQ Office').first()
  ).toBeVisible()

  await page
    .getByRole('button', { name: /HQ Office/ })
    .first()
    .click()
  await page.getByTestId('locationSearchInput').fill(office)
  await page.getByText(new RegExp(office)).first().click()

  await page.locator('#add-user').first().click()
  await expect(page.getByText('User details')).toBeVisible()

  await page.locator('#surname').fill(surname)
  await page.locator('#firstname').fill(firstName)
  await page.locator('#email').fill(faker.internet.email().toLowerCase())
  await page.locator('#role').click()
  await page.getByText('Registrar', { exact: true }).click()
  await continueForm(page)

  await page.setInputFiles(
    'input[type="file"]',
    path.join(ASSETS_DIR, 'sign1.png')
  )
  await continueForm(page)

  await page.getByRole('button', { name: 'Create user' }).click()
  await expect(page.locator('#header')).toContainText(office)

  // Creating the user returns before the credentials are usable, and the
  // first-login flow has no retry of its own - it just fails to move past the
  // login page. Wait for the credentials to be accepted before driving it.
  await expect(async () => {
    const response = await fetch(`${AUTH_URL}/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: TEST_USER_PASSWORD })
    })

    expect(response.ok).toBeTruthy()
  }).toPass({
    timeout: 60_000,
    intervals: [...Array(5).fill(1_000), ...Array(5).fill(2_000), 5_000]
  })

  await loginWithNewUser(page, username)
  await page.goto(CLIENT_URL)

  // Whether the app asks for a PIN here depends on what the account setup
  // flow already stored for this browser context.
  const pinRequested = await page
    .locator('#pin-input')
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false)

  if (pinRequested) {
    await createPIN(page)
  }

  const { token } = await getAuthTokens(username, NEW_USER_PASSWORD)
  const userId = readUserId(token)

  await repairSignaturePath(userId)

  return {
    userId,
    username,
    password: NEW_USER_PASSWORD,
    fullName: `${firstName} ${surname}`
  }
}

function readUserId(token: string) {
  const { sub } = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString()
  )

  return sub as string
}

/**
 * Re-attaches the signature under the user's real id.
 *
 * A signature attached while creating a user is uploaded before the user
 * exists, so it lands under the temporary id the form was using -
 * `users/tmp-<uuid>/...` - and the stored path keeps that prefix. Nothing
 * serves such a path, so the signature renders as a broken image everywhere
 * except the browser that uploaded it, which still has it cached.
 */
async function repairSignaturePath(userId: string) {
  const adminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
  const signature = fs.readFileSync(path.join(ASSETS_DIR, 'sign1.png'))

  const form = new FormData()
  form.append(
    'file',
    new File([new Uint8Array(signature)], 'sign1.png', { type: 'image/png' })
  )
  form.append('transactionId', uuidv4())
  form.append('path', `users/${userId}`)

  const response = await fetch(new URL('/upload', GATEWAY_HOST), {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: form
  })

  if (!response.ok) {
    throw new Error(`Failed to upload the signature: ${response.statusText}`)
  }

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${adminToken}`)

  await client.user.update.mutate({
    id: userId,
    signature: {
      path: await response.text(),
      originalFilename: 'sign1.png',
      type: 'image/png'
    }
  })
}

/**
 * Logs in as a user created during the test run, which `login` cannot do -
 * it only knows the seeded credentials.
 */
export async function loginAsNewUser(
  page: Page,
  { username, password }: { username: string; password: string }
) {
  const { refreshToken } = await getAuthTokens(username, password)

  await waitForAuthenticatedLanding(page, refreshToken)
  await createPIN(page)
}
