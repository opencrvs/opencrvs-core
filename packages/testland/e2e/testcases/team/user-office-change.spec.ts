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
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { faker } from '@faker-js/faker'
import { CLIENT_URL, CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import {
  createPIN,
  drawSignature,
  getAuthTokens,
  getToken,
  login,
  loginWithNewUser,
  logout,
  NEW_USER_PASSWORD,
  searchFromSearchBar,
  waitForAuthenticatedLanding
} from '@e2e/support/helpers'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration'
import {
  fillChildDetails,
  formatV2ChildName,
  getIdByName,
  getLocations,
  openBirthDeclaration
} from '@e2e/support/birth/helpers'

const createDraft = async (page: Page) => {
  await page.goto(CLIENT_URL)
  await openBirthDeclaration(page)

  const childName = await fillChildDetails(page)
  const draftResponse = page.waitForResponse(
    (res) => res.url().includes('event.draft.create') && res.ok()
  )

  await page.getByRole('button', { name: 'Save & Exit' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await draftResponse
  await page.getByRole('button', { name: 'Drafts' }).click()
  await expect(
    page.getByRole('button', { name: childName, exact: true })
  ).toBeVisible()

  return childName
}

const countDraftRows = async (page: Page, expectedCount?: number) => {
  await page.getByRole('button', { name: 'Drafts' }).click()
  await expect(page.getByTestId('search-result')).toContainText('Drafts')

  const rows = page.locator('[id^="row_"]')

  if (typeof expectedCount === 'number') {
    await expect(rows).toHaveCount(expectedCount)
  }

  return rows.count()
}

const expectVersionCard = async (
  page: Page,
  fullName: string,
  role: string,
  office: string
) => {
  await expect(page.locator('span').filter({ hasText: fullName })).toBeVisible()
  await expect(
    page.getByText(`${role} • ${office}`, { exact: true })
  ).toBeVisible()
  await expect(page.getByText('Online', { exact: true })).toBeVisible()
  await expect(page.getByText('OpenCRVS v2.1.0', { exact: true })).toBeVisible()
}

test('Scope changes after office change - user loses access when the office changes', async ({
  browser
}) => {
  test.setTimeout(180_000)

  const page = await browser.newPage()
  let username = ''
  let fullName = ''
  let childName = ''
  let trackingId = ''
  let eventId = ''
  let draftCountBeforeChange = 0

  await test.step('Create a new registrar user and set up initial record and drafts', async () => {
    const adminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${adminToken}`
    )

    const name = {
      firstname: faker.person.firstName(),
      // Append random chars to ensure username is unique
      surname: `${faker.person.lastName()}${faker.string.alphanumeric(6)}`
    }

    fullName = `${name.firstname} ${name.surname}`
    username = `${name.firstname[0]}.${name.surname}`
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '')

    const offices = await getLocations('CRVS_OFFICE', adminToken)
    const ibomboDistrictOfficeId = getIdByName(
      offices,
      'Ibombo District Office'
    )

    await client.user.create.mutate({
      name,
      role: 'LOCAL_REGISTRAR',
      primaryOfficeId: ibomboDistrictOfficeId,
      mobile: `07${faker.string.numeric(8)}`,
      email: faker.internet.email(),
      fullHonorificName: fullName,
      device: 'web',
      data: {}
    })

    await loginWithNewUser(page, username)

    const { token, refreshToken } = await getAuthTokens(
      username,
      NEW_USER_PASSWORD
    )

    await waitForAuthenticatedLanding(page, refreshToken)
    await createPIN(page)
    await page.goto(CLIENT_URL)

    const declaration = await createDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )

    trackingId = declaration.trackingId!
    eventId = declaration.eventId
    childName = formatV2ChildName(declaration.declaration)

    await searchFromSearchBar(page, childName, true)
    await expect(page.getByTestId('tracking-id-value')).toContainText(
      trackingId
    )

    const draftNames: string[] = []
    for (let i = 0; i < 3; i++) {
      draftNames.push(await createDraft(page))
    }

    draftCountBeforeChange = await countDraftRows(page, draftNames.length)
    expect(draftCountBeforeChange).toBe(draftNames.length)

    for (const draftName of draftNames) {
      await expect(
        page.getByRole('button', { name: draftName, exact: true })
      ).toBeVisible()
    }
  })

  await test.step('Local administrator moves the user to Isamba District Office', async () => {
    await logout(page)
    await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)

    await page.getByRole('button', { name: 'Organisation' }).click()
    await page.getByRole('button', { name: 'Central' }).click()
    await page.getByRole('button', { name: 'Ibombo', exact: true }).click()
    await page.getByRole('button', { name: 'Ibombo District Office' }).click()
    await expect(page.locator('#content-name')).toHaveText(
      'Ibombo District Office'
    )

    await page.getByRole('button', { name: fullName }).click()
    await expect(page.locator('#content-name')).toHaveText(fullName)

    await page.locator('#sub-page-header-munu-button-dropdownMenu').click()
    await page.getByText('Edit details').click()
    await expect(page.getByText('Confirm details')).toBeVisible()

    await page.getByTestId('change-button-primaryOfficeId').click()
    await page.locator('#searchable-select-primaryOfficeId').click()
    await page.locator('#primaryOfficeId').fill('Isamba')
    await page.getByText('Isamba District Office').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#role').click()
    await page.locator('#react-select-2-option-1').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    const signButton = page.getByRole('button', { name: 'Sign', exact: true })
    if (await signButton.isVisible()) {
      await signButton.click()
      await drawSignature(page, 'signature_canvas_element', false)
      await page.getByRole('button', { name: 'Apply' }).click()
    }

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.getByTestId('confirm_office_change').click()

    await expect(page.getByTestId('office-link-value')).toHaveText(
      'Isamba District Office'
    )

    await logout(page)
  })

  await test.step('User can no longer find the record or drafts after the office change', async () => {
    const { refreshToken } = await getAuthTokens(username, NEW_USER_PASSWORD)
    expect(refreshToken).toBeDefined()

    await waitForAuthenticatedLanding(page, refreshToken)

    await searchFromSearchBar(page, trackingId, false)
    await expect(
      page.getByRole('button', { name: trackingId, exact: true })
    ).not.toBeVisible()

    await page.goto(CLIENT_URL)
    const draftCountAfterChange = await countDraftRows(page, 0)
    expect(draftCountAfterChange).toBe(0)
    expect(draftCountBeforeChange).toBeGreaterThan(0)

    await page.goto(`${CLIENT_URL}/events/${eventId}`)
    await expect(
      page.getByText(`No event or draft found with id: ${eventId}`)
    ).toBeVisible()
  })
})

test('Scope changes after office and role changes', async ({ browser }) => {
  test.setTimeout(180_000)

  const page = await browser.newPage()
  let username = ''
  let fullName = ''
  let childName = ''
  let trackingId = ''
  let eventId = ''
  let draftCountBeforeChange = 0

  await test.step('Create a new registrar user and set up initial record and drafts', async () => {
    const adminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${adminToken}`
    )

    const name = {
      firstname: faker.person.firstName(),
      // Append random chars to ensure username is unique
      surname: `${faker.person.lastName()}${faker.string.alphanumeric(6)}`
    }

    fullName = `${name.firstname} ${name.surname}`
    username = `${name.firstname[0]}.${name.surname}`
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '')

    const offices = await getLocations('CRVS_OFFICE', adminToken)
    const ibomboDistrictOfficeId = getIdByName(
      offices,
      'Ibombo District Office'
    )

    await client.user.create.mutate({
      name,
      role: 'LOCAL_REGISTRAR',
      primaryOfficeId: ibomboDistrictOfficeId,
      mobile: `07${faker.string.numeric(8)}`,
      email: faker.internet.email(),
      fullHonorificName: fullName,
      device: 'web',
      data: {}
    })

    await loginWithNewUser(page, username)

    const { token, refreshToken } = await getAuthTokens(
      username,
      NEW_USER_PASSWORD
    )

    await waitForAuthenticatedLanding(page, refreshToken)

    await createPIN(page)
    await page.goto(CLIENT_URL)

    const declaration = await createDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )

    trackingId = declaration.trackingId!
    eventId = declaration.eventId
    childName = formatV2ChildName(declaration.declaration)

    await searchFromSearchBar(page, childName, true)
    await expect(page.getByTestId('tracking-id-value')).toContainText(
      trackingId
    )

    const draftNames: string[] = []
    for (let i = 0; i < 3; i++) {
      draftNames.push(await createDraft(page))
    }

    await expectVersionCard(
      page,
      fullName,
      'Registrar',
      'Ibombo District Office'
    )

    draftCountBeforeChange = await countDraftRows(page, draftNames.length)
    await expect(draftCountBeforeChange).toBe(draftNames.length)

    for (const draftName of draftNames) {
      await expect(
        page.getByRole('button', { name: draftName, exact: true })
      ).toBeVisible()
    }

    await logout(page)
  })

  await test.step('Administrator moves the user to Isamba District Office and Hospital Official', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

    await page.getByRole('button', { name: 'Organisation' }).click()
    await page.getByRole('button', { name: 'Central' }).click()
    await page.getByRole('button', { name: 'Ibombo', exact: true }).click()
    await page.getByRole('button', { name: 'Ibombo District Office' }).click()
    await expect(page.locator('#content-name')).toHaveText(
      'Ibombo District Office'
    )

    await page.getByRole('button', { name: fullName }).click()
    await expect(page.locator('#content-name')).toHaveText(fullName)

    await page.locator('#sub-page-header-munu-button-dropdownMenu').click()
    await page.getByText('Edit details').click()
    await expect(page.getByText('Confirm details')).toBeVisible()

    await page.getByTestId('change-button-primaryOfficeId').click()
    await page.locator('#searchable-select-primaryOfficeId').click()
    await page.locator('#primaryOfficeId').fill('Isamba')
    await page.getByText('Isamba District Office').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#role').click()
    await page.getByText('Hospital Official', { exact: true }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByTestId('primaryOfficeId-value')).toHaveText(
      'Isamba District Office, Isamba, Central, Farajaland'
    )
    await expect(page.getByTestId('role-value')).toHaveText('Hospital Official')

    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.getByTestId('confirm_office_change').click()

    await expect(page.getByTestId('office-link-value')).toHaveText(
      'Isamba District Office'
    )
    await expect(
      page.getByText('Hospital Official', { exact: true })
    ).toBeVisible()

    await logout(page)
  })

  await test.step('User can no longer find the record or drafts after the office and role change', async () => {
    const { refreshToken } = await getAuthTokens(username, NEW_USER_PASSWORD)
    expect(refreshToken).toBeDefined()

    await waitForAuthenticatedLanding(page, refreshToken)

    await searchFromSearchBar(page, trackingId, false)
    await expect(
      page.getByRole('button', { name: trackingId, exact: true })
    ).not.toBeVisible()

    await page.goto(CLIENT_URL)

    await expectVersionCard(
      page,
      fullName,
      'Hospital Official',
      'Isamba District Office'
    )

    const draftCountAfterChange = await countDraftRows(page, 0)
    expect(draftCountAfterChange).toBe(0)
    expect(draftCountBeforeChange).toBeGreaterThan(0)

    await page.goto(`${CLIENT_URL}/events/${eventId}`)
    await expect(
      page.getByText(`No event or draft found with id: ${eventId}`)
    ).toBeVisible()
  })
})
