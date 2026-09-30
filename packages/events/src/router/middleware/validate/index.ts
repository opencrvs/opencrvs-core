/* eslint-disable max-lines */
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
  MiddlewareResult,
  TRPCError
} from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import {
  ActionInputWithType,
  ActionType,
  ActionUpdate,
  AnnotationActionType,
  DeclarationActions,
  DeclarationUpdateActionType,
  DeclarationUpdateActions,
  EventConfig,
  FieldConfig,
  annotationActions,
  deepDropNulls,
  deepMerge,
  errorMessages,
  findRecordActionPages,
  getActionFormFields,
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
  ValidatorContext,
  flattenFormState,
  getCustomActionFields,
  EventInput,
  UUID,
  getDeclarationFieldById,
  StrictValidatorContext
} from '@opencrvs/commons/events'

import { getEventConfigurationById } from '@events/service/config/config'
import { RequestNotFoundError } from '@events/service/events/actions/correction'
import { getEventById } from '@events/service/events/events'
import { locationExists } from '@events/storage/postgres/administrative-hierarchy/locations'
import { TrpcContext } from '@events/context'
import {
  getInvalidUpdateKeys,
  getVerificationPageErrors,
  throwWhenNotEmpty,
  omitUncorrectableFields,
  getStrictValidatorContext,
  validateActionPayloadStructure
} from './utils'

export function getFieldErrors(
  fields: FieldConfig[],
  data: ActionUpdate,
  context: ValidatorContext
) {
  const visibleFields = fields.filter((field) =>
    isFieldVisible(field, data, context)
  )

  const visibleFieldIds = visibleFields.map((field) => field.id)

  const hiddenFieldIds = fields
    .filter(
      (field) =>
        // If field is not visible and not in the visible fields list, it is a hidden field
        // We need to check against the visible fields list because there might be fields with same ids, one of which is visible and others are hidden
        !isFieldVisible(field, data, context) &&
        !visibleFieldIds.includes(field.id)
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
    const fieldErrors = flattenFormState(
      runFieldValidations({
        field,
        value: data[field.id],
        form: data,
        context
      })
    ).flatMap(([, errors]) => errors)

    return fieldErrors.map((error) => ({
      message: error.message.defaultMessage,
      id: field.id,
      value: data[field.id as keyof typeof data]
    }))
  })

  return [...hiddenFieldErrors, ...visibleFieldErrors]
}

function validateDeclarationUpdateAction({
  eventConfig,
  actionType,
  declarationUpdate,
  annotation,
  context
}: {
  eventConfig: EventConfig
  actionType: DeclarationUpdateActionType
  declarationUpdate: ActionUpdate
  annotation?: ActionUpdate
  context: StrictValidatorContext
}) {
  /*
   * Declaration allows partial updates. Updates are validated against primitive types (zod) and field based custom validators (JSON schema).
   * We need to validate the update against the cleaned declaration, which is a merged version of the previous declaration and the update.
   */

  const declarationConfig = getDeclaration(eventConfig)
  // 1. Merge declaration update with previous declaration to validate based on the right conditional rules
  const previousDeclaration = context.event.state.declaration

  // at this stage, there could be a situation where the toggle (.e.g. dob unknown) is applied but payload would still have both age and dob.
  const mergedDeclaration = deepMerge(previousDeclaration, declarationUpdate)

  // 2. Check for any invalid key that doesn't exist in declaration config
  // getDeclarationFieldById will throw if any field is not in the declaration config
  Object.keys(mergedDeclaration).forEach((key) => {
    getDeclarationFieldById(eventConfig, key)
  })

  // For REQUEST_CORRECTION, `previousDeclaration` may contain uncorrectable fields that are conditionally hidden.
  // When merged into `completeDeclaration`, these hidden uncorrectable fields would incorrectly trigger
  // "Hidden or disabled field should not receive a value" error during invalid key check.
  // We cannot resolve this by sending them as null in `declarationUpdate` either,
  // because `validateCorrectableFields` below rejects any uncorrectable field in a REQUEST_CORRECTION.
  // Stripping uncorrectable fields from `completeDeclaration` (which is previousDeclaration + declarationUpdate) entirely is the only clean solution —
  // and it's safe because `validateCorrectableFields` already catches the case where
  // the client wrongly includes uncorrectable fields in `declarationUpdate`.
  const completeDeclaration = deepDropNulls(
    actionType === ActionType.REQUEST_CORRECTION
      ? omitUncorrectableFields(eventConfig, mergedDeclaration)
      : mergedDeclaration
  )

  // 3. Strip declaration of hidden fields. Without additional checks, client could send an update with hidden fields that are malformed
  // (e.g. when dob is unknown and user has send the age previously. Now they only send dob, without setting dob unknown to false).
  const cleanedDeclaration = omitHiddenPaginatedFields(
    declarationConfig,
    completeDeclaration,
    context
  )

  // 4. When the submitted declaration update has fields that are not in the cleaned declaration, payload is invalid.
  // Only check keys from declarationUpdate (the client's input), not fields inherited from the previous state
  // that may have become hidden due to changes in the current update.
  const declarationUpdateOnlyComplete = Object.fromEntries(
    Object.entries(completeDeclaration).filter(
      ([key]) => key in declarationUpdate
    )
  )
  const invalidKeys = getInvalidUpdateKeys({
    update: declarationUpdateOnlyComplete,
    cleaned: cleanedDeclaration
  })

  if (invalidKeys.length > 0) {
    return invalidKeys
  }

  // 5. Validate declaration update against conditional rules, taking into account conditional pages.
  const allVisiblePageFields = declarationConfig.pages
    .filter((page) => isPageVisible(page, cleanedDeclaration, context))
    .flatMap((page) => page.fields)

  const declarationErrors = getFieldErrors(
    allVisiblePageFields,
    cleanedDeclaration,
    context
  )

  const declarationActionParse = DeclarationActions.safeParse(actionType)

  // 6. Validate against action review fields and dialog form fields, if applicable.
  // Dialog form fields are validated with `required` relaxed: combined flows
  // (e.g. declare+register) only collect the final action's dialog fields, so
  // intermediate actions legitimately arrive without their own.
  const reviewFields = declarationActionParse.success
    ? [
        ...getActionReviewFields(eventConfig, declarationActionParse.data),
        ...getActionFormFields(eventConfig, declarationActionParse.data).map(
          (formField) => ({ ...formField, required: false })
        )
      ]
    : []

  const annotationContext = { ...context, baseFormState: cleanedDeclaration }

  const visibleAnnotationFields = omitHiddenFields(
    reviewFields,
    deepDropNulls(annotation ?? {}),
    annotationContext
  )

  const annotationErrors = getFieldErrors(
    reviewFields,
    visibleAnnotationFields,
    annotationContext
  )

  return [...declarationErrors, ...annotationErrors]
}

function validateActionAnnotation({
  eventConfig,
  actionType,
  annotation = {},
  context
}: {
  eventConfig: EventConfig
  actionType: AnnotationActionType
  annotation?: ActionUpdate
  context: StrictValidatorContext
}) {
  const pages = findRecordActionPages(eventConfig, actionType)

  const visibleVerificationPageIds = getVisibleVerificationPageIds(
    pages,
    annotation,
    context
  )

  const formFields = [
    ...pages.flatMap(({ fields }) => fields.flatMap((field) => field)),
    ...getActionFormFields(eventConfig, actionType)
  ]

  const errors = [
    ...getFieldErrors(formFields, annotation, {
      ...context,
      baseFormState: context.baseFormState ?? context.event.state.declaration
    }),
    ...getVerificationPageErrors(visibleVerificationPageIds, annotation)
  ]

  return errors
}

function validateCustomAction({
  eventConfig,
  annotation = {},
  context,
  customActionType
}: {
  eventConfig: EventConfig
  annotation?: ActionUpdate
  context: ValidatorContext
  customActionType: string
}) {
  const customActionFields = getCustomActionFields(
    eventConfig,
    customActionType
  )
  return getFieldErrors(customActionFields, annotation, context)
}

export function validateNotifyAction({
  eventConfig,
  annotation = {},
  declaration = {},
  context
}: {
  eventConfig: EventConfig
  annotation?: ActionUpdate
  declaration: ActionUpdate
  context: ValidatorContext
}) {
  const declarationConfig = getDeclaration(eventConfig)
  const formFields = declarationConfig.pages.flatMap(({ fields }) =>
    fields.flatMap((field) => field)
  )

  const reviewFields = [
    ...getActionReviewFields(eventConfig, ActionType.DECLARE),
    ...getActionFormFields(eventConfig, ActionType.NOTIFY)
  ]

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
        values: annotation,
        context
      })

      return fieldErrors.map((error) => ({
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
        values: declaration,
        context,
        actionType: ActionType.NOTIFY
      })

      return fieldErrors.map((error) => ({
        message: error.message.defaultMessage,
        id: field.id,
        value: declaration[field.id]
      }))
    }
  )

  return [...annotationErrors, ...declarationErrors]
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

/** Applies action specific rules for the input and throws on error. */
function validateAction({
  input,
  eventConfig,
  context
}: {
  input: ActionInputWithType
  eventConfig: EventConfig
  context: StrictValidatorContext
}): void {
  if (input.type === ActionType.NOTIFY || input.type === ActionType.EDIT) {
    throwWhenNotEmpty(
      validateNotifyAction({
        eventConfig,
        annotation: input.annotation,
        declaration: input.declaration,
        context
      })
    )

    return
  }

  if (input.type === ActionType.REQUEST_CORRECTION) {
    throwWhenNotEmpty(
      validateCorrectableFields({
        eventConfig,
        declarationUpdate: input.declaration
      })
    )
  }

  if (
    input.type === ActionType.APPROVE_CORRECTION ||
    input.type === ActionType.REJECT_CORRECTION
  ) {
    const correctionRequestAction = context.event.document.actions.find(
      (a) =>
        a.id === input.requestId && a.type === ActionType.REQUEST_CORRECTION
    )

    if (!correctionRequestAction) {
      throw new RequestNotFoundError(input.requestId)
    }
  }

  if (input.type === ActionType.CUSTOM) {
    throwWhenNotEmpty(
      validateCustomAction({
        eventConfig,
        annotation: input.annotation,
        context,
        customActionType: input.customActionType
      })
    )

    return
  }

  const declarationUpdateAction = DeclarationUpdateActions.safeParse(input.type)

  if (declarationUpdateAction.success) {
    throwWhenNotEmpty(
      validateDeclarationUpdateAction({
        eventConfig,
        declarationUpdate: input.declaration,
        annotation: input.annotation,
        actionType: declarationUpdateAction.data,
        context
      })
    )

    return
  }

  const annotationActionParse = annotationActions.safeParse(input.type)

  if (annotationActionParse.success) {
    throwWhenNotEmpty(
      validateActionAnnotation({
        eventConfig,
        annotation: input.annotation,
        actionType: annotationActionParse.data,
        context
      })
    )

    return
  }

  throw new Error('Trying to validate unsupported action type')
}

export const validateRequestAction: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  unknown,
  unknown,
  ActionInputWithType
> = async ({ input, next, ctx }) => {
  const event = await getEventById(input.eventId)
  const eventConfig = await getEventConfigurationById({
    eventType: event.type,
    token: ctx.token
  })

  const eventState = getCurrentEventState(event, eventConfig)

  const context = await getStrictValidatorContext({
    token: ctx.token,
    event: { document: event, state: eventState }
  })

  validateAction({
    input,
    eventConfig,
    context
  })

  return next()
}

/**
 * Guard for validating .accept action.
 * accept is called by system user when response could not be returned immediately.
 *
 * Accept should only be called by system user type, and limited in use.
 */
export const validateAcceptAction: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  unknown,
  unknown,
  ActionInputWithType
> = async ({ input, next, ctx }) => {
  const event = await getEventById(input.eventId)
  const eventConfig = await getEventConfigurationById({
    eventType: event.type,
    token: ctx.token
  })

  validateActionPayloadStructure({
    input,
    eventConfig
  })

  return next()
}

// When performing actions via REST API, we need to ensure that a valid 'createdAtLocation' is provided in the payload.
// For normal users, the createdAtLocation is resolved on the backend from the user's primaryOfficeId.
// eslint-disable-next-line no-restricted-syntax
const requireCreatedAtLocationForSystemUser = async <
  T extends { createdAtLocation?: UUID | null | undefined }
>({
  input,
  next,
  ctx
}: {
  input: T
  next: () => Promise<MiddlewareResult<TrpcContext>>
  ctx: TrpcContext
}) => {
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
      message: 'createdAtLocation is required and must be a valid location id'
    })
  }

  const isLocationId = await locationExists(input.createdAtLocation)

  if (!isLocationId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'createdAtLocation must be a valid location id'
    })
  }

  return next()
}

export const requireLocationForSystemUserEventCreate: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  EventInput
> = requireCreatedAtLocationForSystemUser

export const requireLocationForSystemUserAction: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  ActionInputWithType
> = requireCreatedAtLocationForSystemUser
