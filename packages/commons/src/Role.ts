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
import { z } from 'zod'
import { EncodedScope } from './scopes'
import { EventConfig } from './client'

export const Role = z.object({
  id: z.string(),
  scopes: z.array(EncodedScope)
})

export type Role = z.infer<typeof Role>

export function validateRoles(roles: Role[], configurations: EventConfig[]) {
  const validationErrors: string[] = []

  if (validationErrors.length) {
    throw new Error(`Invalid roles:\n${validationErrors.join(', ')}`)
  }
}

/**
 * Helper for defining user roles. Should be used in country config.
 *
 * @param roles Array of roles in object format.
 * @param eventConfigs Array of event configurations, which are needed to run validations for scopes.
 */
export function defineRoles(roles: Role[], eventConfigs: EventConfig[]) {
  validateRoles(roles, eventConfigs)
  return roles.map((role) => Role.parse(role))
}
