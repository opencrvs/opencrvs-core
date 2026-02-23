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
  EventFieldIdInput as AdvancedSearchEventFieldIdInput,
  METADATA_FIELD_PREFIX
} from '../events/AdvancedSearchConfig'
import { EventMetadataTimeFieldIdInput } from '../client'

export type NonSearchableEventMetadataTimeFieldIdInput = Exclude<
  EventMetadataTimeFieldIdInput,
  AdvancedSearchEventFieldIdInput
>

function isNonSearchableEventMetadataTimeFieldId(
  fieldId:
    | AdvancedSearchEventFieldIdInput
    | NonSearchableEventMetadataTimeFieldIdInput
): fieldId is NonSearchableEventMetadataTimeFieldIdInput {
  return !AdvancedSearchEventFieldIdInput.safeParse(fieldId).success
}

export type AdvancedSearchConfig = {
  $$event: AdvancedSearchEventFieldIdInput
} & ReturnType<
  typeof createSearchConfig<{
    fieldId: `${typeof METADATA_FIELD_PREFIX}${AdvancedSearchEventFieldIdInput}`
    fieldType: 'event'
  }>
>

export function createEventFieldConfig(
  fieldId: AdvancedSearchEventFieldIdInput
): AdvancedSearchConfig

export function createEventFieldConfig(
  fieldId: NonSearchableEventMetadataTimeFieldIdInput
): {
  $$event: NonSearchableEventMetadataTimeFieldIdInput
}

export function createEventFieldConfig(
  fieldId:
    | AdvancedSearchEventFieldIdInput
    | NonSearchableEventMetadataTimeFieldIdInput
):
  | AdvancedSearchConfig
  | { $$event: NonSearchableEventMetadataTimeFieldIdInput }

/**
 * Creates a search configuration object for a given event metadata field.
 *
 * @param fieldId - The field ID to search on.
 */
export function createEventFieldConfig(
  fieldId:
    | AdvancedSearchEventFieldIdInput
    | NonSearchableEventMetadataTimeFieldIdInput
) {
  const baseField = {
    fieldId: `${METADATA_FIELD_PREFIX}${fieldId}` as const,
    fieldType: 'event' as const
  }

  if (isNonSearchableEventMetadataTimeFieldId(fieldId)) {
    /**
     * Do not return search config for non-searchable event metadata time fields, as they are not meant to be used in advanced search.
     */
    return {
      $$event: fieldId
    }
  }

  return {
    /**
     * Internal reference to the event field.
     */
    $$event: fieldId,
    ...createSearchConfig(baseField)
  }
}
