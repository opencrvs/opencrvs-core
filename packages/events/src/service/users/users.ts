import * as userMgntDb from '@events/storage/mongodb/user-mgnt'

import { ObjectId } from 'mongodb'

export const getUsersById = async (ids: string[]) => {
  const db = await userMgntDb.getClient()

  if (ids.length === 0) {
    return []
  }

  return (
    await db
      .collection('users')
      .find({
        _id: {
          $in: ids
            .filter((id) => ObjectId.isValid(id))
            .map((id) => new ObjectId(id))
        }
      })
      .toArray()
  ).map((user) => ({
    id: user._id.toString(),
    name: user.name,
    systemRole: user.systemRole
  }))
}
