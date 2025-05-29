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

import { ObjectId } from 'mongodb'
import { ResolvedUser } from '@opencrvs/commons'
import * as userMgntDb from '@events/storage/mongodb/user-mgnt'

export const getUsersById = async (ids: string[]) => {
  const db = await userMgntDb.getClient()

  if (ids.length === 0) {
    return []
  }

  const results = await db
    .collection<{
      _id: ObjectId
      name: ResolvedUser['name']
      role: string
    }>('users')
    .find({
      _id: {
        $in: ids
          .filter((id) => ObjectId.isValid(id))
          .map((id) => new ObjectId(id))
      }
    })
    .toArray()

  return results.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    role: user.role
  }))
}
