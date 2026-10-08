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
import { EventConfig, EventConfigInput } from './EventConfig'
import { ActionConfig } from './ActionConfig'
import { ActionType, WorkqueueActionType } from './ActionType'
import { InherentFlags } from './Flag'
import { findAllFields, getDeclarationFields } from './utils'
import { FieldType } from './FieldType'
import { EventFieldId } from './AdvancedSearchConfig'
import { isFieldReference } from '../conditionals/conditionals'
import { EventMetadataDateFieldIdInput } from './EventMetadata'

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
  if (event.dateOfEvent && isFieldReference(event.dateOfEvent)) {
    const dateOfEvent = event.dateOfEvent
    const eventDateFieldId = getDeclarationFields(event).find(
      ({ id }) => id === dateOfEvent.$$field
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
  } else if (event.dateOfEvent) {
    const dateOfEvent = event.dateOfEvent
    if (!EventMetadataDateFieldIdInput.options.includes(dateOfEvent.$$event)) {
      ctx.addIssue({
        code: 'custom',
        message: `Date of event field id must be a valid metadata field id.
        Invalid date of event metadata field ID for event ${event.id}: ${dateOfEvent.$$event}`,
        path: ['dateOfEvent']
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
    (action.flags ?? []).map((flag) => flag.id)
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
      ...WorkqueueActionType.options,
      ActionType.ASSIGN,
      ActionType.UNASSIGN,
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

/**
 * Runs on both the `defineConfig` input and the parsed `EventConfig`.
 *
 * @returns whether the event has a DECLARE action.
 */
export function validateHasDeclareAction<
  T extends { id: string; actions: Array<{ type: string }> }
>(event: T, ctx: z.RefinementCtx<T>): boolean {
  if (!event.actions.some((action) => action.type === ActionType.DECLARE)) {
    ctx.addIssue({
      code: 'custom',
      message: `Event must have a ${ActionType.DECLARE} action. Found none for event ${event.id}`,
      path: ['actions']
    })
    return false
  }

  return true
}

/**
 * Identifies an action across its versions. Custom actions are keyed apart from core
 * actions, so a custom action whose `customActionType` matches a core action type
 * (e.g. 'DECLARE') is not taken for a version of it.
 */
function getActionVersionKey(action: ActionConfig) {
  return action.type === ActionType.CUSTOM
    ? `${ActionType.CUSTOM}.${action.customActionType}`
    : action.type
}

function describeAction(action: ActionConfig) {
  return action.type === ActionType.CUSTOM
    ? `Custom action '${action.customActionType}'`
    : `Action '${action.type}'`
}

/**
 * Versions of an action are told apart by `effectiveFrom`, so no two versions
 * may share one, and at most one may omit it (effective from the beginning of time).
 */
export function validateActionVersions(
  event: EventConfig,
  ctx: z.RefinementCtx<EventConfig>
) {
  const seenEffectiveFroms = new Map<string, Set<string | undefined>>()

  event.actions.forEach((action, index) => {
    const key = getActionVersionKey(action)
    const effectiveFroms =
      seenEffectiveFroms.get(key) ?? new Set<string | undefined>()
    seenEffectiveFroms.set(key, effectiveFroms)

    if (!effectiveFroms.has(action.effectiveFrom)) {
      effectiveFroms.add(action.effectiveFrom)
      return
    }

    ctx.addIssue({
      code: 'custom',
      message: action.effectiveFrom
        ? `${describeAction(action)} of event '${event.id}' has more than one version with \`effectiveFrom\` '${action.effectiveFrom}'. Each version must have a different \`effectiveFrom\`.`
        : `${describeAction(action)} of event '${event.id}' has more than one version without \`effectiveFrom\`. At most one version may omit it.`,
      path: ['actions', index, 'effectiveFrom']
    })
  })
}

/**
 * `declaration` must be given exactly once for every version of the DECLARE action:
 * at the top level (kept for backwards compatibility, and then shared by every version)
 * or on every version itself. Mixing the two is rejected.
 */
export function validateDeclarationGivenExactlyOnce(
  config: EventConfigInput,
  ctx: z.RefinementCtx<EventConfigInput>
) {
  const declareVersions = config.actions.flatMap((action, index) =>
    action.type === ActionType.DECLARE ? [{ action, index }] : []
  )
  const withDeclaration = declareVersions.filter(
    ({ action }) => !!action.declaration
  )
  const withoutDeclaration = declareVersions.filter(
    ({ action }) => !action.declaration
  )
  const onTopLevel = !!config.declaration
  const isVersioned = declareVersions.length > 1

  const describe = (versions: typeof declareVersions) =>
    versions
      .map(({ action, index }) =>
        !isVersioned
          ? `\`actions[${index}].declaration\``
          : `\`actions[${index}].declaration\` (${action.effectiveFrom ? `\`effectiveFrom\` '${action.effectiveFrom}'` : 'no `effectiveFrom`'})`
      )
      .join(', ')

  if (onTopLevel && withDeclaration.length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: !isVersioned
        ? `Event '${config.id}' defines \`declaration\` both at the top level and on the ${ActionType.DECLARE} action (${describe(withDeclaration)}). Define it in only one of these places.`
        : `Event '${config.id}' defines \`declaration\` both at the top level and on versions of the ${ActionType.DECLARE} action (${describe(withDeclaration)}). Define it either only at the top level, to share it across every version, or on every version and not at the top level.`,
      path: ['declaration']
    })
    return
  }

  if (onTopLevel || withoutDeclaration.length === 0) {
    return
  }

  ctx.addIssue({
    code: 'custom',
    message:
      withDeclaration.length > 0
        ? `Event '${config.id}' defines \`declaration\` on some versions of the ${ActionType.DECLARE} action but not on ${describe(withoutDeclaration)}. Define it on every version, or remove it from every version and define it once at the top level.`
        : `Event '${config.id}' does not define \`declaration\`. Define it either at the top level or on ${isVersioned ? 'every version of ' : ''}the ${ActionType.DECLARE} action (${describe(withoutDeclaration)}).`,
    path: ['declaration']
  })
}
