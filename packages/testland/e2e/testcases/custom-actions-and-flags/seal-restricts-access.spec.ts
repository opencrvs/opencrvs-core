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
import {
  getToken,
  login,
  REDACTED_RECORD_TITLE,
  searchFromSearchBar,
  uploadImage,
  waitForActionResponses
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'

/**
 * Sealed records all display the same generic REDACTED_RECORD_TITLE, so if
 * fuzzy name matching happens to return more than one sealed record, they
 * can't be told apart by title alone - fall back to the tracking ID, which
 * is unique, before opening.
 */
async function searchSealedRecordByNameOrTrackingId(
  page: Page,
  searchText: string,
  trackingId: string
) {
  await page.locator('#searchText').fill(searchText)
  await page.locator('#searchIconButton').click()
  const searchResult = await page.locator('#content-name').textContent()
  expect(searchResult).toMatch(/Search result for “([^”]+)”/)

  const resultCount = await page.locator('[id^="row_"]').count()
  if (resultCount > 1) {
    await page.locator('#searchText').fill(trackingId)
    await page.locator('#searchIconButton').click()
  }

  await openRecordByTitle(page, REDACTED_RECORD_TITLE)
}

test('Sealing a record hides it from local registrars and blocks all actions', async ({
  browser
}) => {
  // openRecordByTitle's own collision-retry loop can take up to 60s under
  // load, and this flow's earlier steps alone can take ~75s - the default
  // 90s budget doesn't leave that loop room to actually do its job.
  test.setTimeout(180_000)

  const page = await browser.newPage()
  let childName: string
  let eventId: string
  let trackingId: string
  await test.step('Registrar (k.mweene) registers a birth record', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    eventId = res.eventId
    trackingId = res.trackingId as string
    childName = formatV2ChildName(res.declaration as Declaration)
  })

  await test.step('Registrar General (c.lungu) seals the record', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await searchFromSearchBar(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)

    await selectAction(page, 'Seal')

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    await page.locator('#reason').click()
    await page
      .locator('.react-select__option', { hasText: 'Court order' })
      .click()
    await page
      .locator('#courtOrderReference')
      .fill('Sealing record for testing purposes.')
    await uploadImage(page, page.locator('button[name="courtOrderCopy"]'))

    const sealResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await page.getByRole('button', { name: 'Confirm' }).click()
    await sealResponse
  })

  await test.step('Registrar General still sees the "Sealed" flag and retains full access', async () => {
    // Sealing strips the declaration from the search index for everyone, so
    // the record is still found by name but listed without one. The full
    // record stays available to this role through the Record tab.
    await searchSealedRecordByNameOrTrackingId(page, childName, trackingId)
    await expect(page.getByTestId('flags-value')).toContainText('Sealed')
    await expect(
      page.getByRole('button', { name: 'Record', exact: true })
    ).toBeVisible()

    const overviewTitle = await page.locator('#content-name').textContent()
    expect(overviewTitle).toEqual(REDACTED_RECORD_TITLE)

    const pageTitle = await page.locator('#page-title h1').textContent()

    expect(pageTitle).toEqual(REDACTED_RECORD_TITLE)
  })

  await test.step('Redacted fields are immediately updated based on assignment status', async () => {
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)

    const overviewTitleAssigned = await page
      .locator('#content-name')
      .textContent()
    expect(overviewTitleAssigned).toEqual(childName)

    const pageTitleAssigned = await page.locator('#page-title h1').textContent()

    expect(pageTitleAssigned).toEqual(childName)

    await selectAction(page, 'Unassign')
    await waitForActionResponses(
      page,
      ['event.actions.assignment.unassign'],
      async () => await page.getByRole('button', { name: 'Unassign' }).click(),
      eventId
    )

    const overviewTitleUnssigned = await page
      .locator('#content-name')
      .textContent()
    expect(overviewTitleUnssigned).toEqual(REDACTED_RECORD_TITLE)

    const pageTitleUnassigned = await page
      .locator('#page-title h1')
      .textContent()

    expect(pageTitleUnassigned).toEqual(REDACTED_RECORD_TITLE)
  })

  await test.step('Registrar (k.mweene) can still find the sealed record via search', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    // `record.search` is not restricted by the `sealed` flag for this role,
    // only `record.read` is - so the record still surfaces in search results,
    // with its declaration stripped.
    await searchSealedRecordByNameOrTrackingId(page, childName, trackingId)
  })

  await test.step('Registrar sees the record is already sealed', async () => {
    await expect(page.getByTestId('flags-value')).toContainText('Sealed')
  })

  await test.step('Registrar cannot open the full record', async () => {
    // The "Record" tab is only shown when the user's `record.read` scope
    // (including its flag modifiers) grants access - denied here since
    // `record.read` for this role has `flags: { noneOf: ['sealed'] }`.
    await expect(
      page.getByRole('button', { name: 'Record', exact: true })
    ).not.toBeVisible()
  })

  await test.step('Registrar cannot download/assign the record', async () => {
    await expect(
      page.getByRole('button', { name: 'Assign record' })
    ).not.toBeVisible()
  })

  await test.step('Registrar cannot perform any actions on the record', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()

    const menu = page.locator('#action-Dropdown-Content')

    // Assignment (and therefore every action gated behind it) is unavailable.
    await expect(menu.getByText('Assign', { exact: true })).not.toBeVisible()
    await expect(menu.getByText('Unassign', { exact: true })).not.toBeVisible()
    // Sealing/unsealing is restricted to the Registrar General role.
    await expect(menu.getByText('Seal', { exact: true })).not.toBeVisible()
    await expect(menu.getByText('Unseal', { exact: true })).not.toBeVisible()

    // Any remaining menu entries are rendered but permanently disabled, since
    // the record can never be assigned to this user while it is sealed.
    // `disabled` on an `<li>` has no native HTML/ARIA semantics (unlike on a
    // <button>/<input>), so `toBeDisabled()` won't detect it - the component
    // instead marks disabled entries with `tabindex="-1"` to remove them from
    // keyboard navigation, which is what we assert on here.
    const remainingItems = await menu.locator('li').all()
    for (const item of remainingItems) {
      await expect(item).toHaveAttribute('tabindex', '-1')
    }
  })
})
