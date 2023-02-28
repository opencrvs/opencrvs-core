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
import { model, Schema, Document, Types } from 'mongoose'

interface ISystemRole {
  value: string
  roles: Types.ObjectId[]
  active: boolean
  creationDate: number
}

export interface ISystemRoleModel extends ISystemRole, Document {}

const systemRoleSchema = new Schema({
  value: String,
  roles: [{ type: Schema.Types.ObjectId, ref: 'UserRole' }],
  active: { type: Boolean, default: true },
  creationDate: { type: Number, default: Date.now }
})

export default model<ISystemRoleModel>('SystemRole', systemRoleSchema)
