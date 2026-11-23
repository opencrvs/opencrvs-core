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
import { test } from '@playwright/test'
import { getToken, login, triggerDeclarationAction } from '@e2e/support/helpers'
import { CREDENTIALS } from '@e2e/support/constants'
import { ensureAssignedToUser } from '@e2e/support/utils'
import {
  assertRecordInWorkqueue,
  formatV2ChildName
} from '@e2e/support/birth/helpers'
import { openRecordByTitle } from '@e2e/support/print-certificate/birth/helpers'
import { createDeclaration } from '@e2e/support/test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'

// HO Declares => RO Validates => Registrar Registers
test('4. Workqueue flow - 4', async ({ page }) => {
  test.setTimeout(360_000)

  let childName: string

  await test.step('4.1 Declare by CL', async () => {
    await test.step('4.1.1 Declare via API', async () => {
      const token = await getToken(CREDENTIALS.COMMUNITY_LEADER)
      const { declaration } = await createDeclaration(
        token,
        undefined,
        ActionType.DECLARE,
        'PRIVATE_HOME'
      )
      childName = formatV2ChildName(declaration)
    })

    await test.step('4.1.2 Login', async () => {
      await login(page, CREDENTIALS.COMMUNITY_LEADER)
    })

    await test.step('4.1.3 Verify workqueue', async () => {
      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true }
        ]
      })
    })
  })

  await test.step('4.2 Workqueue for Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await assertRecordInWorkqueue({
      page,
      name: childName,
      workqueues: [
        { title: 'Outbox', exists: false },
        { title: 'Drafts', exists: false },
        { title: 'Assigned to you', exists: false },
        { title: 'Recent', exists: false },
        { title: 'Notifications', exists: false },
        { title: 'Potential duplicate', exists: false },
        { title: 'Pending updates', exists: false },
        { title: 'Pending approval', exists: false },
        { title: 'Pending registration', exists: false },
        { title: 'Escalated', exists: false },
        { title: 'Pending external validation', exists: false },
        { title: 'Pending certification', exists: false },
        { title: 'Pending issuance', exists: false }
      ]
    })
  })

  await test.step('4.3 Validate by RO', async () => {
    await test.step('4.3.1 Verify workqueue', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: true },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    await test.step('4.3.2 Validate', async () => {
      await page.getByText('Pending validation').click()

      await openRecordByTitle(page, childName)

      await ensureAssignedToUser(page, CREDENTIALS.REGISTRATION_OFFICER)

      await triggerDeclarationAction(page, 'Validate')

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })

  await test.step('4.4 CL can not see the validated record', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER, true)

    await assertRecordInWorkqueue({
      page,
      name: childName,
      workqueues: [
        { title: 'Assigned to you', exists: false },
        { title: 'Recent', exists: false }
      ]
    })
  })

  await test.step('4.5 Register by Registrar', async () => {
    await test.step('4.5.1 Validate workqueue', async () => {
      await login(page, CREDENTIALS.REGISTRAR, true)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: true },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    await test.step('4.5.2 Register', async () => {
      await page.getByText('Pending registration').click()

      await openRecordByTitle(page, childName)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

      await triggerDeclarationAction(page, 'Register')

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'Drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'Pending external validation', exists: false },
          { title: 'Pending certification', exists: true },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })

  await test.step('4.6 CL can not see the registered record', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER, true)

    await assertRecordInWorkqueue({
      page,
      name: childName,
      workqueues: [
        { title: 'Assigned to you', exists: false },
        { title: 'Recent', exists: false }
      ]
    })
  })

  await test.step('4.7 Workqueue for RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER, true)

    await assertRecordInWorkqueue({
      page,
      name: childName,
      workqueues: [
        { title: 'Assigned to you', exists: false },
        { title: 'Recent', exists: false },
        { title: 'Notifications', exists: false },
        { title: 'Pending validation', exists: false },
        { title: 'Pending updates', exists: false },
        { title: 'Pending approval', exists: false },
        { title: 'Escalated', exists: false },
        { title: 'Pending external validation', exists: false },
        { title: 'Pending certification', exists: true },
        { title: 'Pending issuance', exists: false }
      ]
    })
  })
})
