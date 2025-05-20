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

//fix types

import { User } from 'src/events'
import { z } from 'zod'

export const SerializedUserField = z.object({
  $userField: z.enum(['id', 'name', 'role', 'signatureFilename'])
})

export type SerializedUserField = z.infer<typeof SerializedUserField>

export function userDeSerializer(
  serializedUserField: SerializedUserField,
  user: User
) {
  return user[serializedUserField.$userField]
}

export const isSerializedUserField = (obj: any): obj is SerializedUserField => {
  return '$userField' in obj
}

export function rootDesirializer(input: any, user: User): any {
  if (Array.isArray(input)) {
    return input.map((item) => rootDesirializer(item, user))
  }
  if (typeof input === 'object' && input !== null) {
    if (isSerializedUserField(input)) {
      return userDeSerializer(input, user)
    }
    const deserializedObject: any = {}
    for (const key in input) {
      deserializedObject[key] = rootDesirializer(input[key], user)
    }
    return deserializedObject
  }
  return input
}
