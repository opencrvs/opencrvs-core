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
import { AVATAR_API } from '@gateway/constants'
import { getPresignedUrlFromUri } from '@gateway/features/registration/utils'
import { getFullName } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'

interface IAssignment {
  officeName: string
  firstName: string
  lastName: string
  practitionerId: string
}

export const searchTypeResolvers: GQLResolver = {
  IndexedEvent: {
    status(searchData) {
      return searchData.type
    },
    createdAtLocation(searchData) {
      return searchData.createdAtLocation
    }
  },

  AssignmentData: {
    async avatarURL(
      assignmentData: IAssignment,
      _,
      { dataSources, headers: authHeader, presignDocumentUrls }
    ) {
      const user = await dataSources.usersAPI.getUserByPractitionerId(
        assignmentData.practitionerId
      )

      if (user.avatar?.data) {
        if (!presignDocumentUrls) {
          return user.avatar.data
        }
        const avatarURL = await getPresignedUrlFromUri(
          user.avatar.data,
          authHeader
        )
        return avatarURL
      }

      const userName = getFullName(user, 'en')

      return `${AVATAR_API}${userName}`
    }
  }
}
