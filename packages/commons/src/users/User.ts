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

import { DocumentPath } from '../documents'
import * as z from 'zod/v4'
import { UUID } from '../uuid'
import { TokenUserType } from '../authentication'
import {
  EmailValue,
  FieldValue,
  FileFieldValue,
  NameFieldValue
} from '../events'

export const REINDEX_USER_ID = '00000000-0000-0000-0000-000000000000' as UUID

export const UserName = NameFieldValue.omit({ middlename: true })

const UserStatus = z.enum(['active', 'deactivated', 'pending'])

export const User = z.object({
  id: UUID,
  name: UserName,
  role: z.string(),
  avatar: DocumentPath.optional(),
  signature: DocumentPath.nullish().describe(
    'Storage key for the user signature. e.g. signature.png'
  ),
  primaryOfficeId: UUID,
  administrativeAreaId: UUID.nullish(),
  device: z.string().optional(),
  fullHonorificName: z.string().optional(),
  type: TokenUserType.extract(['user']),
  mobile: z.string().optional(),
  email: EmailValue.optional(),
  status: UserStatus,
  data: z.record(z.string(), FieldValue).optional()
})

export type User = z.infer<typeof User>
export const UserSummary = User.pick({
  id: true,
  name: true,
  role: true,
  primaryOfficeId: true,
  administrativeAreaId: true,
  fullHonorificName: true,
  type: true,
  avatar: true
})
export type UserSummary = z.infer<typeof UserSummary>

export type UserName = User['name']

export const CreateUserInput = User.pick({
  name: true,
  role: true,
  primaryOfficeId: true,
  mobile: true,
  email: true,
  fullHonorificName: true,
  device: true,
  data: true
})
  .extend({
    username: z.undefined().optional(),
    password: z.undefined().optional(),
    signature: FileFieldValue.optional()
  })
  .describe('User input for creating a new user through client API.')

export type CreateUserInput = z.infer<typeof CreateUserInput>

export const UpdateUserInput = User.pick({
  name: true,
  role: true,
  primaryOfficeId: true,
  mobile: true,
  email: true,
  fullHonorificName: true,
  device: true,
  signature: true,
  status: true,
  data: true
})
  .partial()
  .extend({
    signature: FileFieldValue.optional(),
    id: UUID,
    status: z.enum(['active', 'deactivated']).optional() // can't set 'pending' via update
  })
export type UpdateUserInput = z.infer<typeof UpdateUserInput>

/* alphanumeric string which may contain dots and dashes, but must start and end with an alphanumeric character */
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9.\-]*[a-z0-9]$/
export const MIN_USERNAME_LENGTH = 5
export const CreateUserInputInternal = User.pick({
  name: true,
  role: true,
  primaryOfficeId: true,
  mobile: true,
  email: true
})
  .extend({
    username: z.string().min(MIN_USERNAME_LENGTH).regex(USERNAME_PATTERN),
    status: z.enum(['active']).optional(),
    password: z.string().optional()
  })
  .describe('User input for seeding initial users through internal API.')

export type CreateUserInputInternal = z.infer<typeof CreateUserInputInternal>

export const System = z.object({
  id: UUID,
  name: z.string(),
  type: TokenUserType.extract(['system']),
  primaryOfficeId: UUID.optional(),
  administrativeAreaId: UUID.optional(),
  signature: z.undefined().optional(),
  avatar: z.undefined().optional(),
  fullHonorificName: z.string().optional(),
  legacyId: z.string().optional(),
  status: z.undefined().optional()
})

export type System = z.infer<typeof System>

export const SystemSummary = System.pick({
  id: true,
  name: true,
  type: true,
  primaryOfficeId: true,
  administrativeAreaId: true
})

export const UserOrSystem = z.discriminatedUnion('type', [User, System])
export type UserOrSystem = z.infer<typeof UserOrSystem>

export const UserOrSystemSummary = z.discriminatedUnion('type', [
  UserSummary,
  SystemSummary
])
export const UserOrSystemSummaryWithStatus = z.discriminatedUnion('type', [
  UserSummary.extend({ status: UserStatus }),
  SystemSummary.extend({
    status: UserStatus.optional()
  })
])

export type UserOrSystemSummary = z.infer<typeof UserOrSystemSummary>

export const UserContext = User.pick({
  id: true,
  primaryOfficeId: true,
  administrativeAreaId: true,
  role: true,
  signature: true,
  type: true
})
export type UserContext = z.infer<typeof UserContext>

export const SystemContext = System.pick({
  id: true,
  type: true,
  primaryOfficeId: true,
  administrativeAreaId: true,
  signature: true
})

export type SystemContext = z.infer<typeof SystemContext>
