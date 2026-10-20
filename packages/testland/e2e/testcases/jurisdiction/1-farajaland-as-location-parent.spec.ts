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
import { getToken, login, searchFromSearchBar } from '@e2e/support/helpers'
import { trackAndDeleteCreatedEvents } from '@e2e/support/test-data/eventDeletion'
import { CREDENTIALS } from '@e2e/support/constants'
import {
  createDeclaration,
  getDeclaration,
  getPlaceOfBirth
} from '@e2e/support/test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '@e2e/support/birth/helpers'

trackAndDeleteCreatedEvents()

test('1.Farajaland as location parent', async ({ page }) => {
  let token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
  const declaration: any = await getDeclaration({
    partialDeclaration: {
      'mother.nid': null,
      'mother.dob': null,
      ...(await getPlaceOfBirth(
        'HEALTH_FACILITY',
        token,
        'Klow Village Hospital'
      ))
    },
    token
  })

  const name = formatV2ChildName(declaration)

  await test.step('1.1.0 Hospital official creates an incomplete declaration', async () => {
    token = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)

    await createDeclaration(token, declaration, ActionType.NOTIFY)
  })

  await test.step('1.1.1 Embassy official in another administrative area should not find the declaration', async () => {
    await login(page, CREDENTIALS.EMBASSY_OFFICIAL)

    await searchFromSearchBar(page, name, false)
  })

  await test.step('1.1.2 Registrar general within the same administrative area should find the declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)

    await searchFromSearchBar(page, name, true)
  })
})
