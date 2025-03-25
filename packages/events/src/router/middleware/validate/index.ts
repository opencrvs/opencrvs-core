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
  FieldConfig,
  FieldUpdateValue,
  findActiveActionFields,
  getActiveActionFormPages,
  getFieldValidationErrors,
  Inferred,
  isPageVisible,
  isVerificationPage
} from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { getEventConfigurationById } from '@events/service/config/config'
import { getEventTypeId, getEventById } from '@events/service/events/events'
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

export function validateAction(actionType: ActionType) {
  return async ({ input, ctx, next }: ActionMiddlewareOptions) => {
    const eventType = await getEventTypeId(input.eventId)
    const eventConfig = await getEventConfigurationById({
      token: ctx.token,
      eventType
    })

    const formFields =
      findActiveActionFields(eventConfig, actionType, input.data) || []

    const data = {
      ...input.data,
      ...(input.metadata ?? {})
    } satisfies ActionUpdate

    const event = await getEventById(input.eventId)
    const eventDeclarationData =
      event.actions.find((action) => action.type === ActionType.DECLARE)
        ?.data ?? {}

    // For each visible verification page on the form, we expect the metadata to include a field with boolean value and the page id as key.
    const visibleVerificationPageIds = getActiveActionFormPages(
      eventConfig,
      actionType
    )
      .filter((page) => isVerificationPage(page))
      .filter((page) =>
        isPageVisible(page, { ...eventDeclarationData, ...data })
      )
      .map((page) => page.id)

    const errors = [
      ...getFormFieldErrors(formFields, data),
      ...getVerificationPageErrors(visibleVerificationPageIds, data)
    ]

    if (errors.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: JSON.stringify(errors)
      })
    }

    return next()
  }
}
