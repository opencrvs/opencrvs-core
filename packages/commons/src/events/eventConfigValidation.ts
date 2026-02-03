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
import * as z from 'zod/v4'
import { EventConfig } from './EventConfig'
import { ActionType, workqueueActions } from './ActionType'
import { InherentFlags } from './Flag'
import { findAllFields, getDeclarationFields } from './utils'
import { FieldType } from './FieldType'
import { EventFieldId } from './AdvancedSearchConfig'

export function validateAdvancedSearchConfig(
  event: EventConfig,
  ctx: z.RefinementCtx<EventConfig>
) {
  const allFields = findAllFields(event)
  const fieldIds = allFields.map((field) => field.id)

  const advancedSearchFields = event.advancedSearch.flatMap((section) =>
    section.fields.flatMap((field) => field.fieldId)
  )

  const advancedSearchFieldsSet = new Set(advancedSearchFields)

  if (advancedSearchFieldsSet.size !== advancedSearchFields.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Advanced search field ids must be unique',
      path: ['advancedSearch']
    })
  }

  const invalidFields = event.advancedSearch.flatMap((section) =>
    // Check if the fieldId is not in the fieldIds array
    // and also not in the metadataFields array
    section.fields.filter(
      (field) =>
        !(
          fieldIds.includes(field.fieldId) ||
          (EventFieldId.options as string[]).includes(field.fieldId) ||
          (field.config.searchFields &&
            field.config.searchFields.length > 0 &&
            field.config.searchFields.every((sf) => fieldIds.includes(sf)))
        )
    )
  )

  if (invalidFields.length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: `Advanced search id must match a field id of form fields or pre-defined metadata fields.
  Invalid AdvancedSearch field IDs for event ${event.id}: ${invalidFields
    .map((f) => f.fieldId)
    .join(', ')}`,
      path: ['advancedSearch']
    })
  }
}

export function validateDateOfEvent(
  event: EventConfig,
  ctx: z.RefinementCtx<EventConfig>
) {
  if (event.dateOfEvent) {
    const eventDateFieldId = getDeclarationFields(event).find(
      ({ id }) => id === event.dateOfEvent?.$$field
    )
    if (!eventDateFieldId) {
      ctx.addIssue({
        code: 'custom',
        message: `Date of event field id must match a field id in fields array.
        Invalid date of event field ID for event ${event.id}: ${event.dateOfEvent.$$field}`,
        path: ['dateOfEvent']
      })
    } else if (eventDateFieldId.type !== FieldType.DATE) {
      ctx.addIssue({
        code: 'custom',
        message: `Field specified for date of event is of type: ${eventDateFieldId.type}, but it needs to be of type: ${FieldType.DATE}`,
        path: ['dateOfEvent.fieldType']
      })
    }
  }
}

export function validatePlaceOfEvent(
  event: EventConfig,
  ctx: z.RefinementCtx<EventConfig>
) {
  if (event.placeOfEvent) {
    const eventPlaceFieldId = getDeclarationFields(event).find(
      ({ id }) => id === event.placeOfEvent?.$$field
    )
    if (!eventPlaceFieldId) {
      ctx.addIssue({
        code: 'custom',
        message: `Place of event field id must match a field id in the event.declaration fields.
          Invalid place of event field ID for event ${event.id}: ${event.placeOfEvent.$$field}`,
        path: ['placeOfEvent']
      })
    }
  }
}

export function validateActionFlags(
  event: EventConfig,
  ctx: z.RefinementCtx<EventConfig>
) {
  const isInherentFlag = (value: unknown): value is InherentFlags =>
    Object.values(InherentFlags).includes(value as InherentFlags)

  // Validate that all referenced action flags are configured in the event flags array.
  const configuredFlagIds = event.flags.map((flag) => flag.id)
  const actionFlagIds = event.actions.flatMap((action) =>
    action.flags.map((flag) => flag.id)
  )

  for (const actionFlagId of actionFlagIds) {
    const isConfigured = configuredFlagIds.includes(actionFlagId)
    const isInherent = isInherentFlag(actionFlagId)

    if (!isConfigured && !isInherent) {
      ctx.addIssue({
        code: 'custom',
        message: `Action flag id must match an inherent flag or a configured flag in the flags array. Invalid action flag ID for event '${event.id}': '${actionFlagId}'`,
        path: ['actions']
      })
    }
  }
}

export function validateActionOrder(
  event: EventConfig,
  ctx: z.RefinementCtx<EventConfig>
) {
  if (event.actionOrder) {
    const customActionTypes = event.actions
      .filter((action) => action.type === ActionType.CUSTOM)
      .map((action) => action.customActionType)

    const validActionTypes: string[] = [
      ...workqueueActions.options,
      ...customActionTypes
    ]

    for (const actionType of event.actionOrder) {
      if (!validActionTypes.includes(actionType)) {
        ctx.addIssue({
          code: 'custom',
          message: `Invalid action type in action order: ${actionType}`,
          path: ['actionOrder']
        })
      }
    }
  }
}
