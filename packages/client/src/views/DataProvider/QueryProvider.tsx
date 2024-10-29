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
import { Action } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { getBirthQueryMappings } from '@client/views/DataProvider/birth/queries'
import { getDeathQueryMappings } from '@client/views/DataProvider/death/queries'
import { getMarriageQueryMappings } from '@client/views/DataProvider/marriage/queries'

/* Need to add mappings for events here */
const QueryMapper = {
  [Event.Birth]: getBirthQueryMappings,
  [Event.Death]: getDeathQueryMappings,
  [Event.Marriage]: getMarriageQueryMappings
}
export const getQueryMapping = (event: Event, action: Action) => {
  return QueryMapper[event] && QueryMapper[event](action)
}
