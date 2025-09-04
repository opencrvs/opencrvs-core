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

import { createSearchConfig } from '../searchConfigs'
import {
  EventFieldIdInput,
  METADATA_FIELD_PREFIX
} from '../events/AdvancedSearchConfig'

/**
 * Creates a search configuration object for a given event metadata field.
 *
 * @param fieldId - The field ID to search on.
 */
export function createEventFieldConfig(fieldId: EventFieldIdInput) {
  const baseField = {
    fieldId: `${METADATA_FIELD_PREFIX}${fieldId}` as const,
    fieldType: 'event' as const
  }

  return createSearchConfig(baseField)
}
