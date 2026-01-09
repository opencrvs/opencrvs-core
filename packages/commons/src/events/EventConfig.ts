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
import { ActionConfig } from './ActionConfig'
import { SummaryConfig } from './SummaryConfig'
import { TranslationConfig } from './TranslationConfig'
import { AdvancedSearchConfig, EventFieldId } from './AdvancedSearchConfig'
import { findAllFields, getDeclarationFields } from './utils'
import { DeclarationFormConfig } from './FormConfig'
import { FieldType } from './FieldType'
import { FieldReference } from './FieldConfig'
import { FlagConfig, InherentFlags } from './Flag'
import { ActionType, workqueueActions } from './ActionType'

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 *
 * `Event.parse(config)` will throw an error if the configuration is invalid.
 */
export const EventConfig = z
  .object({
    id: z
      .string()
      .describe(
        'Machine-readable identifier of the event (e.g. "birth", "death").'
      ),
    dateOfEvent: FieldReference.optional().describe(
      'Reference to the field capturing the date of the event (e.g. date of birth). Defaults to the event creation date if unspecified.'
    ),
    placeOfEvent: FieldReference.optional().describe(
      'Reference to the field capturing the place of the event (e.g. place of birth). Defaults to the meta.createdAtLocation if unspecified.'
    ),
    title: TranslationConfig.describe(
      'Title template for the singular event, supporting variables (e.g. "{applicant.name.firstname} {applicant.name.surname}").'
    ),
    fallbackTitle: TranslationConfig.optional().describe(
      'Fallback title shown when the main title resolves to an empty value.'
    ),
    summary: SummaryConfig.describe(
      'Summary information displayed in the event overview.'
    ),
    label: TranslationConfig.describe(
      'Human-readable label for the event type.'
    ),
    actions: z
      .array(ActionConfig)
      .describe(
        'Configuration of system-defined actions associated with the event.'
      ),
    actionOrder: z
      .array(z.string())
      .optional()
      .describe(
        'Order of actions in the action menu. Use either the action type for core actions or the customActionType for custom actions.'
      ),
    declaration: DeclarationFormConfig.describe(
      'Configuration of the form used to gather event data.'
    ),
    advancedSearch: z
      .array(AdvancedSearchConfig)
      .optional()
      .default([])
      .describe(
        'Configuration of fields available in the advanced search feature.'
      ),
    flags: z
      .array(FlagConfig)
      .optional()
      .default([])
      .describe(
        'Configuration of flags associated with the actions of this event type.'
      )
  })
  .superRefine((event, ctx) => {
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

    // Validate that action order contains only valid core or custom action types.
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
  })
  .meta({
    id: 'EventConfig'
  })
  .describe('Configuration defining an event type.')

export type EventConfig = z.infer<typeof EventConfig>
