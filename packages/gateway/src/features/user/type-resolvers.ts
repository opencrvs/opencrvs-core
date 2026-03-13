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

import { User } from '@opencrvs/commons'

import { GQLResolver } from '@gateway/graphql/schema'

export const userTypeResolvers: GQLResolver = {
  User: {
    id(userModel: User) {
      return userModel.id
    },
    role: async (userModel: User) => {
      return userModel.role
    },
    avatar: async (userModel: User) => {
      return userModel.avatar
    },
    email(userModel: User) {
      return userModel.email
    },
    async primaryOfficeId(userModel: User) {
      return userModel.primaryOfficeId
    },
    async signature(userModel: User) {
      return userModel.signature
    }
  }
}
