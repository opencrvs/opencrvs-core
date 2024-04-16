import { GQLNotificationType, GQLResolver } from '@gateway/graphql/schema'
import { inScope } from '@gateway/features/user/utils'
import { sendEmailToAllUsers } from './service'
import { unauthorized } from '@hapi/boom'

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
export const resolvers: GQLResolver = {
  Query: {
    listNotifications(_: any, { locations, status }: any) {
      // query composition
      return [{ id: '123' }, { id: '321' }]
    },
    async sendNotificationToAllUsers(
      _: any,
      { subject, body, type, locale },
      { headers: authHeader }
    ) {
      if (!inScope(authHeader, ['natlsysadmin'])) {
        throw unauthorized(
          'Sending mass notification is only allowed for national system admin'
        )
      }
      if (type === GQLNotificationType.EMAIL) {
        return sendEmailToAllUsers(subject, body, locale, authHeader)
      } else {
        throw new Error('Unsupported notification type')
      }
    }
  },
  Mutation: {
    async createNotification(_: any, { details }: { details: any }) {
      // create bundle of resources - some sort of mapping
      // put resources in a composition
      // save composition
      return { details }
    }
  },
  Notification: {}
}
