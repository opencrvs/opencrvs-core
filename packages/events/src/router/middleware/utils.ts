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

import type { AnyTRPCMiddlewareFunction } from '@trpc/server'
import {
  ActionInputWithType,
  TokenWithBearer,
  TokenUserType
} from '@opencrvs/commons'

export interface UserDetails {
  type: TokenUserType.USER | TokenUserType.SYSTEM
  id: string
  primaryOfficeId: string | undefined
  role: string
}

export type Context = { token: TokenWithBearer; user: UserDetails }
/**
 * TRPC Middleware options with correct context.
 * Actual middleware type definition is only for internal use within TRPC.
 */
export type MiddlewareOptions = Omit<
  Parameters<AnyTRPCMiddlewareFunction>[0],
  'ctx'
> & { ctx: Context }

export type ActionMiddlewareOptions = Omit<MiddlewareOptions, 'input'> & {
  input: ActionInputWithType
}
