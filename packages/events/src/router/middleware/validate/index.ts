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
  FieldConfig,
  FieldValueInput,
  getFieldValidationErrors
} from '@opencrvs/commons'

import { MiddlewareOptions } from '@events/router/middleware/utils'
import { getActionFormFields } from '@events/service/config/config'
import { getEventTypeId } from '@events/service/events/events'
import { TRPCError } from '@trpc/server'

type ActionMiddlewareOptions = Omit<MiddlewareOptions, 'input'> & {
  input: ActionInputWithType
}

export function validateAction(actionType: ActionType) {
  return async (opts: ActionMiddlewareOptions) => {
    const eventType = await getEventTypeId(opts.input.eventId)

    const formFields = await getActionFormFields({
      token: opts.ctx.token,
      action: actionType,
      eventType
    })

    const data = {
      ...opts.input.data,
      ...(opts.input.metadata ?? {})
    }

    console.log('data', data)

    const errors = formFields.reduce(
      (
        errorResults: {
          message: string
          id: string
          value: FieldValueInput
        }[],
        field: FieldConfig
      ) => {
        const fieldErrors = getFieldValidationErrors({
          field,
          values: data as any
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

    if (errors.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: JSON.stringify(errors)
      })
    }

    return opts.next()
  }
}
