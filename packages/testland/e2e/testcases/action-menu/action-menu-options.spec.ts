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
import { ensureAssignedToUser, selectAction } from '@e2e/support/utils'

async function getActionMenuOptions(page: Page, declaration: Declaration) {
  await searchFromSearchBar(page, formatV2ChildName(declaration))
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const options = await page.locator('#action-Dropdown-Content li').all()
  const textContents = await Promise.all(
    options.map((option) => option.textContent())
  )
  return textContents
}

test.describe('Action menu options', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  test.describe('Event status: DECLARED', () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      declaration = res.declaration
    })

    test('Registration Officer', async () => {
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

    test('Registrar', async () => {
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

    test('Registrar', async () => {
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

    test('Registrar', async () => {
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

    test('Registrar (assigned)', async () => {
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

  test.describe.serial('Event status: ARCHIVED', async () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      declaration = res.declaration
    })

    test('Archive declaration', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await searchFromSearchBar(page, formatV2ChildName(declaration))

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Archive')

      const archiveResponse = page.waitForResponse(
        (res) => res.url().includes('event.actions.archive') && res.ok()
      )

      await page.getByRole('button', { name: 'Archive' }).click()
      await archiveResponse
    })

    test('Registrar', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual(['Assign', 'Escalate', 'Unarchive'])
    })

    test('Registration Officer', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual(['Assign', 'Escalate', 'Unarchive'])
    })
  })
})
