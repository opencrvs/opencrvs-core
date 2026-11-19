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
  FieldConfig,
  INITIAL_EVENT_CONFIG_VERSION_ID
} from '@opencrvs/commons/events'
import { createVersionIndex } from '@events/service/indexing/indexing'

/** Creates the index of the only version of an event configured without versions. */
export async function createEventIndex(
  eventType: string,
  formFields: FieldConfig[]
) {
  return createVersionIndex(
    eventType,
    INITIAL_EVENT_CONFIG_VERSION_ID,
    formFields
  )
}
