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
 * Suite-specific helpers for packages/testland/e2e/testcases/qa-testrail-testcases/.
 *
 * This file holds ONLY functions that either behave differently from their
 * canonical counterpart, or have no canonical counterpart at all. Everything
 * unchanged should be imported directly by the spec file from its canonical
 * location (e2e/helpers.ts, e2e/testcases/birth/helpers.ts,
 * e2e/testcases/print-certificate/birth/helpers.ts,
 * e2e/testcases/test-data/*.ts, etc.) instead of being duplicated here - see
 * the qa-testrail-testcases skill for the full rule.
 */
import { Page, expect } from '@playwright/test'
import { ActionType, ActionUpdate } from '@opencrvs/toolkit/events'
import { getRowByTitle } from '../print-certificate/birth/helpers'
import {
  createDeclaration as createDeathDeclaration,
  type Declaration as DeathDeclaration
} from '../test-data/death-declaration'

/**
 * Opens a record from a workqueue list by its title (e.g. formatted child name) and **verifies it**
 *
 * Deliberate fork of e2e/testcases/print-certificate/birth/helpers.ts's
 * openRecordByTitle: adds `.first()` on the row's button locator. Some
 * qa-testrail-testcases workqueues can render more than one row matching the
 * same title (e.g. right after a duplicate-detection fixture seeds a second
 * record with the same name), which makes Playwright's strict mode throw on
 * the canonical version's plain `.click()`.
 *
 * NOTE:
 * Application polls continuously for updates. E2E tests are run in parallel.
 * It is likely that the same workqueue will get updated, and **during** the time we select a row, and click it, it actually has diffrent user and the test fails down the line.
 *
 */
export async function openRecordByTitle(page: Page, title: string) {
  await expect(async () => {
    await getRowByTitle(page, title)
      .getByRole('button', { name: title })
      .first()
      .click()
    try {
      // target the event overview title to make sure this is the right one.
      await expect(
        page.getByRole('heading', { name: title, level: 1 })
      ).toBeVisible({ timeout: 3_000 })
    } catch (error) {
      await page.goBack()
      // This triggers toPass retry loop if the updated happened and we picked wrong one.
      throw error
    }
  }).toPass({
    timeout: 60_000,
    intervals: [...Array(5).fill(1_000), ...Array(5).fill(2_000), 5_000]
  })
}

/**
 * Deliberate fork of e2e/helpers.ts's searchFromSearchBar: delegates to this
 * file's own openRecordByTitle above (with the `.first()` fix) instead of
 * the canonical one.
 */
export async function searchFromSearchBar(
  page: Page,
  searchText: string,
  expectToBeFound: boolean = true,
  /**
   * Title the record is listed under, when it differs from what was searched
   * for - a sealed record is found by name but listed as 'No name provided'
   * (the event config's fallbackTitle), since its name is stripped from
   * search results.
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

export type DuplicateDeathDeclaration = DeathDeclaration

/**
 * Creates a death declaration meant to collide with another one under the
 * death dedup config (packages/testland/src/events/death/dedupConfig.ts),
 * which ANDs together four checks - all four must hold for two records to
 * be flagged as potential duplicates:
 *  - deceased.name fuzzy-matches
 *  - deceased.dob is within 365 days
 *  - eventDetails.date (date of death) is within 5 days
 *  - deceased.idType/nid match (exactly, when both records carry an ID)
 *
 * The canonical getDeclaration (e2e/testcases/test-data/death-declaration.ts)
 * already fixes deceased.dob and eventDetails.date to constants (not
 * randomised), and deceased.name comes from `dec` - but deceased.nid is
 * `faker.string.numeric(10)`, freshly randomised on every call, so two
 * independent calls never satisfy the ID check on their own. Fixing
 * deceased.idType/nid here (caller overrides in `dec` still win) makes every
 * call default to the same ID, so two calls sharing just a `dec` with a
 * matching `deceased.name` reliably collide on all four checks.
 *
 * NOTE: unused in this PR - consumed by the follow-up core actions PR's
 * el-archive.spec.ts (delete/archive/edit/reject).
 */
export async function createDuplicateDeathDeclaration(
  token: string,
  dec: Partial<ActionUpdate>,
  action: ActionType = ActionType.REGISTER,
  placeOfDeathType?: 'DECEASED_USUAL_RESIDENCE' | 'HEALTH_FACILITY'
): Promise<{ eventId: string; declaration: DuplicateDeathDeclaration }> {
  return createDeathDeclaration(
    token,
    {
      'deceased.idType': 'NATIONAL_ID',
      'deceased.nid': '1234567890',
      ...dec
    },
    action,
    placeOfDeathType
  )
}
