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
import { test, expect, type Browser, type Page } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import { ActionType, AddressType } from '@opencrvs/toolkit/events'
import { createClient } from '@opencrvs/toolkit/api'
import {
  getToken,
  getAuthTokens,
  createPIN,
  login,
  loginWithNewUser,
  ensureLoginPageReady,
  NEW_USER_PASSWORD
} from '@e2e/support/helpers'
import {
  CREDENTIALS,
  CLIENT_URL,
  LOGIN_URL,
  GATEWAY_HOST
} from '@e2e/support/constants'
import {
  createDeclaration,
  getDeclaration
} from '@e2e/support/test-data/birth-declaration'
import {
  getAdministrativeAreas,
  getIdByName,
  formatV2ChildName,
  assertRecordInWorkqueue
} from '@e2e/support/birth/helpers'
import { fetchClientAPI } from '@e2e/support/events-rest-api/helpers'

/**
 * Verifies jurisdiction/routing predicates as locations are renamed,
 * inactivated, or transferred.
 *
 * Uses throwaway offices/users via the location write API instead of
 * mutating seeded Farajaland offices, since those are shared across
 * parallel specs.
 *
 * Login is blocked for a user whose office is inactive, so tests needing an
 * authenticated session for such a user log in *before* inactivating.
 *
 * Not covered here: selector anchoring/search for inactive offices, and the
 * client's polled "office went inactive" overlay for already-logged-in users.
 */

async function createOffice(
  systemAdminToken: string,
  administrativeAreaId: string,
  name: string
) {
  const payload = {
    id: uuidv4(),
    name,
    externalId: `e2e-${uuidv4()}`,
    administrativeAreaId,
    locationType: 'CRVS_OFFICE'
  }

  const response = await fetchClientAPI(
    '/api/events/locations',
    'POST',
    systemAdminToken,
    payload
  )
  expect(response.status).toBe(200)
  return response.json()
}

async function putLocationVersion(
  systemAdminToken: string,
  locationId: string,
  body: {
    name: string
    externalId: string | null
    status: 'active' | 'inactive'
    effectiveFrom: string
    lastVersionId: string
  }
) {
  const response = await fetchClientAPI(
    `/api/events/locations/${locationId}`,
    'PUT',
    systemAdminToken,
    body
  )
  expect(response.status).toBe(200)
  return response.json()
}

// `role` is the API role id (e.g. 'REGISTRATION_AGENT'), not the display label.
async function provisionUserInOffice(
  systemAdminToken: string,
  officeId: string,
  role: string
) {
  const firstname = faker.person.firstName('female')
  const surname = faker.person.lastName('female')
  const username = `${firstname[0]}.${surname}`.toLowerCase()
  const fullname = `${firstname} ${surname}`

  const client = createClient(
    GATEWAY_HOST + '/events',
    `Bearer ${systemAdminToken}`
  )
  await client.user.create.mutate({
    name: { firstname, surname },
    role,
    primaryOfficeId: officeId,
    mobile: '07' + faker.string.numeric(8),
    email: faker.internet.email().toLowerCase(),
    fullHonorificName: fullname,
    device: faker.phone.imei(),
    data: {}
  })

  return { username, fullname }
}

// Password is NEW_USER_PASSWORD post-loginWithNewUser, not `login()`'s default.
async function loginAsProvisionedUser(page: Page, username: string) {
  const { refreshToken } = await getAuthTokens(username, NEW_USER_PASSWORD)
  expect(refreshToken).toBeDefined()
  await page.goto(`${CLIENT_URL}?refreshToken=${refreshToken}`)
  await page.waitForSelector('#pin-input, #appSpinner', { state: 'visible' })
  await createPIN(page)
  await page.goto(CLIENT_URL)
}

test.describe('Jurisdiction & routing under location versioning', () => {
  let systemAdminToken: string
  let ibomboAreaId: string
  let openPages: Page[] = []

  async function newPage(browser: Browser) {
    const page = await browser.newPage()
    openPages.push(page)
    return page
  }

  test.beforeAll(async () => {
    systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    const administrativeAreas = await getAdministrativeAreas(systemAdminToken)
    ibomboAreaId = getIdByName(administrativeAreas, 'Ibombo')
  })

  // Extra pages from newPage() don't auto-close and pile up across this serial run.
  test.afterEach(async () => {
    await Promise.all(openPages.map((page) => page.close().catch(() => {})))
    openPages = []
  })

  test('Rename does not affect record reachability', async ({ browser }) => {
    const officeName = `E2E Rename Office ${uuidv4()}`
    const office = await createOffice(
      systemAdminToken,
      ibomboAreaId,
      officeName
    )

    const { username } = await provisionUserInOffice(
      systemAdminToken,
      office.id,
      'REGISTRATION_AGENT'
    )

    const userPage = await newPage(browser)
    await loginWithNewUser(userPage, username)
    const userToken = await getToken(username, NEW_USER_PASSWORD)

    const { declaration, eventId } = await createDeclaration(
      userToken,
      undefined,
      ActionType.DECLARE
    )
    const childName = formatV2ChildName(declaration as any)
    expect(eventId).toBeTruthy()

    await putLocationVersion(systemAdminToken, office.id, {
      name: 'Renamed Office After Go-Live',
      externalId: office.externalId,
      status: 'active',
      effectiveFrom: '2020-06-01',
      lastVersionId: office.versions[0].versionId
    })

    // A different Ibombo registrar should still resolve the record post-rename.
    const registrarPage = await newPage(browser)
    await login(registrarPage, CREDENTIALS.REGISTRAR)
    await assertRecordInWorkqueue({
      page: registrarPage,
      name: childName,
      workqueues: [{ title: 'Pending registration', exists: true }]
    })
  })

  test('Inactivating an office keeps its Notified/Declared records reachable and processable to the same administrative area', async ({
    browser
  }) => {
    test.setTimeout(180_000) // full office+user provisioning cycle plus first-login ceremony
    const officeName = `E2E Inactivate Office ${uuidv4()}`
    const office = await createOffice(
      systemAdminToken,
      ibomboAreaId,
      officeName
    )

    const { username } = await provisionUserInOffice(
      systemAdminToken,
      office.id,
      'REGISTRATION_AGENT'
    )

    const userPage = await newPage(browser)
    await loginWithNewUser(userPage, username)
    const userToken = await getToken(username, NEW_USER_PASSWORD)

    const { declaration, eventId } = await createDeclaration(
      userToken,
      undefined,
      ActionType.DECLARE
    )
    const childName = formatV2ChildName(declaration as any)
    expect(eventId).toBeTruthy()

    // Log in before inactivating — fresh logins for an inactive office are
    // blocked. Waiting for "Recent" also confirms the client's office-status
    // check cached "active" before inactivation, avoiding a race.
    const ownUserPage = await newPage(browser)
    await loginAsProvisionedUser(ownUserPage, username)
    await expect(
      ownUserPage.getByRole('button', { name: 'Recent' })
    ).toBeVisible({ timeout: 30_000 })

    await putLocationVersion(systemAdminToken, office.id, {
      name: office.name,
      externalId: office.externalId,
      status: 'inactive',
      effectiveFrom: '2020-06-01',
      lastVersionId: office.versions[0].versionId
    })

    // Their session should still see the record. A Registration Officer's
    // own DECLARE auto-validates, so it moves to the registrar's queue and
    // only remains in "Recent" here.
    await assertRecordInWorkqueue({
      page: ownUserPage,
      name: childName,
      workqueues: [{ title: 'Recent', exists: true }]
    })

    // Office closure shouldn't hide the record from the wider jurisdiction.
    const registrarPage = await newPage(browser)
    await login(registrarPage, CREDENTIALS.REGISTRAR)
    await assertRecordInWorkqueue({
      page: registrarPage,
      name: childName,
      workqueues: [{ title: 'Pending registration', exists: true }]
    })
  })

  test('Transfer (inactivate-old + create-new) keeps old records under the old entity and routes new records to the new entity', async ({
    browser
  }) => {
    test.setTimeout(180_000)
    const oldOfficeName = `E2E Transfer Old Office ${uuidv4()}`
    const oldOffice = await createOffice(
      systemAdminToken,
      ibomboAreaId,
      oldOfficeName
    )

    const oldUser = await provisionUserInOffice(
      systemAdminToken,
      oldOffice.id,
      'REGISTRATION_AGENT'
    )

    const oldUserPage = await newPage(browser)
    await loginWithNewUser(oldUserPage, oldUser.username)
    const oldUserToken = await getToken(oldUser.username, NEW_USER_PASSWORD)

    const { declaration: oldDeclaration, eventId: oldEventId } =
      await createDeclaration(oldUserToken, undefined, ActionType.DECLARE)
    const oldChildName = formatV2ChildName(oldDeclaration as any)
    expect(oldEventId).toBeTruthy()

    // Transfer recipe: inactivate the old entity, create a successor separately.
    await putLocationVersion(systemAdminToken, oldOffice.id, {
      name: oldOffice.name,
      externalId: oldOffice.externalId,
      status: 'inactive',
      effectiveFrom: '2020-06-01',
      lastVersionId: oldOffice.versions[0].versionId
    })

    // The successor side reuses the seeded Pualula credential — only the old
    // entity needs to be a throwaway we can safely inactivate.
    const newUserToken = await getToken(
      CREDENTIALS.REGISTRATION_OFFICER_PUALULA
    )

    // record.search scopes by placeOfEvent — default place of birth ("Klow")
    // is in Ibombo, so it must be overridden or the record is invisible here.
    const pualulaAreas = await getAdministrativeAreas(newUserToken)
    const oyaVillageId = getIdByName(pualulaAreas, 'Oya')
    const newDeclarationData = await getDeclaration({
      token: newUserToken,
      partialDeclaration: {
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.birthLocation.privateHome': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: oyaVillageId
        },
        'child.birthLocationId': oyaVillageId
      }
    })
    const { declaration: newDeclaration, eventId: newEventId } =
      await createDeclaration(
        newUserToken,
        newDeclarationData,
        ActionType.DECLARE
      )
    const newChildName = formatV2ChildName(newDeclaration as any)
    expect(newEventId).toBeTruthy()

    // Old record still reachable to an Ibombo registrar.
    const ibomboRegistrarPage = await newPage(browser)
    await login(ibomboRegistrarPage, CREDENTIALS.REGISTRAR)
    await assertRecordInWorkqueue({
      page: ibomboRegistrarPage,
      name: oldChildName,
      workqueues: [{ title: 'Pending registration', exists: true }]
    })

    // New record reachable to a Pualula registrar, not to the old Ibombo one.
    const pualulaRegistrarPage = await newPage(browser)
    await login(pualulaRegistrarPage, CREDENTIALS.REGISTRAR_PUALULA)
    await assertRecordInWorkqueue({
      page: pualulaRegistrarPage,
      name: newChildName,
      workqueues: [{ title: 'Pending registration', exists: true }]
    })
    await assertRecordInWorkqueue({
      page: ibomboRegistrarPage,
      name: newChildName,
      workqueues: [{ title: 'Pending registration', exists: false }]
    })
  })

  test('User is not auto-reassigned but is locked out from login when their office is inactivated', async ({
    browser
  }) => {
    test.setTimeout(180_000)

    const officeName = `E2E No-Reassign Office ${uuidv4()}`
    const office = await createOffice(
      systemAdminToken,
      ibomboAreaId,
      officeName
    )

    const { username, fullname } = await provisionUserInOffice(
      systemAdminToken,
      office.id,
      'REGISTRATION_AGENT'
    )

    // The office picker excludes inactive offices from search, so select it
    // before inactivating (see Team.OfficeActiveOnly.interaction.stories.tsx).
    const adminPage = await newPage(browser)
    await login(adminPage, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    await adminPage.getByRole('button', { name: 'Team' }).click()
    await adminPage
      .getByRole('button', { name: /Office/ })
      .first()
      .click()
    await adminPage.getByTestId('locationSearchInput').fill(officeName)
    await adminPage.getByText(new RegExp(officeName)).first().click()

    await putLocationVersion(systemAdminToken, office.id, {
      name: office.name,
      externalId: office.externalId,
      status: 'inactive',
      effectiveFrom: '2020-06-01',
      lastVersionId: office.versions[0].versionId
    })

    // Existing user-management reassignment is a manual, separate action —
    // inactivating the office must not silently move this user elsewhere.
    await adminPage.reload()
    await adminPage.getByRole('button', { name: fullname }).click()
    await adminPage.locator('#sub-page-header-munu-button-dropdownMenu').click()
    await adminPage.getByText('Edit details').click()
    await expect(adminPage.getByTestId('primaryOfficeId-value')).toContainText(
      officeName
    )

    // The office check runs before user status, so even a still-'pending'
    // account is locked out at first login rather than reaching the ceremony.
    const firstLoginPage = await newPage(browser)
    await firstLoginPage.goto(LOGIN_URL)
    await ensureLoginPageReady(firstLoginPage)
    await firstLoginPage.fill('#username', username)
    await firstLoginPage.fill('#password', 'test')
    await firstLoginPage.click('#login-mobile-submit')
    await expect(
      firstLoginPage.getByText(
        'Your assigned office has been made inactive. Please contact your administrator to be reassigned'
      )
    ).toBeVisible()
  })

  test('Inactivating an office keeps its Notified records reachable to the same administrative area', async ({
    browser
  }) => {
    test.setTimeout(180_000) // office+user provisioning plus first-login ceremony

    const officeName = `E2E Notify Office ${uuidv4()}`
    const office = await createOffice(
      systemAdminToken,
      ibomboAreaId,
      officeName
    )

    // Community Leader lacks record.declare, so it has no bucket to review
    // its own notification in — the reachability check comes from a registrar.
    const { username } = await provisionUserInOffice(
      systemAdminToken,
      office.id,
      'COMMUNITY_LEADER'
    )

    const firstLoginPage = await newPage(browser)
    await loginWithNewUser(firstLoginPage, username)
    const userToken = await getToken(username, NEW_USER_PASSWORD)

    const { declaration, eventId } = await createDeclaration(
      userToken,
      undefined,
      ActionType.NOTIFY
    )
    const childName = formatV2ChildName(declaration as any)
    expect(eventId).toBeTruthy()

    // Log in before inactivating (see the earlier test for why).
    const ownUserPage = await newPage(browser)
    await loginAsProvisionedUser(ownUserPage, username)
    await expect(
      ownUserPage.getByRole('button', { name: 'Recent' })
    ).toBeVisible({ timeout: 30_000 })

    await putLocationVersion(systemAdminToken, office.id, {
      name: office.name,
      externalId: office.externalId,
      status: 'inactive',
      effectiveFrom: '2020-06-01',
      lastVersionId: office.versions[0].versionId
    })

    // Re-confirms the notifier's own session still works post-inactivation;
    // the real reachability check is the registrar below.
    await expect(
      ownUserPage.getByRole('button', { name: 'Recent' })
    ).toBeVisible({ timeout: 30_000 })

    // An Ibombo registrar (different office) should still see the notification.
    const registrarPage = await newPage(browser)
    await login(registrarPage, CREDENTIALS.REGISTRAR)
    await assertRecordInWorkqueue({
      page: registrarPage,
      name: childName,
      workqueues: [{ title: 'Notifications', exists: true }]
    })
  })
})
