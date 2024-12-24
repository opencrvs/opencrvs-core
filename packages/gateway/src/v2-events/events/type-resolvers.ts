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
import {
  GQLCreateActionTypeResolver,
  GQLResolver
} from '@gateway/graphql/schema'
import { ActionType } from '@opencrvs/commons'
import { ActionDocument } from '@opencrvs/commons/events'

const ActionResolver: GQLCreateActionTypeResolver = {
  data: (list) =>
    Object.entries(list.data).map(([id, value]) => ({ id, value }))
}

export const eventResolvers: GQLResolver = {
  CreateAction: ActionResolver,
  NotifyAction: ActionResolver,
  DeclareAction: ActionResolver,
  RegisterAction: ActionResolver,
  Action: {
    __resolveType: (obj: ActionDocument) => {
      if (obj.type === ActionType.NOTIFY) {
        return 'NotifyAction'
      }
      if (obj.type === ActionType.DECLARE) {
        return 'DeclareAction'
      }
      if (obj.type === ActionType.REGISTER) {
        return 'RegisterAction'
      }
      return 'CreateAction'
    }
  }
}
