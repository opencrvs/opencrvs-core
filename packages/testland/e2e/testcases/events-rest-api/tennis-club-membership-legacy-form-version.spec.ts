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
import { v4 as uuidv4 } from 'uuid'
import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import {
  expectRowValue,
  getToken,
  login,
  searchFromSearchBar,
  switchEventTab
} from '../../helpers'
import { ensureAssignedToUser } from '../../utils'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'

test('A record declared under a historical form version renders correctly in the UI', async ({
  browser
}) => {
  const page = await browser.newPage()

  const member = {
    firstNames: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const memberTitle = `${member.firstNames} ${member.surname}`

  await test.step('Declare a membership application directly against the pre-2023 form version - a single name field, none of the fields added later - bypassing the normal declare UI, which always uses the version active today', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

    const createRes = await client.event.create.mutate({
      type: 'tennis-club-membership',
      transactionId: uuidv4(),
      // "legacy-simple" predates registration duration, address, senior-pass,
      // ID/profile images and recommenders - none of that exists in this
      // version's declaration, which is a single name field. Explicitly
      // pinning here (rather than letting it resolve to whatever's active
      // today) is what makes this a genuine test of historical-version
      // behavior.
      configVersion: 'legacy-simple'
    })
    const eventId = createRes.id as string

    expect(createRes.configVersion).toBe('legacy-simple')

    const declareRes = await client.event.actions.declare.request.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration: {
        'applicant.name': {
          firstname: member.firstNames,
          surname: member.surname
        }
      },
      annotation: {
        'review.comment': 'Digitized from a pre-2023 paper record.'
      }
    })

    expect(declareRes.trackingId).toBeTruthy()
  })

  await test.step('The record is visible and shows its historically-collected data correctly', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await searchFromSearchBar(page, memberTitle)
    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await switchEventTab(page, 'Record')
    await expectRowValue(page, 'applicant.name', memberTitle)
  })

  await test.step('The audit trail records that the event was declared', async () => {
    await switchEventTab(page, 'Audit')
    await expect(
      page.locator('#listTable-task-history').getByText('Declared')
    ).toBeVisible()
  })
})
