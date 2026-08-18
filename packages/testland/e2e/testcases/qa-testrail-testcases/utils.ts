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
/**
 * Suite-specific override of e2e/utils.ts's ensureAssignedToUser for
 * packages/testland/e2e/testcases/qa-testrail-testcases/. Everything else
 * that file exports (e.g. selectAction) is unchanged here and should be
 * imported directly from '../../utils' (from this folder) instead of being
 * duplicated in this file - see the qa-testrail-testcases skill for the
 * full rule.
 */
import { Page, expect } from '@playwright/test'

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
  't.mwila': 'Toukir Mwila',
  'j.banda': 'Joseph Banda'
} as const

/**
 * How long a just-completed action (Archive/Escalate/Declare with edits/etc.)
 * can take to auto-unassign the record and have that reflected back in the
 * client's cache. There's no DOM signal for this settling - the value simply
 * flips once a background event.search refetch lands - so this is a
 * deliberate, named wait rather than an incidental one.
 */
const ASSIGNMENT_SETTLE_WAIT_MS = 4_000

/**
 * Ensures that the record is assigned to the user and it is reflected in the event summary.
 *
 * Deliberate fork of e2e/utils.ts's ensureAssignedToUser: that version reads
 * assignedTo-value exactly once before deciding whether to assign. Under this
 * suite that single point-in-time read was flaky - the overview page can show
 * a stale assignedTo-value for a few seconds after navigation, or after an
 * action that auto-unassigns the record (Archive/Escalate/Declare with
 * edits/etc.), and only catches up once a background refetch lands. This
 * version wraps the whole check-then-assign flow in a toPass retry, with an
 * ASSIGNMENT_SETTLE_WAIT_MS wait at the start of every lap so the settle
 * window is respected even on the early-return path.
 *
 * @param username name of the user record is assigned. Used for assertion after assignment. Checking absence of something will burn the whole timeout in CI.
 */
export async function ensureAssignedToUser(
  page: Page,
  username: keyof typeof usernameToFullNameMap
) {
  const userFullName = usernameToFullNameMap[username]

  const assignedTo = page.getByTestId('assignedTo-value')
  const actionButton = page.getByRole('button', { name: 'Action', exact: true })

  await expect(async () => {
    await page.waitForTimeout(ASSIGNMENT_SETTLE_WAIT_MS)

    await assignedTo.waitFor({ state: 'visible' })

    if (await assignedTo.filter({ hasText: userFullName }).isVisible()) {
      return
    }

    await actionButton.click()

    const assignAction = page
      .locator('#action-Dropdown-Content li')
      .filter({ hasText: new RegExp(`^Assign$`, 'i') })
      .first()

    const hasAssignOption = await assignAction
      .waitFor({ state: 'visible', timeout: 3_000 })
      .then(() => true)
      .catch(() => false)

    if (!hasAssignOption) {
      // The state must have moved on since we last read assignedTo-value
      // (e.g. it's already assigned) - close the menu before retrying.
      await actionButton.click()
      throw new Error('Assign action not available - retrying')
    }

    await assignAction.click()

    // Setup the listener before clicking.
    const assignResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.actions.assignment.assign') &&
        res.status() === 200
    )
    // Wait for the assign modal to appear
    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    // Wait for the assignment API call to complete and the UI to update.
    await assignResponse

    await expect(assignedTo).toContainText(userFullName)
  }).toPass({
    // Each lap now starts with its own ASSIGNMENT_SETTLE_WAIT_MS wait, so the
    // outer budget needs enough room for a few full laps, not just retries.
    timeout: 45_000,
    intervals: [1_000, 1_000, 2_000, 2_000, 5_000]
  })
}
