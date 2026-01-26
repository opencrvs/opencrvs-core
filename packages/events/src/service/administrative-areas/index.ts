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

import { UUID, AdministrativeArea } from '@opencrvs/commons'
import * as administrativeAreaRepo from '@events/storage/postgres/administrative-hierarchy/administrative-areas'

export async function getAdministrativeAreas(params?: {
  isActive?: boolean
  ids?: UUID[]
}) {
  const administrativeAreas =
    await administrativeAreaRepo.getAdministrativeAreas(params)

  return administrativeAreas
}

export async function setAdministrativeAreas(
  administrativeAreas: AdministrativeArea[]
) {
  await administrativeAreaRepo.setAdministrativeAreas(administrativeAreas)
}
