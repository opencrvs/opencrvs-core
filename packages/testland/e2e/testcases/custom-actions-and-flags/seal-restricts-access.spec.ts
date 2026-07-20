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
import { expect, test } from '@playwright/test'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureAssignedToUser, selectAction } from '../../utils'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'

test('Sealing a record hides it from local registrars and blocks all actions', async ({
  browser
}) => {
  const page = await browser.newPage()
  let childName: string

  await test.step('Registrar (k.mweene) registers a birth record', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const res = await createDeclaration(token)
    childName = formatV2ChildName(res.declaration as Declaration)
  })

  await test.step('Registrar General (c.lungu) seals the record', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    await searchFromSearchBar(page, childName)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Seal')

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    await page.locator('#reason').fill('Sealing record for testing purposes.')
    await page
      .locator('#comments')
      .fill('Additional context for sealing the record.')

    const sealResponse = page.waitForResponse(
      (response) =>
        response.url().includes('event.actions.custom') && response.ok()
    )

    await page.getByRole('button', { name: 'Confirm' }).click()
    await sealResponse
  })

  await test.step('Registrar General still sees the "Sealed" flag and retains full access', async () => {
    await searchFromSearchBar(page, childName)
    await expect(page.getByTestId('flags-value')).toContainText('Sealed')
    await expect(
      page.getByRole('button', { name: 'Record', exact: true })
    ).toBeVisible()
  })

  await test.step('Registrar (k.mweene) can still find the sealed record via search', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    // `record.search` is not restricted by the `sealed` flag for this role,
    // only `record.read` is - so the record still surfaces in search results.
    await searchFromSearchBar(page, childName)
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
