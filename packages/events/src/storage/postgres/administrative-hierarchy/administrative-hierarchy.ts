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

import { AdministrativeArea, Location } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import * as administrativeAreaRepo from '@events/storage/postgres/administrative-hierarchy/administrative-areas'
import * as locationRepo from '@events/storage/postgres/administrative-hierarchy/locations'

export async function setAdministrativeHierarchy({
  administrativeAreas,
  locations
}: {
  administrativeAreas: AdministrativeArea[]
  locations: Location[]
}) {
  const db = getClient()

  await db.transaction().execute(async (trx) => {
    await administrativeAreaRepo.setAdministrativeAreasInTrx(
      trx,
      administrativeAreas
    )

    await locationRepo.setLocationsInTrx(trx, locations)
  })
}
