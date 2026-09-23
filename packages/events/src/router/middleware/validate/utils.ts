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

import { TRPCError } from '@trpc/server'
import { partition } from 'lodash'
import {
  ActionUpdate,
  errorMessages,
  EventConfig,
  EventState,
  EventValidatorContext,
  getDeclarationFields,
  ValidatorContext,
  StrictValidatorContext,
  UserValidatorContext
} from '@opencrvs/commons/events'
import {
  getOrThrow,
  flattenEntries,
  FieldConfig,
  runStructuralValidations,
  getActionAnnotationFields,
  ActionType,
  getActionFormFields,
  getActionConfig,
  findRecordActionPages,
  isVerificationPage
} from '@opencrvs/commons'
import { getTokenPayload } from '@opencrvs/commons/authentication'
import { getLeafLevelAdministrativeAreaIds } from '../../../storage/postgres/administrative-hierarchy/locations'

type ValidationError = {
  message: string
  id: string
  value: unknown
}

export function getVerificationPageErrors(
  verificationPageIds: string[],
  data: ActionUpdate
) {
  return verificationPageIds
    .map((pageId) => {
      const value = data[pageId]
      return typeof value !== 'boolean'
        ? {
            message: 'Verification page result is required',
            id: pageId,
            value
          }
        : null
    })
    .filter((error) => error !== null)
}

export function throwWhenNotEmpty(errors: unknown[]) {
  if (errors.length > 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: JSON.stringify(errors)
    })
  }
}

export function omitUncorrectableFields(
  eventConfig: EventConfig,
  declaration: EventState
) {
  const formFields = getDeclarationFields(eventConfig)

  const uncorrectableIds = new Set(
    formFields.filter((field) => field.uncorrectable).map((field) => field.id)
  )

  return Object.fromEntries(
    Object.entries(declaration).filter(([key]) => !uncorrectableIds.has(key))
  )
}

/**
 * Compares update vs cleaned payloads and returns an array of offending keys.
 */
export function getInvalidUpdateKeys<T>({
  update,
  cleaned
}: {
  update: T
  cleaned: T
}): ValidationError[] {
  const updateEntries = flattenEntries(update)
  const cleanedKeys = flattenEntries(cleaned).map(([key]) => key)

  return updateEntries
    .filter(([key]) => !cleanedKeys.includes(key))
    .map(([key, value]) => ({
      message: errorMessages.hiddenField.defaultMessage,
      id: key,
      value
    }))
}

/**
 * @deprecated getValidatorContext does not require context, but allows optionality.
 * @see getStrictValidatorContext
 */
export async function getValidatorContext({
  token,
  event
}: {
  token: string
  event?: EventValidatorContext
}): Promise<ValidatorContext> {
  const leafAdminStructureLocationIds =
    await getLeafLevelAdministrativeAreaIds()

  const user = getOrThrow(getTokenPayload(token), 'Token is missing.')

  return { leafAdminStructureLocationIds, user, event }
}

/**
 *
 * @returns ValidatorContext with event enforced and types cleaned up.
 */
export async function getStrictValidatorContext({
  token,
  user,
  event
}:
  | {
      user?: never
      token: string
      event: EventValidatorContext
    }
  | {
      token?: never
      user: UserValidatorContext
      event: EventValidatorContext
    }): Promise<StrictValidatorContext> {
  const leafAdminStructureLocationIds =
    await getLeafLevelAdministrativeAreaIds()

  if (token) {
    const tokenPayload = getOrThrow(getTokenPayload(token), 'Token is missing.')

    return {
      leafAdminStructureLocationIds,
      event,
      user: {
        sub: tokenPayload.sub,
        scope: tokenPayload.scope,
        userType: tokenPayload.userType,
        role: tokenPayload.role
      }
    }
  }

  return {
    leafAdminStructureLocationIds,
    event,
    // types prevent calling without user but inference won't work in this scenario.
    user: getOrThrow(user, 'User is missing.')
  }
}

/**
 * Determines whether values match the respected type / structure defined in the corresponding FieldConfig.
 * @returns list of fields with errors.
 */
function getStructuralFieldErrors({
  fields,
  values,
  context,
  fieldOverrides
}: {
  fields: FieldConfig[]
  values: ActionUpdate
  context: ValidatorContext
  fieldOverrides?: {
    required?: boolean
    conditionals: FieldConfig['conditionals']
  }
}) {
  return Object.entries(values).flatMap(([key, value]) => {
    const field = fields.find((f) => f.id === key)

    if (!field) {
      return {
        message: errorMessages.unexpectedField.defaultMessage,
        id: key,
        value
      }
    }

    return runStructuralValidations({
      field: { ...field, ...fieldOverrides },
      values,
      context
    }).map((error) => ({
      message: error.message.defaultMessage,
      id: field.id,
      value
    }))
  })
}

/**
 * Validate payload structure. Ensures annotation and declaration properties match configuration. Excludes conditionals.
 *
 */
export function validateActionPayloadStructure({
  input,
  eventConfig
}: {
  input: {
    type: ActionType
    declaration?: ActionUpdate | undefined
    annotation?: ActionUpdate | undefined
    customActionType?: string | undefined
  }
  eventConfig: EventConfig
}): void {
  const actionConfig = getActionConfig({
    eventConfiguration: eventConfig,
    actionType: input.type,
    customActionType:
      input.type === ActionType.CUSTOM ? input.customActionType : undefined
  })

  const annotationFields = [
    ...(actionConfig ? getActionAnnotationFields(actionConfig) : []),
    ...(input.type === ActionType.NOTIFY
      ? getActionFormFields(eventConfig, ActionType.NOTIFY)
      : [])
  ]

  // Clean up annotation for actions that do not have one.
  const annotation =
    actionConfig || annotationFields.length > 0 ? (input.annotation ?? {}) : {}

  const pages = findRecordActionPages(eventConfig, input.type)

  // Some actions allow passing in verification page id as boolean value.
  const verificationPageIds = pages
    .filter((page) => isVerificationPage(page))
    .map((page) => page.id)

  // Get all errors from annotation payload
  const annotationErrors = getStructuralFieldErrors({
    fields: annotationFields,
    values: annotation,
    context: {},
    fieldOverrides: {
      conditionals: [],
      required: false
    }
  })

  // Partition errors into verification page errors and other annotation errors
  const [verificationPageErrors, otherAnnotationErrors] = partition(
    annotationErrors,
    (ae) => verificationPageIds.includes(ae.id)
  )

  throwWhenNotEmpty([
    ...getStructuralFieldErrors({
      fields: getDeclarationFields(eventConfig),
      values: input.declaration ?? {},
      context: {},
      fieldOverrides: {
        conditionals: [],
        required: false
      }
    }),
    ...otherAnnotationErrors,
    ...getVerificationPageErrors(
      // Validate only verification page ids that are present, to ensure they are boolean values
      verificationPageErrors.map((ae) => ae.id),
      annotation
    )
  ])
}
