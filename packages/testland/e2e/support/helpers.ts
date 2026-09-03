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
import { Locator, Page, expect } from '@playwright/test'
import {
  AUTH_URL,
  CLIENT_URL,
  CREDENTIALS,
  GATEWAY_HOST,
  LOGIN_URL,
  SAFE_INPUT_CHANGE_TIMEOUT_MS,
  TEST_USER_PASSWORD
} from './constants'
import { format, parseISO } from 'date-fns'
import { random } from 'lodash'
import fetch from 'node-fetch'
import { isMobile } from './mobile-helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { UUID } from 'crypto'
import { faker } from '@faker-js/faker'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'

export async function createPIN(page: Page) {
  await page.click('#pin-input')
  for (let i = 1; i <= 8; i++) {
    await page.type('#pin-input', `${i % 2}`)
  }
}

/**
 * Waits for url change after "client login" url. User is directed to client app page with different url,
 * or if retrieving token fails, the client redirects to the separate login app — detecting
 * that directly surfaces a clear failure immediately
 */
export async function waitForAuthenticatedLanding(
  page: Page,
  refreshToken: string,
  timeout?: number
) {
  const selectorOptions = timeout !== undefined ? { timeout } : {}
  const clientLoginUrl = `${CLIENT_URL}?refreshToken=${refreshToken}`

  await page.goto(clientLoginUrl)

  const redirectedToApp = page.waitForURL(
    (url) =>
      url.href !== clientLoginUrl && url.origin !== new URL(LOGIN_URL).origin,
    selectorOptions
  )

  const redirectedToLogin = page
    .waitForURL(
      (url) => url.origin === new URL(LOGIN_URL).origin,
      selectorOptions
    )
    .then(() => {
      throw new Error(
        'Redirected to the login page instead of the client — the refresh token exchange likely failed'
      )
    })

  try {
    await Promise.race([redirectedToApp, redirectedToLogin])
  } finally {
    redirectedToApp.catch(() => {})
    redirectedToLogin.catch(() => {})
  }
}

export async function logout(page: Page) {
  if (await page.getByTestId('exit-event').isVisible()) {
    await page.getByTestId('exit-event').click()
  }

  if (isMobile(page)) {
    await page.goto(CLIENT_URL)
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click()
    await page.getByRole('button', { name: 'Logout', exact: true }).click()
    return
  }

  await page.locator('#ProfileMenu-dropdownMenu').click()
  await page
    .locator('#ProfileMenu-dropdownMenu')
    .getByRole('listitem')
    .filter({
      hasText: new RegExp('Logout')
    })
    .click()
  await page.context().clearCookies()
  await page.waitForURL((url) => url.origin === LOGIN_URL)
}

export async function login(
  page: Page,
  username: (typeof CREDENTIALS)[keyof typeof CREDENTIALS] = CREDENTIALS.REGISTRAR,
  /**
   * Set to true to skip PIN creation, e.g. when the test context already has pin saved locally.
   */
  skipPin?: boolean
) {
  const { token, refreshToken } = await getAuthTokens(username)
  expect(refreshToken).toBeDefined()

  // Hand off only the refresh token; the client mints the access token from it.
  await waitForAuthenticatedLanding(page, refreshToken)

  if (!skipPin) {
    await createPIN(page)
  }

  await page.goto(CLIENT_URL)

  return token
}

export async function getAuthTokens(
  username: string,
  password: string = TEST_USER_PASSWORD
) {
  const authUrl = `${AUTH_URL}/authenticate`
  const verifyUrl = `${AUTH_URL}/verifyCode`

  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  const authBody = await authResponse.json()
  const verifyResponse = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nonce: authBody.nonce,
      code: '000000'
    })
  })

  const verifyBody = await verifyResponse.json()

  return {
    token: verifyBody.token as string,
    refreshToken: verifyBody.refreshToken as string
  }
}

export async function getToken(
  username: string,
  password: string = TEST_USER_PASSWORD
) {
  return (await getAuthTokens(username, password)).token
}

export async function getClientToken(client_id: string, client_secret: string) {
  const authResponse = await fetch(`${GATEWAY_HOST}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id,
      client_secret,
      grant_type: 'client_credentials'
    })
  })

  const authBody = await authResponse.json()
  const token = authBody.token ?? authBody.access_token

  if (!token) {
    throw new Error('Client token missing from gateway /auth/token response')
  }

  return token
}

type DeclarationSection =
  | 'child'
  | 'informant'
  | 'father'
  | 'mother'
  | 'documents'
  | 'preview'
  | 'groom'
  | 'bride'
  | 'marriageEvent'
  | 'witnessOne'
  | 'witnessTwo'
type CorrectionSection = 'summary'
type V2ReviewSection = 'review'

export const goToSection = async (
  page: Page,
  section: DeclarationSection | CorrectionSection | V2ReviewSection
) => {
  while (!page.url().includes(`/${section}`)) {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
}

/**
 * Saves a declaration that's still being filled out as a draft, via the
 * form's own `Save & Exit` button - not `triggerDeclarationAction`, which is
 * for actions on a record that's already been opened from a workqueue.
 */
export async function saveAndExit(page: Page) {
  await page.getByRole('button', { name: 'Save & Exit' }).click()
  const draftResponse = page.waitForResponse(
    (res) => res.url().includes('event.draft.create') && res.ok()
  )
  await page.getByRole('button', { name: 'Confirm' }).click()
  await draftResponse
}

/*
  Generates a random past date
  at least 'minAge' years + 'offset' days ago
  and up to an additional 'range' days earlier
*/
export const getRandomDate = (
  minAge: number,
  range: number,
  offset: number = 0
) => {
  const randomDate = new Date()
  randomDate.setDate(
    new Date().getDate() -
      Math.random() * range -
      minAge * 365 -
      (minAge + 3) / 4 -
      offset
  )
  const [yyyy, mm, dd] = randomDate.toISOString().split('T')[0].split('-')
  return { dd, mm, yyyy }
}

export async function ensureLoginPageReady(page: Page) {
  /*
   * Wait until config for loading page has been loaded
   */
  await page.waitForSelector('#Box img', { state: 'attached' })
  await page.waitForFunction(() => {
    const img = document.querySelector<HTMLImageElement>('#Box img')!
    return img && img.src && img.src.trim() !== ''
  })
}

export const uploadImage = async (
  page: Page,
  locator: Locator,
  image = './e2e/assets/528KB-random.png'
) => {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await locator.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(image)
  return fileChooser
}

/**
 * @page - page object
 * @sectionLocator - locator for the section e.g. mother / father
 * @sectionTitle - title of the section to  e.g. National ID / Passport
 * @buttonLocator - locator for the button to upload the image
 */
export const uploadImageToSection = async ({
  page,
  sectionLocator,
  sectionTitle,
  buttonLocator
}: {
  page: Page
  sectionLocator: Locator
  buttonLocator: Locator
  sectionTitle: string
}) => {
  await sectionLocator.getByText('Select', { exact: true }).click()
  await sectionLocator.getByText(sectionTitle, { exact: true }).click()

  await uploadImage(page, buttonLocator)
}

export const getLocationNameFromId = async (id: UUID, token: string) => {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  const [location] = await client.locations.list.query({
    locationIds: [id]
  })

  return location.name
}
export async function continueUntilReview(
  page: Page,
  label: string = 'Continue'
) {
  //
  // while url doesnt contain review
  while (!page.url().includes('review')) {
    await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
    await page.getByText(label, { exact: true }).click()
  }
}

export async function continueForm(page: Page, label: string = 'Continue') {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
  return page.getByText(label, { exact: true }).click()
}

export async function goBackToReview(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
  await page.getByRole('button', { name: 'Go to review' }).click()
}

export const joinValuesWith = (
  values: (string | number | null | undefined)[],
  separator = ' '
) => {
  return values.filter(Boolean).join(separator)
}

type PersonOrName = {
  firstNames?: string
  familyName?: string
  [key: string]: any
}
export const formatName = (name: PersonOrName) => {
  const nameArray = []
  if (name.firstNames) nameArray.push(name.firstNames)
  if (name.familyName) nameArray.push(name.familyName)
  return joinValuesWith(nameArray)
}

export const drawSignature = async (
  page: Page,
  modalLocator:
    | 'review____signature_canvas_element'
    | 'brideSignature_modal'
    | 'groomSignature_modal'
    | 'signature_canvas_element'
    | 'witnessOneSignature_modal'
    | 'witnessTwoSignature_modal'
    | 'informantSignature_modal' = 'informantSignature_modal',
  includeCanvas: boolean = true
) => {
  const canvasLocator = includeCanvas
    ? `#${modalLocator} canvas`
    : `#${modalLocator}`

  const canvas = page.locator(canvasLocator)
  const rect = await canvas.boundingBox()

  expect(rect).toBeTruthy()
  if (rect) {
    const center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }

    const points = Array(10)
      .fill(null)
      .map(() => ({
        x: random(0.05, 0.95),
        y: random(0.05, 0.95)
      }))

    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    for (const point of points) {
      await page.mouse.move(
        rect.x + point.x * rect.width,
        rect.y + point.y * rect.height
      )
    }
    await page.mouse.up()
  }
}

/**
  Opens the record audit view of a record with given trackingId or name
 */
export const auditRecord = async ({
  page,
  trackingId,
  name
}: {
  page: Page
  trackingId?: string
  name: string
}) => {
  if (trackingId) {
    await page
      .getByRole('textbox', { name: 'Search for a record' })
      .fill(trackingId)

    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('button', { name, exact: true }).click()
  } else {
    await page.locator('#searchType').getByText('Tracking ID').click()
    await page.locator('li:has(svg) >> text=Name').click()
    await page.getByRole('textbox', { name: 'Search for a name' }).fill(name)
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('button', { name, exact: true }).click()
  }
}

export const fetchUserLocationHierarchy = async (
  userId: string,
  { headers }: { headers: Record<string, any> }
) => {
  if (!headers.Authorization) {
    throw new Error('Authorization token not found')
  }
  const client = createClient(GATEWAY_HOST + '/events', headers.Authorization)

  const user = await client.user.get.query(userId)
  return await client.locations.getLocationHierarchy.query({
    locationId: user.primaryOfficeId!
  })
}

export async function expectRowValue(
  page: Page,
  fieldName: string,
  assertionText: string
) {
  await expect(page.getByTestId(`${fieldName}-value`)).toContainText(
    assertionText,
    { timeout: 30_000 }
  )
}

export async function expectRowValueWithChangeButton(
  page: Page,
  fieldName: string,
  assertionText: string
) {
  await expect(page.getByTestId(`${fieldName}-value`)).toContainText(
    assertionText
  )

  await expect(page.getByTestId(`change-button-${fieldName}`)).toBeVisible()
}

export async function switchEventTab(
  page: Page,
  tab: 'Audit' | 'Record' | 'Summary'
) {
  await page.getByRole('button', { name: tab, exact: true }).click()
}

/** Assert whether a button on the action menu exists and is enabled/disabled */
export async function validateActionMenuButton(
  page: Page,
  action:
    | 'Declare'
    | 'Notify'
    | 'Approve'
    | 'Register'
    | 'Notify with edits'
    | 'Declare with edits'
    | 'Register with edits',
  isEnabled = true
) {
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const actionButton = page.getByText(action, { exact: true })
  await expect(actionButton).toBeVisible()

  if (isEnabled) {
    await expect(actionButton).not.toHaveAttribute('disabled')
  } else {
    await expect(actionButton).toHaveAttribute('disabled')
  }

  await page.getByRole('button', { name: 'Action', exact: true }).click()
}

const EVENT_ID_URL_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/**
 * Extracts the current record's eventId from the events route (it is embedded as a
 * UUID path segment). Use when the test reached the record via the workqueue/search
 * and never captured the id from a create response.
 */
export function getEventIdFromUrl(page: Page): string {
  const match = page.url().match(EVENT_ID_URL_REGEX)
  if (!match) {
    throw new Error(`No eventId (UUID) found in URL: ${page.url()}`)
  }
  return match[0]
}

/**
 * Options for waiting on the auto-unassign that follows some actions. `eventId` is
 * required by the type only when `waitForUnassign` is true, so callers can never ask
 * to wait for the unassign refetch without supplying the event to match it against.
 */
export type UnassignWait =
  | { waitForUnassign?: false }
  | { waitForUnassign: true; eventId: string }

const actionTitleToApiCallMap = {
  Archive: ['event.actions.archive'],
  Notify: ['event.actions.notify'],
  Declare: ['event.actions.declare'],
  Register: ['event.actions.register'],
  Validate: ['event.actions.custom'],
  'Delete declaration': ['event.delete'],
  'Save & Exit': ['event.draft.create'],
  'Declare with edits': ['event.actions.edit', 'event.actions.declare'],
  'Notify with edits': ['event.actions.edit', 'event.actions.notify'],
  'Register with edits': [
    'event.actions.edit',
    'event.actions.declare',
    'event.actions.register'
  ]
}

/**
 * Attaches response listeners for the given URL fragments, fires the trigger that
 * causes those API calls, then resolves once all of them have returned successfully.
 *
 * The client intentionally does not await action responses (offline requirement), so
 * tests must wait on the network themselves to avoid racing downstream steps. The
 * callback shape enforces that listeners are attached *before* the trigger fires.
 *
 * When `eventId` is passed, it additionally waits for the auto-unassign to settle.
 * The unassign triggers a search-cache refetch (`event.search`, a POST whose body
 * carries `clauses: [{ id: eventId }]`) *onSuccess of the main action*. That listener
 * is gated on the main responses having returned, so an earlier record-scoped search
 * (e.g. the one fired on page load) cannot resolve the wait prematurely.
 *
 * @param page
 * @param urls - URL fragments to match (substring) on successful responses
 * @param trigger - action that fires the API calls (e.g. clicking "Confirm")
 * @param eventId - when set, also wait for the post-action `event.search` refetch of this event
 */
export async function waitForActionResponses(
  page: Page,
  urls: string[],
  trigger: () => Promise<void>,
  eventId?: string
) {
  let mainDone = false
  const main = Promise.all(
    urls.map((url) =>
      page.waitForResponse((res) => res.url().includes(url) && res.ok())
    )
  ).then(() => {
    mainDone = true
  })

  const waits: Array<Promise<unknown>> = [main]

  if (eventId) {
    waits.push(
      page.waitForResponse(
        (res) =>
          res.url().includes('event.search') &&
          res.ok() &&
          res.request().method() === 'POST' &&
          (res.request().postData()?.includes(eventId) ?? false) &&
          mainDone
      )
    )
  }

  await trigger()
  await Promise.all(waits)
}

/**
 * The birth REGISTER confirmation dialog contains a required
 * "Supporting documents reviewed?" select (see `documents-verified` in the
 * birth event config), which keeps the confirm button disabled until answered.
 * Fills it with "Yes" when present. No-op for dialogs without the field
 * (e.g. death registration), at the cost of a short wait for the select.
 */
export async function fillRegisterDialogRequiredFields(page: Page) {
  const documentsVerified = page.locator('#documents-verified')
  const appeared = await documentsVerified
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false)

  if (appeared) {
    await documentsVerified.click()
    // react-select options render as plain divs (no option role)
    await page.locator('.react-select__option', { hasText: /^Yes$/ }).click()
  }
}

/**
 * Triggers and confirms an action from the action menu and waits for the expected API calls to respond before completing.
 * Offline requirement forces us to not await for the responses in client, so we are by design flaky.
 * @param page
 * @param action - action button text from the action menu
 * @param opts - when `{ waitForUnassign: true, eventId }`, also wait for the auto-unassign to settle (via the search-cache refetch). Set when the flow re-assigns the record right after.
 */
export async function triggerDeclarationAction(
  page: Page,
  action:
    | 'Archive'
    | 'Notify'
    | 'Declare'
    | 'Register'
    | 'Validate'
    | 'Delete declaration'
    | 'Save & Exit'
    | 'Declare with edits'
    | 'Notify with edits'
    | 'Register with edits',
  opts: UnassignWait = {}
) {
  // 1. Open action menu and click the action
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  await page.getByText(action, { exact: true }).click()

  const urls = actionTitleToApiCallMap[action]
  const eventId = opts.waitForUnassign ? opts.eventId : undefined

  // 2. Confirm the action, then wait for all the API calls it triggers to return.
  await waitForActionResponses(
    page,
    urls,
    async () => {
      if (action === 'Register' || action === 'Register with edits') {
        await fillRegisterDialogRequiredFields(page)
      }

      const confirmBtn = page.getByRole('button', { name: 'Confirm' })

      if ((await confirmBtn.count()) > 0) {
        await confirmBtn.click()
      } else {
        await page.getByRole('button', { name: action, exact: true }).click()
      }
    },
    eventId
  )
}

/**
 * Title a record is listed under when its name fields are not readable, e.g.
 * once it has been sealed. Matches the event config's `fallbackTitle`.
 */
export const REDACTED_RECORD_TITLE = 'No name provided'

export async function searchFromSearchBar(
  page: Page,
  searchText: string,
  expectToBeFound: boolean = true,
  /**
   * Title the record is listed under, when it differs from what was searched
   * for - a sealed record is found by name but listed as
   * {@link REDACTED_RECORD_TITLE}, since its name is stripped from search
   * results.
   */
  recordTitle: string = searchText
) {
  const searchResultRegex = /Search result for “([^”]+)”/
  await page.locator('#searchText').fill(searchText)
  await page.locator('#searchIconButton').click()
  const searchResult = await page.locator('#content-name').textContent()
  expect(searchResult).toMatch(searchResultRegex)

  if (expectToBeFound) {
    await openRecordByTitle(page, recordTitle)
  } else {
    await expect(
      page.getByRole('button', { name: searchText, exact: true })
    ).not.toBeVisible()
  }
}

export const NEW_USER_PASSWORD = 'Bangladesh23'

export async function loginWithNewUser(page: Page, username: string) {
  const question00 = 'What city were you born in?'
  const question01 = 'What is your favorite movie?'
  const question02 = 'What is your favorite food?'

  await page.goto(LOGIN_URL)
  await ensureLoginPageReady(page)

  await page.fill('#username', username)
  await page.fill('#password', 'test')
  await page.click('#login-mobile-submit')

  await expect(page.getByText('Welcome to Farajaland CRS')).toBeVisible({
    timeout: 60000 // 30s wasn't always enough under CI load.
  })

  await page.getByRole('button', { name: 'Start' }).click()

  // set up password
  await page.fill('#NewPassword', NEW_USER_PASSWORD)
  await page.fill('#ConfirmPassword', NEW_USER_PASSWORD)
  await expect(page.getByText('Passwords match')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  // set up security question
  await page.locator('#question-0').click()
  await page.getByText(question00, { exact: true }).click()
  await page.fill('#answer-0', 'Chittagong')

  await page.locator('#question-1').click()
  await page.getByText(question01, { exact: true }).click()
  await page.fill('#answer-1', 'Into the wild')

  await page.locator('#question-2').click()
  await page.getByText(question02, { exact: true }).click()
  await page.fill('#answer-2', 'Burger')

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByText('Account setup complete')).toBeVisible()
}

export const formatDateTo_dMMMMyyyy = (date: string) =>
  format(parseISO(date), 'd MMMM yyyy')

/*
  Date() object takes 0-indexed month,
  but month coming to the method is 1-indexed
*/
export const formatDateObjectTo_dMMMMyyyy = ({
  yyyy,
  mm,
  dd
}: {
  yyyy: string
  mm: string
  dd: string
}) => format(new Date(Number(yyyy), Number(mm) - 1, Number(dd)), 'd MMMM yyyy')

export const dateToIsoDateString = (date: Date) =>
  date.toISOString().split('T')[0]
/**
 *  Useful for generating child.dob and others.
 *
 * @param daysBack how many days in the past the range takes a sample from
 * @returns date in ISO format
 */
export const randomPastDate = (daysBack = 14) => {
  const today = new Date()
  const pastDate = new Date()
  pastDate.setDate(today.getDate() - daysBack)

  return dateToIsoDateString(faker.date.between({ from: pastDate, to: today }))
}

/**
 * The Organisation page paginates its location list client-side (10 items
 * per page) once a level has more than 10 children — e.g. locations created
 * directly via the API can push a previously first-page entry onto a later
 * page. Since tests in the same `test.describe.serial` block share one page
 * instance, a prior test may have already paged forward past where the
 * target actually is — so this first resets to page 1 (clicking 'Previous
 * page' until disabled), then clicks 'Next page' until `locator` becomes
 * visible or that button is disabled (no more pages), then asserts on it.
 */
export async function findOnOrganisationPage(
  page: Page,
  name: string | RegExp
) {
  const target = page.getByRole('button', { name })
  const nextPageButton = page.getByRole('button', { name: 'Next page' })
  const previousPageButton = page.getByRole('button', {
    name: 'Previous page'
  })

  /*
   * Callers usually arrive here by clicking through from another page, and the
   * probes below do not wait — so settle on the Organisation page first, or a
   * list that has not rendered yet reads as "the target is not on it".
   */
  await expect(page.locator('#content-name')).toHaveText('Organisation')

  /*
   * count() before isEnabled(): a list that fits on one page renders no
   * pagination at all, and isEnabled() would wait for a button never coming.
   */
  const canPage = async (button: Locator) =>
    (await button.count()) > 0 && (await button.isEnabled())

  while (await canPage(previousPageButton)) {
    await previousPageButton.click()
  }

  while (!(await target.isVisible()) && (await canPage(nextPageButton))) {
    await nextPageButton.click()
  }

  return target
}
