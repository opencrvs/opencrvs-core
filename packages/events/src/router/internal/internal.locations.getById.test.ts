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

import { createPrng, generateUuid, SetLocationPayload } from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createInternalTestClient,
  systemInitialisationTestSetup
} from '@events/tests/utils'

const caller = createInternalTestClient()

test('Returns a single location by id', async () => {
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const location: SetLocationPayload = {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'Test location',
    locationType: 'CRVS_OFFICE'
  }

  await seeder.locations.set([location])
  const result = await caller.locations.getById(location.id)

  expect(result).toMatchObject(location)
})

test('Returns the correct location when multiple exist', async () => {
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const locationA: SetLocationPayload = {
    id: generateUuid(createPrng(1)),
    administrativeAreaId: null,
    name: 'Location A',
    locationType: 'CRVS_OFFICE'
  }
  const locationB: SetLocationPayload = {
    id: generateUuid(createPrng(2)),
    administrativeAreaId: null,
    name: 'Location B',
    locationType: 'CRVS_OFFICE'
  }

  await seeder.locations.set([locationA, locationB])
  const result = await caller.locations.getById(locationA.id)

  expect(result).toMatchObject(locationA)
  expect(result.id).not.toBe(locationB.id)
})
