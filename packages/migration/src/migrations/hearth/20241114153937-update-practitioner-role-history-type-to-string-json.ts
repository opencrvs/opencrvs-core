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

import {
  nonJSONRoleStringFilter,
  updatePractitionerRoleCodeAggregate
} from '../../utils/role-helper.js'
import { Db } from 'mongodb'

/**
 * Fill out PractitionerRole_history "type system code" with the correct JSON format.
 * Migration was partially done on packages/migration/src/migrations/hearth/20230127063226-update-practitioner-role.ts against PractitionerRole.
 */
export const up = async (db: Db) => {
  await db
    .collection('PractitionerRole_history')
    .updateMany(nonJSONRoleStringFilter, updatePractitionerRoleCodeAggregate)
}
export const down = async (db: Db) => {}
