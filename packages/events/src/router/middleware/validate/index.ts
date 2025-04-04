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
  MetadataAction,
  EventConfig,
  FieldConfig,
  FieldUpdateValue,
  getFieldValidationErrors,
  Inferred,
  isPageVisible,
  isVerificationPage,
  annotationActions,
  findRecordActionPages,
  DeclarationUpdateAction,
  getActionReviewFields,
  getDeclaration,
  getVisiblePagesFormFields,
  DeclarationActions,
  getCurrentEventState,
  deepMerge
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
  actionType,
  declaration,
  annotation
}: {
  eventConfig: EventConfig
  actionType: DeclarationUpdateAction
  declaration: ActionUpdate
  annotation?: ActionUpdate
}) {
  const declarationConfig = getDeclaration(eventConfig)

  const declarationFields = getVisiblePagesFormFields(
    declarationConfig,
    declaration
  )

  const declarationActionParse = DeclarationActions.safeParse(actionType)
  const reviewFields = declarationActionParse.success
    ? getActionReviewFields(eventConfig, declarationActionParse.data)
    : []

  const fields = [...declarationFields, ...reviewFields]

  // @TODO: Separate validations for annotation and declaration
  return getFormFieldErrors(fields, { ...declaration, ...annotation })
}

function validateActionAnnotation({
  eventConfig,
  actionType,
  annotation = {}
}: {
  eventConfig: EventConfig
  actionType: MetadataAction
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
      const previousDeclaration = getCurrentEventState(event)
      // since partial updates are allowed, full declaration is needed to resolve validations
      const completeDeclaration = deepMerge(
        previousDeclaration.declaration,
        input.declaration
      )

      const errors = validateDeclarationUpdateAction({
        eventConfig,
        declaration: completeDeclaration,
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
