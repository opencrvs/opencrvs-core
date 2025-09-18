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
  MiddlewareFunction,
  TRPCError
} from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import {
  ActionInputWithType,
  ActionType,
  ActionUpdate,
  AnnotationActionType,
  ApproveCorrectionActionInput,
  DeclarationActions,
  DeclarationUpdateActionType,
  DeclarationUpdateActions,
  EventConfig,
  EventDocument,
  EventState,
  FieldConfig,
  RejectCorrectionActionInput,
  annotationActions,
  deepDropNulls,
  deepMerge,
  errorMessages,
  findRecordActionPages,
  getActionReviewFields,
  getCurrentEventState,
  getDeclaration,
  getVisibleVerificationPageIds,
  isFieldVisible,
  isPageVisible,
  omitHiddenFields,
  omitHiddenPaginatedFields,
  runFieldValidations,
  runStructuralValidations,
  Location
} from '@opencrvs/commons/events'
import { getEventConfigurationById } from '@events/service/config/config'
import { RequestNotFoundError } from '@events/service/events/actions/correction'
import { getEventById } from '@events/service/events/events'
import { isLeafLocation } from '@events/storage/postgres/events/locations'
import { TrpcContext } from '@events/context'
import { getLocations } from '@events/service/locations/locations'
import {
  getInvalidUpdateKeys,
  getVerificationPageErrors,
  throwWhenNotEmpty
} from './utils'

export function getFieldErrors(
  fields: FieldConfig[],
  data: ActionUpdate,
  declaration: EventState = {},
  context?: { locations: Array<Location> }
) {
  const visibleFields = fields.filter((field) =>
    isFieldVisible(field, { ...data, ...declaration })
  )

  const visibleFieldIds = visibleFields.map((field) => field.id)

  const hiddenFieldIds = fields
    .filter(
      (field) =>
        // If field is not visible and not in the visible fields list, it is a hidden field
        // We need to check against the visible fields list because there might be fields with same ids, one of which is visible and others are hidden
        !isFieldVisible(field, data) && !visibleFieldIds.includes(field.id)
    )
    .map((field) => field.id)

  // Add errors if there are any hidden fields sent in the payloa
  const hiddenFieldErrors = hiddenFieldIds.flatMap((fieldId) => {
    if (data[fieldId as keyof typeof data]) {
      return {
        message: errorMessages.hiddenField.defaultMessage,
        id: fieldId,
        value: data[fieldId as keyof typeof data]
      }
    }

    return []
  })

  // For visible fields, run the field validations as configured
  const visibleFieldErrors = visibleFields.flatMap((field) => {
    const fieldErrors = runFieldValidations({
      field,
      values: data,
      context
    })

    return fieldErrors.errors.map((error) => ({
      message: error.message.defaultMessage,
      id: field.id,
      value: data[field.id as keyof typeof data]
    }))
  })

  return [...hiddenFieldErrors, ...visibleFieldErrors]
}

function validateDeclarationUpdateAction({
  eventConfig,
  event,
  actionType,
  declarationUpdate,
  annotation,
  context
}: {
  eventConfig: EventConfig
  event: EventDocument
  actionType: DeclarationUpdateActionType
  declarationUpdate: ActionUpdate
  annotation?: ActionUpdate
  context: { locations: Array<Location> }
}) {
  /*
   * Declaration allows partial updates. Updates are validated against primitive types (zod) and field based custom validators (JSON schema).
   * We need to validate the update against the cleaned declaration, which is a merged version of the previous declaration and the update.
   */

  // 1. Merge declaration update with previous declaration to validate based on the right conditional rules
  const previousDeclaration = getCurrentEventState(
    event,
    eventConfig
  ).declaration
  // at this stage, there could be a situation where the toggle (.e.g. dob unknown) is applied but payload would still have both age and dob.
  const completeDeclaration = deepMerge(previousDeclaration, declarationUpdate)

  const declarationConfig = getDeclaration(eventConfig)

  // 2. Strip declaration of hidden fields. Without additional checks, client could send an update with hidden fields that are malformed
  // (e.g. when dob is unknown anduser has send the age previously.Now they only send dob, without setting dob unknown to false).
  const cleanedDeclaration = omitHiddenPaginatedFields(
    declarationConfig,
    completeDeclaration
  )

  // 3. When declaration update has fields that are not in the cleaned declaration, payload is invalid.
  // Even though it could work when cleaned and merged, it would make it harder to use the `getCurrentEventState` function.
  const invalidKeys = getInvalidUpdateKeys({
    update: declarationUpdate,
    cleaned: cleanedDeclaration
  })

  if (invalidKeys.length > 0) {
    return invalidKeys
  }

  // 4. Validate declaration update against conditional rules, taking into account conditional pages.
  const allVisiblePageFields = declarationConfig.pages
    .filter((page) => isPageVisible(page, cleanedDeclaration))
    .flatMap((page) => page.fields)

  const declarationErrors = getFieldErrors(
    allVisiblePageFields,
    cleanedDeclaration,
    {},
    context
  )

  const declarationActionParse = DeclarationActions.safeParse(actionType)

  // 5. Validate against action review fields, if applicable
  const reviewFields = declarationActionParse.success
    ? getActionReviewFields(eventConfig, declarationActionParse.data)
    : []

  const visibleAnnotationFields = omitHiddenFields(
    reviewFields,
    deepDropNulls(annotation ?? {})
  )

  const annotationErrors = getFieldErrors(
    reviewFields,
    visibleAnnotationFields,
    {}
  )

  return [...declarationErrors, ...annotationErrors]
}

function validateActionAnnotation({
  eventConfig,
  actionType,
  annotation = {},
  declaration = {}
}: {
  eventConfig: EventConfig
  actionType: AnnotationActionType
  annotation?: ActionUpdate
  declaration: EventState
}) {
  const pages = findRecordActionPages(eventConfig, actionType)

  const visibleVerificationPageIds = getVisibleVerificationPageIds(
    pages,
    annotation
  )

  const formFields = pages.flatMap(({ fields }) =>
    fields.flatMap((field) => field)
  )

  const errors = [
    ...getFieldErrors(formFields, annotation, declaration),
    ...getVerificationPageErrors(visibleVerificationPageIds, annotation)
  ]

  return errors
}

function validateNotifyAction({
  eventConfig,
  annotation = {},
  declaration = {}
}: {
  eventConfig: EventConfig
  annotation?: ActionUpdate
  declaration: ActionUpdate
}) {
  const declarationConfig = getDeclaration(eventConfig)

  const formFields = declarationConfig.pages.flatMap(({ fields }) =>
    fields.flatMap((field) => field)
  )

  const reviewFields = getActionReviewFields(eventConfig, ActionType.DECLARE)

  const annotationErrors = Object.entries(annotation).flatMap(
    ([key, value]) => {
      const field = reviewFields.find((f) => f.id === key)

      if (!field) {
        return {
          message: errorMessages.unexpectedField.defaultMessage,
          id: key,
          value
        }
      }

      const fieldErrors = runStructuralValidations({
        field,
        values: annotation
      })

      return fieldErrors.errors.map((error) => ({
        message: error.message.defaultMessage,
        id: field.id,
        value: annotation[field.id]
      }))
    }
  )

  const declarationErrors = Object.entries(declaration).flatMap(
    ([key, value]) => {
      const field = formFields.find((f) => f.id === key)

      if (!field) {
        return {
          message: errorMessages.unexpectedField.defaultMessage,
          id: key,
          value
        }
      }

      const fieldErrors = runStructuralValidations({
        field: { ...field, required: false },
        values: declaration
      })

      return fieldErrors.errors.map((error) => ({
        message: error.message.defaultMessage,
        id: field.id,
        value: declaration[field.id]
      }))
    }
  )

  return [...annotationErrors, ...declarationErrors]
}

function throwIfRequestActionNotFound(
  storedEvent: EventDocument,
  input: ApproveCorrectionActionInput | RejectCorrectionActionInput
) {
  const correctionRequestAction = storedEvent.actions.find(
    (a) => a.id === input.requestId && a.type === ActionType.REQUEST_CORRECTION
  )

  if (!correctionRequestAction) {
    throw new RequestNotFoundError(input.requestId)
  }
}

/*
 * For request correction, we need to validate that the payload does not contain fields that are configured as not correctable,
 * i.e. configured with the 'uncorrectable' flag set to true.
 */
function validateCorrectableFields({
  eventConfig,
  declarationUpdate
}: {
  eventConfig: EventConfig
  declarationUpdate: ActionUpdate
}) {
  const declarationConfig = getDeclaration(eventConfig)
  const formFields = declarationConfig.pages.flatMap(({ fields }) => fields)
  const nonCorrecrableFields = formFields.filter((field) => field.uncorrectable)

  const errors = Object.entries(declarationUpdate).flatMap(([key, value]) => {
    const field = formFields.find((f) => f.id === key)

    if (field && nonCorrecrableFields.includes(field)) {
      return {
        message: errorMessages.correctionNotAllowed.defaultMessage,
        id: key,
        value
      }
    }

    return []
  })

  return errors
}

export const validateAction: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  unknown,
  unknown,
  ActionInputWithType
> = async ({ input, next, ctx }) => {
  const actionType = input.type

  const locations = await getLocations()
  const adminStructureLocations = locations.filter(
    (location) => location.locationType === 'ADMIN_STRUCTURE'
  )

  const event = await getEventById(input.eventId)
  const eventConfig = await getEventConfigurationById({
    eventType: event.type,
    token: ctx.token
  })

  const declaration = getCurrentEventState(event, eventConfig).declaration

  if (actionType === ActionType.NOTIFY) {
    const errors = validateNotifyAction({
      eventConfig,
      annotation: input.annotation,
      declaration: input.declaration
    })

    throwWhenNotEmpty(errors)
    return next()
  }

  if (actionType === ActionType.REQUEST_CORRECTION) {
    const errors = validateCorrectableFields({
      eventConfig,
      declarationUpdate: input.declaration
    })

    throwWhenNotEmpty(errors)
  }

  if (
    actionType === ActionType.APPROVE_CORRECTION ||
    actionType === ActionType.REJECT_CORRECTION
  ) {
    throwIfRequestActionNotFound(event, input)
  }

  const declarationUpdateAction = DeclarationUpdateActions.safeParse(actionType)

  if (declarationUpdateAction.success) {
    const errors = validateDeclarationUpdateAction({
      eventConfig,
      event,
      declarationUpdate: input.declaration,
      annotation: input.annotation,
      actionType: declarationUpdateAction.data,
      context: { locations: adminStructureLocations }
    })

    throwWhenNotEmpty(errors)
    return next()
  }

  const annotationActionParse = annotationActions.safeParse(actionType)

  if (annotationActionParse.success) {
    const errors = validateActionAnnotation({
      eventConfig,
      annotation: input.annotation,
      actionType: annotationActionParse.data,
      declaration
    })

    throwWhenNotEmpty(errors)
    return next()
  }

  throw new Error('Trying to validate unsupported action type')
}

// When performing actions via REST API, we need to ensure that a valid 'createdAtLocation' is provided in the payload.
// For normal users, the createdAtLocation is resolved on the backend from the user's primaryOfficeId.
export const requireLocationForSystemUserAction: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  ActionInputWithType
> = async ({ input, next, ctx }) => {
  const { user } = ctx

  if (user.type !== 'system') {
    if (input.createdAtLocation) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'createdAtLocation is not allowed for non-system users'
      })
    }

    return next()
  }

  if (!input.createdAtLocation) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'createdAtLocation is required and must be a valid office id'
    })
  }

  // Ensure given location is a leaf location, i.e. an office location
  const isLeaf = await isLeafLocation(input.createdAtLocation)
  if (!isLeaf) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'createdAtLocation must be an office location'
    })
  }

  return next()
}
