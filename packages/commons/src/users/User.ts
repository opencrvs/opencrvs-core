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

import { FullDocumentPath } from '../documents'
import { z } from 'zod'
import { UUID } from '../uuid'
import { TokenUserType } from 'src/authentication'

export const REINDEX_USER_ID = '__ANONYMOUS_REINDEX_USER__'

export type IUserName = {
  use: string
  family: string
  given: string[]
}

export type SystemRole = z.infer<typeof SystemRole>

export const User = z.object({
  id: z.string(),
  name: z.array(
    z.object({
      use: z.string(),
      given: z.array(z.string()),
      family: z.string()
    })
  ),
  role: z.string(),
  avatar: FullDocumentPath.optional(),
  signature: FullDocumentPath.optional().describe(
    'Storage key for the user signature. e.g. /ocrvs/signature.png'
  ),
  primaryOfficeId: UUID,
  fullHonorificName: z.string().optional(),
  type: TokenUserType.extract(['user'])
})
export type User = z.infer<typeof User>

export const SystemRole = z.enum([
  'HEALTH',
  'NATIONAL_ID',
  'RECORD_SEARCH',
  'REINDEX',
  'WEBHOOK',
  'IMPORT_EXPORT'
])

export const System = z.object({
  id: z.string(),
  name: z.string(),
  type: TokenUserType.extract(['system']),
  role: SystemRole,
  primaryOfficeId: z.undefined().optional(),
  signature: z.undefined().optional(),
  avatar: z.undefined().optional(),
  fullHonorificName: z.string().optional()
})
export type System = z.infer<typeof System>

export const UserOrSystem = z.discriminatedUnion('type', [User, System])
export type UserOrSystem = z.infer<typeof UserOrSystem>
