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
import { model, Schema, Document } from 'mongoose'
// tslint:disable-next-line
import { statuses } from '../utils/userUtils'

export interface IUserName {
  use: string
  family: string
  given: string[]
}

interface IIdentifier {
  system: string
  value: string
}
export interface ISecurityQuestionAnswer {
  questionKey: string
  answerHash: string
}
interface ISignature {
  type: string
  data: string
}
interface ILocalRegistrar {
  name: IUserName[]
  role?: string
  signature: ISignature
}
export interface IUser {
  name: IUserName[]
  username: string
  identifiers?: IIdentifier[]
  email?: string
  mobile: string
  passwordHash: string
  salt: string
  role?: string
  type?: string
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
  scope: string[]
  signature: ISignature
  localRegistrar: ILocalRegistrar
  status: string
  deviceId?: string
  securityQuestionAnswers?: ISecurityQuestionAnswer[]
  creationDate: number
}

export interface IUserModel extends IUser, Document {}

// tslint:disable-next-line
export const UserNameSchema = new Schema(
  {
    use: String,
    given: [String],
    family: String
  },
  { _id: false }
)
// tslint:disable-next-line
const IdentifierSchema = new Schema(
  {
    system: String,
    value: String
  },
  { _id: false }
)
// tslint:disable-next-line
const SecurityQuestionAnswerSchema = new Schema(
  {
    questionKey: String,
    answerHash: String
  },
  { _id: false }
)

const userSchema = new Schema({
  name: { type: [UserNameSchema], required: true },
  username: { type: String, required: true },
  identifiers: [IdentifierSchema],
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: String,
  type: String,
  practitionerId: { type: String, required: true },
  primaryOfficeId: { type: String, required: true },
  catchmentAreaIds: { type: [String], required: true },
  scope: { type: [String], required: true },
  status: {
    type: String,
    enum: [statuses.PENDING, statuses.ACTIVE, statuses.DISABLED],
    default: statuses.PENDING
  },
  securityQuestionAnswers: [SecurityQuestionAnswerSchema],
  deviceId: String,
  creationDate: { type: Number, default: Date.now }
})

export default model<IUserModel>('User', userSchema)
