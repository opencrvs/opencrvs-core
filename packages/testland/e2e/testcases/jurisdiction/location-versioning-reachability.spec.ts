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
import {
  getToken,
  getAuthTokens,
  createPIN,
  login,
  loginWithNewUser,
  continueForm,
  NEW_USER_PASSWORD
} from '../../helpers'
import { CREDENTIALS, CLIENT_URL } from '../../constants'
import {
  createDeclaration,
  getDeclaration
} from '../test-data/birth-declaration'
import {
  getAdministrativeAreas,
  getIdByName,
  formatV2ChildName,
  assertRecordInWorkqueue
} from '../birth/helpers'
import { fetchClientAPI } from '../events-rest-api/helpers'

/**
 * Verifies that jurisdiction/routing predicates keep resolving correctly as
 * locations are renamed, inactivated, or transferred.
 *
 * These specs create their own throwaway offices/users via the location
 * write API rather than mutating seeded Farajaland offices, because
 * renaming/inactivating a shared office (e.g. Ibombo District Office) would
 * be observed by every other spec running in parallel against the same
 * credentials.
 *
 * Not covered here yet, because the underlying behaviour isn't merged:
 * - form selector anchoring / search — whether an inactivated office
 *   disappears from *selectors* while staying filterable in advanced search.
 * - the error overlay for users in inactive offices — the "no
 *   auto-reassignment" check below only asserts today's behaviour (user
 *   keeps their office, can still log in); once that behaviour ships, the
 *   login step here may need an accompanying overlay assertion.
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

async function provisionUserInOffice(
  adminPage: Page,
  officeName: string,
  role: string
) {
  const firstName = faker.person.firstName('female')
  const surname = faker.person.lastName('female')
  const username = `${firstName[0]}.${surname}`.toLowerCase()
  const fullname = `${firstName} ${surname}`

  await adminPage.getByRole('button', { name: 'Team' }).click()
  await adminPage
    .getByRole('button', { name: /Office/ })
    .first()
    .click()
  await adminPage.getByTestId('locationSearchInput').fill(officeName)
  await adminPage.getByText(new RegExp(officeName)).first().click()

  await adminPage.click('#add-user')
  await expect(adminPage.getByText('User details')).toBeVisible()

  await adminPage.locator('#surname').fill(surname)
  await adminPage.locator('#firstname').fill(firstName)
  await adminPage.locator('#phoneNumber').fill('07' + faker.string.numeric(8))
  await adminPage.locator('#email').fill(faker.internet.email().toLowerCase())
  await adminPage.locator('#fullHonorificName').fill(fullname)
  await adminPage.locator('#role').click()
  await adminPage.getByText(role, { exact: true }).click()
  await adminPage.locator('#device').fill(faker.phone.imei())
  await continueForm(adminPage)

  await adminPage.getByRole('button', { name: 'Create user' }).click()
  await expect(adminPage.getByText('New user created')).toBeVisible()

  return { username, fullname }
}

// A provisioned user's password is NEW_USER_PASSWORD after loginWithNewUser,
// not the default TEST_USER_PASSWORD that `login()` assumes.
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

    const adminPage = await newPage(browser)
    await login(adminPage, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    const { username } = await provisionUserInOffice(
      adminPage,
      officeName,
      'Registration Officer'
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

    // A different registrar in the same administrative area (Ibombo) should
    // still resolve and see the record after the rename.
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

    const adminPage = await newPage(browser)
    await login(adminPage, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    const { username } = await provisionUserInOffice(
      adminPage,
      officeName,
      'Registration Officer'
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
      name: office.name,
      externalId: office.externalId,
      status: 'inactive',
      effectiveFrom: '2020-06-01',
      lastVersionId: office.versions[0].versionId
    })

    // The declaring user's own office is now inactive: they should still be
    // able to log in (no lockout) and still see/open their own record. A
    // Registration Officer's own DECLARE auto-validates, so the record moves
    // on to the registrar's queue and only remains in "Recent" for them.
    const ownUserPage = await newPage(browser)
    await loginAsProvisionedUser(ownUserPage, username)
    await assertRecordInWorkqueue({
      page: ownUserPage,
      name: childName,
      workqueues: [{ title: 'Recent', exists: true }]
    })

    // A different office in the SAME administrative area (Ibombo) should
    // also still see the record — office closure does not hide records from
    // the wider jurisdiction.
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

    const oldAdminPage = await newPage(browser)
    await login(oldAdminPage, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    const oldUser = await provisionUserInOffice(
      oldAdminPage,
      oldOfficeName,
      'Registration Officer'
    )

    const oldUserPage = await newPage(browser)
    await loginWithNewUser(oldUserPage, oldUser.username)
    const oldUserToken = await getToken(oldUser.username, NEW_USER_PASSWORD)

    const { declaration: oldDeclaration, eventId: oldEventId } =
      await createDeclaration(oldUserToken, undefined, ActionType.DECLARE)
    const oldChildName = formatV2ChildName(oldDeclaration as any)
    expect(oldEventId).toBeTruthy()

    // Transfer recipe: inactivate the old entity, create a successor under
    // the new parent — the two calls are independent and idempotent-retryable.
    await putLocationVersion(systemAdminToken, oldOffice.id, {
      name: oldOffice.name,
      externalId: oldOffice.externalId,
      status: 'inactive',
      effectiveFrom: '2020-06-01',
      lastVersionId: oldOffice.versions[0].versionId
    })

    // The "successor" side doesn't need a freshly provisioned office/user —
    // only the old entity has to be a throwaway we can safely inactivate.
    // The existing seeded Pualula credential is a different administrative
    // area than Ibombo, which is all this needs to demonstrate.
    const newUserToken = await getToken(
      CREDENTIALS.REGISTRATION_OFFICER_PUALULA
    )

    // record.search's placeOfEvent:'administrativeArea' scope means a Pualula
    // officer can only ever see records whose place of birth is also within
    // Pualula — getDeclaration()'s default place of birth ("Klow") is in
    // Ibombo, so it must be overridden here or the record is invisible to
    // this officer and any Pualula registrar, regardless of createdAtLocation.
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

    // Old record: still reachable to a registrar in the old (Ibombo) area.
    const ibomboRegistrarPage = await newPage(browser)
    await login(ibomboRegistrarPage, CREDENTIALS.REGISTRAR)
    await assertRecordInWorkqueue({
      page: ibomboRegistrarPage,
      name: oldChildName,
      workqueues: [{ title: 'Pending registration', exists: true }]
    })

    // New record: reachable to a registrar in the new (Pualula) area, and
    // NOT reachable to the old (Ibombo) area's registrar.
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

  test('User is not auto-reassigned when their office is inactivated', async ({
    browser
  }) => {
    // Provisions a user AND runs them through the full first-login ceremony
    // (password + security questions + PIN) — several fresh PWA bootstraps.
    test.setTimeout(180_000)

    const officeName = `E2E No-Reassign Office ${uuidv4()}`
    const office = await createOffice(
      systemAdminToken,
      ibomboAreaId,
      officeName
    )

    const adminPage = await newPage(browser)
    await login(adminPage, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    const { username, fullname } = await provisionUserInOffice(
      adminPage,
      officeName,
      'Registration Officer'
    )

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
    await expect(
      adminPage.getByTestId('primaryOfficeId-value')
    ).toContainText(officeName)

    // The user themselves can still log in — no forced lockout as a
    // side-effect of their office becoming inactive. A brand-new account is
    // still 'pending' until it completes the first-login ceremony, so that
    // has to happen once before a normal refreshToken-based login will work.
    const firstLoginPage = await newPage(browser)
    await loginWithNewUser(firstLoginPage, username)

    const ownUserPage = await newPage(browser)
    await loginAsProvisionedUser(ownUserPage, username)
    // Default 5s isn't always enough for the PWA's own bootstrap after login.
    await expect(
      ownUserPage.getByRole('button', { name: 'Recent' })
    ).toBeVisible({ timeout: 30_000 })
  })

  test('Inactivating an office keeps its Notified records reachable to the same administrative area', async ({
    browser
  }) => {
    // A full office+user provisioning cycle plus the first-login ceremony —
    // same weight class as the other provisioning-heavy tests in this file.
    test.setTimeout(180_000)

    const officeName = `E2E Notify Office ${uuidv4()}`
    const office = await createOffice(
      systemAdminToken,
      ibomboAreaId,
      officeName
    )

    // Community Leader has record.notify but not record.declare — its own
    // workqueue scope is only ['assigned-to-you', 'recent'], so unlike the
    // Registration Officer tests, there is no bucket for it to review its own
    // notification in; the reachability check below has to come from a
    // registrar instead.
    const adminPage = await newPage(browser)
    await login(adminPage, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    const { username } = await provisionUserInOffice(
      adminPage,
      officeName,
      'Community Leader'
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

    await putLocationVersion(systemAdminToken, office.id, {
      name: office.name,
      externalId: office.externalId,
      status: 'inactive',
      effectiveFrom: '2020-06-01',
      lastVersionId: office.versions[0].versionId
    })

    // The notifying user's own view: "Recent" is the only bucket in their
    // scope, and has no location dependency, so this only confirms no
    // lockout — the real reachability check is the registrar below.
    const ownUserPage = await newPage(browser)
    await loginAsProvisionedUser(ownUserPage, username)
    // Default 5s isn't always enough for the PWA's own bootstrap after login.
    await expect(
      ownUserPage.getByRole('button', { name: 'Recent' })
    ).toBeVisible({ timeout: 30_000 })

    // A registrar in the same administrative area (Ibombo) — a different
    // office entirely — should still see the notification in the
    // "Notifications" workqueue despite the notifying office being inactive.
    const registrarPage = await newPage(browser)
    await login(registrarPage, CREDENTIALS.REGISTRAR)
    await assertRecordInWorkqueue({
      page: registrarPage,
      name: childName,
      workqueues: [{ title: 'Notifications', exists: true }]
    })
  })
})
