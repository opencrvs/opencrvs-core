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

import { login, getToken, searchFromSearchBar } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  Declaration
} from '@e2e/support/test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'
import { ensureAssignedToUser } from '@e2e/support/utils'
import { archiveViaApi } from '@e2e/support/test-data/api-actions'

async function getActionMenuOptions(page: Page, declaration: Declaration) {
  await searchFromSearchBar(page, formatV2ChildName(declaration))
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const options = await page.locator('#action-Dropdown-Content li').all()
  const textContents = await Promise.all(
    options.map((option) => option.textContent())
  )
  return textContents
}

/** Retries until the menu settles, as it may still re-render after an action. */
async function expectActionMenuOptions(
  page: Page,
  declaration: Declaration,
  expected: string[]
) {
  await searchFromSearchBar(page, formatV2ChildName(declaration))
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  await expect(page.locator('#action-Dropdown-Content li')).toHaveText(expected)
}

test.describe('Action menu options', () => {
  test.describe('Event status: DECLARED', () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      declaration = res.declaration
    })

    test('Registration Officer', async ({ page }) => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Edit',
        'Validate',
        'Escalate',
        'Reject',
        'Archive'
      ])
    })

    test('Registrar', async ({ page }) => {
      await login(page, CREDENTIALS.REGISTRAR)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Register',
        'Edit',
        'Escalate',
        'Reject',
        'Archive'
      ])
    })
  })

  test.describe('Event status: DECLARED and flag: validated', () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      declaration = res.declaration
    })

    test('Registrar', async ({ page }) => {
      await login(page, CREDENTIALS.REGISTRAR)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Register',
        'Edit',
        'Escalate',
        'Reject',
        'Archive'
      ])
    })
  })

  test.describe('Event status: REGISTERED', () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(token, undefined)
      declaration = res.declaration
    })

    test('Registrar', async ({ page }) => {
      await login(page, CREDENTIALS.REGISTRAR)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Escalate',
        'Print',
        'Correct',
        'Issue a verifiable credential'
      ])
    })

    test('Registrar (assigned)', async ({ page }) => {
      await login(page, CREDENTIALS.REGISTRAR)
      await searchFromSearchBar(page, formatV2ChildName(declaration))
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

      await page.getByRole('button', { name: 'Action', exact: true }).click()
      const options = await page
        .locator('#action-Dropdown-Content li')
        .allTextContents()

      expect(options).toStrictEqual([
        'Escalate',
        'Print',
        'Correct',
        'Issue a verifiable credential',
        'Unassign'
      ])
    })
  })

  test('Event status: ARCHIVED', async ({ page }) => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const { declaration, eventId } = await createDeclaration(
      token,
      undefined,
      ActionType.DECLARE
    )

    await test.step('Archive declaration via API', async () => {
      await archiveViaApi(token, eventId)
    })

    await test.step('Registrar', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await expectActionMenuOptions(page, declaration, [
        'Assign',
        'Escalate',
        'Unarchive'
      ])
    })

    await test.step('Registration Officer', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await expectActionMenuOptions(page, declaration, [
        'Assign',
        'Escalate',
        'Unarchive'
      ])
    })
  })
})
