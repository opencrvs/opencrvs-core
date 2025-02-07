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
  FieldValueSchema,
  mapFieldTypeToZod,
  OptionalFieldValueSchema
} from '@opencrvs/commons'

import { MiddlewareOptions } from '@events/router/middleware/utils'
import { getActionFormFields } from '@events/service/config/config'
import { getEventTypeId } from '@events/service/events/events'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

type ActionMiddlewareOptions = Omit<MiddlewareOptions, 'input'> & {
  input: ActionInputWithType
}

function createValidationSchema(config: FieldConfig[]) {
  const shape: Record<string, FieldValueSchema | OptionalFieldValueSchema> = {}

  for (const field of config) {
    shape[field.id] = mapFieldTypeToZod(field.type, field.required)
  }

  return z.object(shape)
}

export function validateAction(actionType: ActionType) {
  return async (opts: ActionMiddlewareOptions) => {
    const eventType = await getEventTypeId(opts.input.eventId)

    const formFields = await getActionFormFields({
      token: opts.ctx.token,
      action: actionType,
      eventType
    })

    const result = createValidationSchema(formFields).safeParse(opts.input.data)

    if (result.error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: JSON.stringify(result.error.errors)
      })
    }

    return opts.next()
  }
}
