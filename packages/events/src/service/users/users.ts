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

import { UserOrSystem, TokenUserType } from '@opencrvs/commons'
import { getUser, getSystem } from './api'

export async function getUserOrSystem(
  id: string,
  token: string
): Promise<UserOrSystem | undefined> {
  const user = await getUser(id, token)

  if (user) {
    return {
      type: TokenUserType.enum.user,
      id: user.id,
      name: user.name,
      role: user.role,
      signature: user.signature ? user.signature : undefined,
      avatar: user.avatar?.data ? user.avatar.data : undefined,
      primaryOfficeId: user.primaryOfficeId,
      fullHonorificName: user.fullHonorificName
        ? user.fullHonorificName
        : undefined
    }
  }

  const system = await getSystem(id, token)

  if (system) {
    return {
      type: TokenUserType.enum.system,
      id,
      name: system.name,
      role: system.type
    }
  }

  return
}

/**
 * Retrieves multiple users/systems by their IDs.
 *
 * If no user or system is found for an id, we leave them out of the result.
 * This is because a user might have been removed, and we don't want to throw an error in those cases.
 *
 * @param ids - Array of ids, which can be normal user or system ids
 * @param token - Authorization token for API requests
 * @returns Array of found users. If no users are found for some ids, we leave them out of the result.
 */
export const getUsersById = async (
  ids: string[],
  token: string
): Promise<UserOrSystem[]> => {
  const users = await Promise.all(
    ids.map(async (id) => getUserOrSystem(id, token))
  )

  return users.filter((user) => user !== undefined)
}
