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
import {
  ActionType,
  ActionUpdate,
  DeclarationUpdateActions,
  AnnotationActionType,
  EventConfig,
  FieldConfig,
  FieldUpdateValue,
  getFieldValidationErrors,
  Inferred,
  isPageVisible,
  isVerificationPage,
  annotationActions,
  findRecordActionPages,
  DeclarationUpdateActionType,
  getActionReviewFields,
  getDeclaration,
  getVisiblePagesFormFields,
  DeclarationActions,
  getCurrentEventState,
  stripHiddenFields,
  EventDocument,
  getDeclarationFields,
  deepMerge,
  IndexMap,
  deepDropNulls
} from '@opencrvs/commons/events'
import { getEventConfigurationById } from '@events/service/config/config'
import { getEventById } from '@events/service/events/events'
import { ActionMiddlewareOptions } from '@events/router/middleware/utils'

function getFormFieldErrors(formFields: Inferred[], data: ActionUpdate) {
  return formFields.reduce(
    (
      errorResults: {
        message: string
        id: string
        value: FieldUpdateValue
      }[],
      field: FieldConfig
    ) => {
      const fieldErrors = getFieldValidationErrors({
        field,
        values: data
      }).errors

      if (fieldErrors.length === 0) {
        return errorResults
      }

      // For backend, use the default message without translations.
      const errormessageWithId = fieldErrors.map((error) => ({
        message: error.message.defaultMessage,
        id: field.id,
        value: data[field.id as keyof typeof data]
      }))

      return [...errorResults, ...errormessageWithId]
    },
    []
  )
}

function getVerificationPageErrors(
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

function throwWhenNotEmpty(errors: unknown[]) {
  if (errors.length > 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: JSON.stringify(errors)
    })
  }
}

function validateDeclarationUpdateAction({
  eventConfig,
  event,
  actionType,
  declarationUpdate,
  annotation
}: {
  eventConfig: EventConfig
  event: EventDocument
  actionType: DeclarationUpdateActionType
  declarationUpdate: ActionUpdate
  // @TODO: annotation is always specific to action. Is there ever a need for nulls?
  annotation?: ActionUpdate
}) {
  /* Declaration update is a partial update. We validate updates based on conditional rules and data type rules.
   * There might be a case where update includes bad data [say, a date not following zod.string().date()].
   * When data is visible based on conditional rules, it might be that the data point gets hidden. Hidden data points are ignored
   */

  // 1. validate declaration update data types
  const allDeclarationFields = getDeclarationFields(eventConfig)

  // 1.1. Create a map of all fields to validate against. For example, in birth there are > 100 fields.
  const fieldMap = allDeclarationFields.reduce(
    (acc: IndexMap<FieldConfig>, field) => ({
      ...acc,
      [field.id]: field
    }),
    {}
  )

  const validationErrors = Object.entries(declarationUpdate).flatMap(
    ([key, value]) => {
      const field = fieldMap[key]
      if (!field) {
        return [
          {
            message: `Field ${key} not found in declaration`,
            id: key,
            value
          }
        ]
      }

      return getFieldValidationErrors({
        field,
        values: declarationUpdate,
        ignoreHiddenFields: true
      }).errors.map((error) => ({
        message: error.message.defaultMessage,
        id: field.id,
        value
      }))
    }
  )

  if (validationErrors.length > 0) {
    return validationErrors
  }

  // 2. Merge declaration update with previous declaration to validate based on conditional rules
  const previousDeclaration = getCurrentEventState(event).declaration
  const completeDeclaration = deepMerge(previousDeclaration, declarationUpdate)

  const declarationConfig = getDeclaration(eventConfig)

  // 3. Clean declaration to remove hidden fields. Without additional checks, client could send an update, that would include only hidden fields. (e.g. conditional toggle between 2 fields, where the value is updated but not the toggle)
  const cleanedDeclaration = stripHiddenFields(
    getVisiblePagesFormFields(declarationConfig, completeDeclaration),
    deepDropNulls(completeDeclaration)
  )

  // 4. Validate declaration update against conditional rules, taking into account conditional pages.
  const declarationErrors = declarationConfig.pages
    .filter((page) => isPageVisible(page, cleanedDeclaration))
    .flatMap((page) => getFormFieldErrors(page.fields, cleanedDeclaration))

  const declarationActionParse = DeclarationActions.safeParse(actionType)

  // 5. Validate against action review fields, if applicable
  const reviewFields = declarationActionParse.success
    ? getActionReviewFields(eventConfig, declarationActionParse.data)
    : []

  const visibleAnnotationFields = stripHiddenFields(
    reviewFields,
    deepDropNulls(annotation ?? {})
  )

  const annotationErrors = getFormFieldErrors(
    reviewFields,
    visibleAnnotationFields
  )

  return [...declarationErrors, ...annotationErrors]
}

function validateActionAnnotation({
  eventConfig,
  actionType,
  annotation = {}
}: {
  eventConfig: EventConfig
  actionType: AnnotationActionType
  annotation?: ActionUpdate
}) {
  const pages = findRecordActionPages(eventConfig, actionType)

  const visibleVerificationPageIds = pages
    .filter((page) => isVerificationPage(page))
    .filter((page) => isPageVisible(page, annotation))
    .map((page) => page.id)

  const formFields = pages.flatMap(({ fields }) =>
    fields.flatMap((field) => field)
  )

  const errors = [
    ...getFormFieldErrors(formFields, annotation),
    ...getVerificationPageErrors(visibleVerificationPageIds, annotation)
  ]

  return errors
}

export function validateAction(actionType: ActionType) {
  return async ({ input, ctx, next }: ActionMiddlewareOptions) => {
    const event = await getEventById(input.eventId)

    const eventConfig = await getEventConfigurationById({
      token: ctx.token,
      eventType: event.type
    })

    const declarationUpdateAction =
      DeclarationUpdateActions.safeParse(actionType)

    if (declarationUpdateAction.success) {
      const errors = validateDeclarationUpdateAction({
        eventConfig,
        event,
        declarationUpdate: input.declaration,
        annotation: input.annotation,
        actionType: declarationUpdateAction.data
      })

      throwWhenNotEmpty(errors)
    }

    const annotationActionParse = annotationActions.safeParse(actionType)

    if (annotationActionParse.success) {
      const errors = validateActionAnnotation({
        eventConfig,
        annotation: input.annotation,
        actionType: annotationActionParse.data
      })

      throwWhenNotEmpty(errors)
    }

    return next()
  }
}
