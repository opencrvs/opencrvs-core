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

import { joinUrl } from '../url'
import { NameFieldValue } from '../events'
import { z } from 'zod'

export const Foo = z.enum(['user-created', 'user-updated'])

export const TriggerEvent = {
  USER_CREATED: 'user-created',
  USER_UPDATED: 'user-updated',
  USERNAME_REMINDER: 'username-reminder',
  RESET_PASSWORD: 'reset-password',
  RESET_PASSWORD_BY_ADMIN: 'reset-password-by-admin',
  TWO_FA: '2fa',
  ALL_USER_NOTIFICATION: 'all-user-notification',
  CHANGE_PHONE_NUMBER: 'change-phone-number',
  CHANGE_EMAIL_ADDRESS: 'change-email-address'
} as const

export type TriggerEvent = (typeof TriggerEvent)[keyof typeof TriggerEvent]

export const Recipient = z.object({
  name: NameFieldValue.optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  bcc: z.array(z.string()).optional()
})

export type Recipient = z.infer<typeof Recipient>

export const BasePayload = z.object({
  recipient: Recipient
})

export type BasePayload = z.infer<typeof BasePayload>

export const TriggerPayload = {
  [TriggerEvent.USER_CREATED]: BasePayload.extend({
    username: z.string(),
    temporaryPassword: z.string()
  }),
  [TriggerEvent.USER_UPDATED]: BasePayload.extend({
    oldUsername: z.string(),
    newUsername: z.string()
  }),
  [TriggerEvent.USERNAME_REMINDER]: BasePayload.extend({
    username: z.string()
  }),
  [TriggerEvent.RESET_PASSWORD]: BasePayload.extend({
    code: z.string()
  }),
  [TriggerEvent.RESET_PASSWORD_BY_ADMIN]: BasePayload.extend({
    temporaryPassword: z.string(),
    admin: z.object({
      id: z.string(),
      name: NameFieldValue,
      role: z.string()
    })
  }),
  [TriggerEvent.TWO_FA]: BasePayload.extend({
    code: z.string()
  }),
  [TriggerEvent.ALL_USER_NOTIFICATION]: BasePayload.extend({
    subject: z.string(),
    body: z.string()
  }),
  [TriggerEvent.CHANGE_PHONE_NUMBER]: BasePayload.extend({
    code: z.string()
  }),
  [TriggerEvent.CHANGE_EMAIL_ADDRESS]: BasePayload.extend({
    code: z.string()
  })
} as const

export type TriggerPayload = {
  [K in TriggerEvent]: z.infer<(typeof TriggerPayload)[K]>
}

export async function triggerUserEventNotification<T extends TriggerEvent>({
  event,
  payload,
  countryConfigUrl,
  authHeader
}: {
  event: T
  payload: TriggerPayload[T]
  countryConfigUrl: string
  authHeader: { Authorization: string }
}) {
  return await fetch(joinUrl(countryConfigUrl, `triggers/user/${event}`), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
}

export function parseUserEventTrigger<T extends TriggerEvent>(
  event: T,
  body: unknown
): TriggerPayload[T] {
  const schema = TriggerPayload[event]
  return schema.parse(body) as TriggerPayload[T]
}
