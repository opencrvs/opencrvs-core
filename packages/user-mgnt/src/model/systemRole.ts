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
import { model, Schema, Document, Types } from 'mongoose'

export const SYSTEM_ROLE_TYPES = [
  'FIELD_AGENT',
  'LOCAL_REGISTRAR',
  'LOCAL_SYSTEM_ADMIN',
  'NATIONAL_REGISTRAR',
  'NATIONAL_SYSTEM_ADMIN',
  'PERFORMANCE_MANAGEMENT',
  'REGISTRATION_AGENT'
] as const

interface ISystemRole {
  value: typeof SYSTEM_ROLE_TYPES[number]
  roles: Types.ObjectId[]
  active: boolean
  creationDate: number
}

export interface ISystemRoleModel extends ISystemRole, Document {}

const systemRoleSchema = new Schema({
  value: { type: String, enum: SYSTEM_ROLE_TYPES },
  roles: [{ type: Schema.Types.ObjectId, ref: 'UserRole' }],
  active: { type: Boolean, default: true },
  creationDate: { type: Number, default: Date.now }
})

export default model<ISystemRoleModel>('SystemRole', systemRoleSchema)
