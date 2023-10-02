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

export interface IInformantSMSNotification {
  _id: string
  name: string
  enabled: boolean
  updatedAt: string
  createdAt: string
}

export const informantSMSNotiTypeResolvers: GQLResolver = {
  SMSNotification: {
    id(informantSMSNotification: IInformantSMSNotification) {
      return informantSMSNotification._id
    }
  }
}
