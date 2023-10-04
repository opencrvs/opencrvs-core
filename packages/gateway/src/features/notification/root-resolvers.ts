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
export const resolvers = {
  Query: {
    listNotifications(_: any, { locations, status }: any) {
      // query composition
      return [{ id: '123' }, { id: '321' }]
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
