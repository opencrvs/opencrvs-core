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

import { UserOrSystem } from '@opencrvs/commons'
import { getUserOrSystem } from './api'
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
