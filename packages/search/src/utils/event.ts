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
  EVENT_TYPE,
  getTaskFromSavedBundle,
  SavedBundle
} from '@opencrvs/commons/types'

export function getEventType(bundle: SavedBundle) {
  const task = getTaskFromSavedBundle(bundle)
  if (!task) {
    throw new Error('No task found')
  }
  const type = task.code!.coding![0].code as EVENT_TYPE
  return type
}
