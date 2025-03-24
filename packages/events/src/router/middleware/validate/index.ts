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
  isPageVisible,
  isVerificationPage
} from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'
import { getEventConfigurationById } from '@events/service/config/config'
import { getEventTypeId, getEventById } from '@events/service/events/events'
import { TRPCError } from '@trpc/server'

type ActionMiddlewareOptions = Omit<MiddlewareOptions, 'input'> & {
  input: ActionInputWithType
}

export function validateAction(actionType: ActionType) {
  return async (opts: ActionMiddlewareOptions) => {
    const eventType = await getEventTypeId(opts.input.eventId)

    const configuration = await getEventConfigurationById({
      token: opts.ctx.token,
      eventType
    })

    const formFields = findActiveActionFields(configuration, actionType) || []

    const data = {
      ...opts.input.data,
      ...(opts.input.metadata ?? {})
    } satisfies ActionUpdate

    // TODO CIHAN: dont expect required fields from hidden pages?
    const errors = formFields.reduce(
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

    const event = await getEventById(opts.input.eventId)
    const eventDeclarationData =
      event.actions.find((action) => action.type === ActionType.DECLARE)
        ?.data ?? {}

    // For each visible verification page on the form, we expect the metadata to include a field with boolean value and the page id as key.
    const visibleVerificationPageIds = getActiveActionFormPages(
      configuration,
      actionType
    )
      .filter((page) => isVerificationPage(page))
      .filter((page) =>
        isPageVisible(page, { ...eventDeclarationData, ...data })
      )
      .map((page) => page.id)

    const verificationPageErrors = visibleVerificationPageIds
      .map((field) => {
        const value = data[field]
        return typeof value !== 'boolean'
          ? {
              message: 'Verification page result is required',
              id: field,
              value
            }
          : null
      })
      .filter((error) => error !== null)

    const allErrors = [...errors, ...verificationPageErrors]

    if (allErrors.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: JSON.stringify(allErrors)
      })
    }

    return opts.next()
  }
}
