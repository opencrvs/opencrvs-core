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
  ActionInputWithType,
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
  MetadataActions,
  findRecordActionPages,
  DeclarationUpdateAction,
  getActionReviewFields,
  getDeclaration,
  getVisiblePagesFormFields,
  DeclarationActions
} from '@opencrvs/commons/events'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { getEventConfigurationById } from '@events/service/config/config'
import { getEventTypeId } from '@events/service/events/events'
import { TRPCError } from '@trpc/server'

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

type ActionMiddlewareOptions = Omit<MiddlewareOptions, 'input'> & {
  input: ActionInputWithType
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

  // @TODO: Separate validations for metadata and data
  return getFormFieldErrors(fields, { ...declaration, ...annotation })
}

function validateMetadataAction({
  eventConfig,
  actionType,
  metadata = {}
}: {
  eventConfig: EventConfig
  actionType: MetadataAction
  metadata?: ActionUpdate
}) {
  const pages = findRecordActionPages(eventConfig, actionType)

  const visibleVerificationPageIds = pages
    .filter((page) => isVerificationPage(page))
    .filter((page) => isPageVisible(page, metadata))
    .map((page) => page.id)

  const formFields = pages.flatMap(({ fields }) =>
    fields.flatMap((field) => field)
  )

  const errors = [
    ...getFormFieldErrors(formFields, metadata),
    ...getVerificationPageErrors(visibleVerificationPageIds, metadata)
  ]

  return errors
}

export function validateAction(actionType: ActionType) {
  return async ({ input, ctx, next }: ActionMiddlewareOptions) => {
    const eventType = await getEventTypeId(input.eventId)
    const eventConfig = await getEventConfigurationById({
      token: ctx.token,
      eventType
    })

    const declarationUpdateAction =
      DeclarationUpdateActions.safeParse(actionType)

    if (declarationUpdateAction.success) {
      const errors = validateDeclarationUpdateAction({
        eventConfig,
        declaration: input.declaration,
        annotation: input.annotation,
        actionType: declarationUpdateAction.data
      })

      throwWhenNotEmpty(errors)
    }

    const metadataAction = MetadataActions.safeParse(actionType)

    if (metadataAction.success) {
      const errors = validateMetadataAction({
        eventConfig,
        metadata: input.annotation,
        actionType: metadataAction.data
      })

      throwWhenNotEmpty(errors)
    }

    return next()
  }
}
