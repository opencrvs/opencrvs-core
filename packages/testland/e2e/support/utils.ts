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
import { CLIENT_URL } from './constants'
import { isMobile } from './mobile-helpers'
import { waitForActionResponses } from './helpers'

// tRPC route fragments fired when confirming a correction action. The same
// approve endpoint backs both "approve a request" and "make a direct correction".
const CORRECTION_ACTION_URL = {
  approve: 'event.actions.correction.approve',
  reject: 'event.actions.correction.reject'
} as const

/**
 * Waits for the API responses a correction action fires. The `confirmAction`
 * callback should contain the interaction that fires the action.
 *
 * @param actionType selects the endpoint to wait for ('approve' backs both
 *   approving a request and making a direct correction).
 * @param confirmAction fires the action (e.g. clicks the "Confirm" button).
 */
export async function waitForCorrectionAction(
  page: Page,
  actionType: keyof typeof CORRECTION_ACTION_URL,
  confirmAction: () => Promise<void>
) {
  const urls: string[] = [CORRECTION_ACTION_URL[actionType]]

  await waitForActionResponses(page, urls, confirmAction)
}

type Workqueue =
  | 'Outbox'
  | 'Drafts'
  | 'Assigned to you'
  | 'Recent'
  | 'Notifications'
  | 'Potential duplicate'
  | 'Pending updates'
  | 'Pending attestation'
  | 'Pending approval'
  | 'Escalated'
  | 'Pending registration'
  | 'Pending external validation'
  | 'Pending certification'
  | 'Pending issuance'
  | 'Pending corrections'
  | 'Team'
  | 'Organisation'

export async function navigateToWorkqueue(page: Page, workqueue: Workqueue) {
  if (isMobile(page)) {
    await page.goto(CLIENT_URL)
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click()
  }

  await page.getByRole('button', { name: workqueue }).click()
}

export async function selectAction(
  page: Page,
  action:
    | 'Print'
    | 'Declare'
    | 'Validate'
    | 'Review'
    | 'Register'
    | 'Assign'
    | 'Unassign'
    | 'Delete'
    | 'Correct'
    | 'Archive'
    | 'Unarchive'
    | 'Reject'
    | 'Review correction request'
    | 'Approve'
    | 'Edit'
    | 'Escalate'
    | 'Attest'
    | 'Registrar general feedback'
    | 'Provincial registrar feedback'
    | 'Revoke registration'
    | 'Reinstate registration'
    | 'Update'
    | 'Issue certified copy'
    | 'Review potential duplicates'
    | 'Seal'
    | 'Unseal'
) {
  await page.getByRole('button', { name: 'Action', exact: true }).click()

  if (isMobile(page)) {
    await page.locator('#page-title').getByText(action, { exact: true }).click()
    return
  }

  await page
    .locator('#action-Dropdown-Content')
    .getByText(action, { exact: true })
    .click()
}

/** Assumes events/:eventId pattern */
function getEventIdFromUrl(url: string): string | undefined {
  return new URL(url).pathname.match(/\/events\/([^/]+)/)?.[1]
}

const usernameToFullNameMap = {
  'k.cwalya': 'Kalusha Cwalya',
  'h.habazoka': 'Hakainde Habazoka',
  'k.bwalya': 'Kalusha Bwalya',
  'g.phiri': 'Gift Phiri',
  'f.katongo': 'Felix Katongo',
  'm.simbaya': 'Mapalo Simbaya',
  'v.katongo': 'Velix Katongo',
  'k.mweene': 'Kennedy Mweene',
  'v.mweene': 'Venedy Mweene',
  'm.owen': 'Mitchel Owen',
  'c.lungu': 'Chipo Lungu',
  'n.siame': 'Njavwa Siame',
  'j.campbell': 'Jonathan Campbell',
  'e.mayuka': 'Emmanuel Mayuka',
  'm.musonda': 'Mutale Musonda',
  't.mwila': 'Toukira Mwila',
  'j.banda': 'Joseph Banda'
} as const
/**
 *
 * Ensures that the record is assigned to the user and it is reflected in the event summary.
 *
 * @param username name of the user record is assigned. Used for assertion after assignment. Checking absence of something will burn the whole timeout in CI.
 * @param options.timeout overrides the default expect timeout for the final assignment assertion.
 */
export async function ensureAssignedToUser(
  page: Page,
  username: keyof typeof usernameToFullNameMap,
  options?: { timeout?: number }
) {
  const userFullName = usernameToFullNameMap[username]

  /* A value renders as bare text; only a placeholder or bar adds an element. */
  const assignedTo = page.getByTestId('assignedTo-value')

  // Wait for the value to actually render before deciding
  await assignedTo.waitFor({ state: 'visible' })

  if (await assignedTo.filter({ hasText: userFullName }).isVisible()) {
    return
  }

  const eventId = getEventIdFromUrl(page.url())

  await page.getByRole('button', { name: 'Action', exact: true }).click()

  const assignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Assign$`, 'i') })
    .first()

  await assignAction.waitFor({ state: 'visible' })
  await assignAction.click()

  await waitForActionResponses(
    page,
    ['event.actions.assignment.assign'],
    async () =>
      await page.getByRole('button', { name: 'Assign', exact: true }).click(),
    eventId
  )

  // Wait for the assignment API call to complete and the UI to update.

  await expect(assignedTo).toContainText(userFullName, {
    timeout: options?.timeout
  })
}

export async function expectInUrl(page: Page, assertionString: string) {
  await expect(page).toHaveURL((url) =>
    decodeURIComponent(url.toString()).includes(assertionString)
  )
}

export async function selectLocationOption(page: Page, locationName: string) {
  await page
    .locator('[id^="locationOption"]')
    .getByText(locationName, { exact: true })
    .click()
}

export async function type(page: Page, locator: string, text: string) {
  await page.locator(locator).fill(text)
  await page.locator(locator).blur()
}

export const assertTexts = async ({
  root,
  texts,
  locator,
  testId
}: {
  root: Page | Locator
  texts: string[]
  locator?: string
  testId?: string
}) => {
  for (const text of texts) {
    if (locator) {
      await expect(root.locator(locator).getByText(text)).toBeVisible()
    } else if (testId) {
      await expect(root.getByTestId(testId).getByText(text)).toBeVisible()
    } else {
      await expect(root.getByText(text)).toBeVisible()
    }
  }
}
