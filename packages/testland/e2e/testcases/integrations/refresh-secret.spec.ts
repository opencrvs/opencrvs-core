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
import { format } from 'date-fns'
import { createClient } from '@opencrvs/toolkit/api'
import { getClientToken, getToken, login } from '@e2e/support/helpers'
import { CLIENT_URL, CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { INTEGRATION_SCOPES } from '@e2e/support/events-rest-api/helpers'

/**
 * Whether a client_id / client_secret pair still authenticates against the
 * gateway. Refreshing the secret must make the old pair stop working and the
 * new one start.
 */
async function clientSecretWorks(clientId: string, clientSecret: string) {
  try {
    return Boolean(await getClientToken(clientId, clientSecret))
  } catch {
    return false
  }
}

/** Opens the row's action menu and picks "Refresh secret". */
async function openRefreshSecretDialog(page: Page, clientName: string) {
  const row = page.getByRole('row').filter({ hasText: clientName })
  await row.getByRole('button').first().click()
  await row.getByText('Refresh secret', { exact: true }).click()
}

test('Refresh an integration client secret', async ({ page }) => {
  const clientName = `Refresh secret ${format(new Date(), 'dd.MM. HH:mm:ss')}`

  let clientId = ''
  let originalSecret = ''

  await test.step('create an integration and confirm its secret authenticates', async () => {
    const systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const integrationClient = createClient(
      `${GATEWAY_HOST}/events`,
      `Bearer ${systemAdminToken}`
    )
    const integration = await integrationClient.integrations.create.mutate({
      name: clientName,
      scopes: INTEGRATION_SCOPES
    })
    clientId = integration.clientId
    originalSecret = integration.clientSecret

    expect(await clientSecretWorks(clientId, originalSecret)).toBe(true)
  })

  await test.step('open the integrations page as a national system admin', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    await page.goto(`${CLIENT_URL}/config/integration`)
    await expect(page.locator('#content-name')).toHaveText('Integrations')
    await expect(
      page.getByRole('row').filter({ hasText: clientName })
    ).toBeVisible()
  })

  await test.step('cancelling the confirmation leaves the current secret in place', async () => {
    await openRefreshSecretDialog(page, clientName)

    // Title names the action, subtitle names the integration, and the warning shows.
    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Refresh secret' })
    ).toBeVisible()
    await expect(dialog.getByText(clientName)).toBeVisible()
    await expect(
      dialog.getByText(/The integration will stop working/)
    ).toBeVisible()

    await page.locator('#cancelRefreshSecret').click()
    await expect(page.locator('#confirmRefreshSecret')).toBeHidden()
    expect(await clientSecretWorks(clientId, originalSecret)).toBe(true)
  })

  let newSecret = ''

  await test.step('confirming generates and reveals a new secret', async () => {
    await openRefreshSecretDialog(page, clientName)
    await page.locator('#confirmRefreshSecret').click()

    const revealedSecret = page.locator('#refreshedClientSecret')
    await expect(revealedSecret).toBeVisible({ timeout: 30_000 })

    newSecret = (await revealedSecret.textContent())?.trim() ?? ''
    expect(newSecret).not.toBe('')
    expect(newSecret).not.toBe(originalSecret)
  })

  await test.step('the new secret authenticates while the old one no longer does', async () => {
    expect(await clientSecretWorks(clientId, newSecret)).toBe(true)
    expect(await clientSecretWorks(clientId, originalSecret)).toBe(false)
  })
})
