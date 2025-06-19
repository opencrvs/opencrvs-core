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

import { getClient } from '@events/storage/postgres/events'
import { NewLocations } from './schema/app/Locations'

export async function createLocations(locations: NewLocations[]) {
  const db = getClient()
  await db.insertInto('locations').values(locations).execute()
}

export async function getLocations() {
  const db = getClient()
  return db.selectFrom('locations').selectAll().execute()
}
