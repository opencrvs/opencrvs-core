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
import { GQLResolver } from '@gateway/graphql/schema'
import { hasScope } from '@gateway/features/user/utils'
import { APPLICATION_CONFIG_URL } from '@gateway/constants'
import { IInformantSMSNotification } from '@gateway/features/informantSMSNotifications/type-resolvers'
import fetch from '@gateway/fetch'
import { URL } from 'url'

export const resolvers: GQLResolver = {
  Query: {
    async informantSMSNotifications(_, {}, { headers: authHeader }) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error(
            'Toggle informantSMSNotification is only allowed for natlsysadmin'
          )
        )
      }

      const informantSMSNotificationURL = new URL(
        '/informantSMSNotification',
        APPLICATION_CONFIG_URL
      ).toString()

      const informantSMSNotifications = await fetch(
        informantSMSNotificationURL,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      )

      if (informantSMSNotifications.status !== 200) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't get informantSMSNotification`
          )
        )
      }

      const informantSMSNotificationsResponse =
        (await informantSMSNotifications.json()) as IInformantSMSNotification[]

      return informantSMSNotificationsResponse
    }
  },

  Mutation: {
    async toggleInformantSMSNotification(
      _,
      { smsNotifications },
      { headers: authHeader }
    ) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        return await Promise.reject(
          new Error(
            'Toggle informantSMSNotification is only allowed for natlsysadmin'
          )
        )
      }
      const informantSMSNotificationURL = new URL(
        '/informantSMSNotification',
        APPLICATION_CONFIG_URL
      ).toString()

      const res = await fetch(informantSMSNotificationURL, {
        method: 'PUT',
        body: JSON.stringify(smsNotifications),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't update informantSMSNotification`
          )
        )
      }

      const informantSMSNotificationsResponse =
        (await res.json()) as IInformantSMSNotification[]

      return informantSMSNotificationsResponse
    }
  }
}
