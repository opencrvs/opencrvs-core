/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { MONGO_URL } from '@resources/constants'
import * as mongoose from 'mongoose'
import Role, { IRoleModel } from '@opencrvs/user-mgnt/src/model/role'

export async function updateRolesAndTypes() {
  try {
    await mongoose.connect(MONGO_URL)

    /**
     * We have renamed API_USER role to NOTIFICATION_API_USER
     * in-order to give access for submitting notifications only
     */
    const oldApiRole: IRoleModel | null = await Role.findOne({
      value: 'API_USER'
    })
    if (oldApiRole) {
      oldApiRole.title = 'Notification API User'
      oldApiRole.value = 'NOTIFICATION_API_USER'
      await Role.updateOne({ _id: oldApiRole._id }, oldApiRole)
    }
    /**
     * If still NOTIFICATION_API_USER role is missing
     */
    const notificationApiRole: IRoleModel | null = await Role.findOne({
      value: 'NOTIFICATION_API_USER'
    })
    if (!notificationApiRole) {
      await Role.create(
        new Role({
          title: 'Notification API User',
          value: 'NOTIFICATION_API_USER',
          types: ['API_USER'],
          active: true
        })
      )
    }
    /**
     * Added a new role VALIDATION_API_USER
     * for external systems to validate pending applications
     */
    const validateApiRole: IRoleModel | null = await Role.findOne({
      value: 'VALIDATOR_API_USER'
    })
    if (!validateApiRole) {
      await Role.create(
        new Role({
          title: 'Validator API User',
          value: 'VALIDATOR_API_USER',
          types: ['API_USER'],
          active: true
        })
      )
    }
  } catch (error) {
    throw Error(error)
  } finally {
    await mongoose.disconnect()
  }
}
