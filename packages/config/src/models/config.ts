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

interface IPhoneNumberPattern {
  pattern: RegExp
  example: string
  start: string
  num: string
  mask: {
    startForm: number
    endBefore: number
  }
}

interface INIDNumberPattern {
  pattern: RegExp
  example: string
  num: string
}

export interface IApplicationConfigurationModel extends Document {
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  COUNTRY: string
  COUNTRY_LOGO_FILE: string
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  DESKTOP_TIME_OUT_MILLISECONDS: number
  LANGUAGES: string
  CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: number
  CERTIFICATE_PRINT_CHARGE_UP_LIMIT: number
  CERTIFICATE_PRINT_LOWEST_CHARGE: number
  CERTIFICATE_PRINT_HIGHEST_CHARGE: number
  UI_POLLING_INTERVAL: number
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  INFORMANT_MINIMUM_AGE: number
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  SENTRY: string
  LOGROCKET: string
  PHONE_NUMBER_PATTERN: IPhoneNumberPattern
  BIRTH_REGISTRATION_TARGET: number
  DEATH_REGISTRATION_TARGET: number
  NID_NUMBER_PATTERN: INIDNumberPattern
}

const nidPatternSchema = new Schema<INIDNumberPattern>({
  pattern: { type: String },
  example: String,
  num: String
})

const phoneNumberSchema = new Schema<IPhoneNumberPattern>({
  pattern: { type: String },
  example: String,
  start: String,
  num: String,
  mask: {
    startForm: Number,
    endBefore: Number
  }
})

const systemSchema = new Schema({
  BACKGROUND_SYNC_BROADCAST_CHANNEL: { type: String, required: false },
  COUNTRY: { type: String, required: false },
  COUNTRY_LOGO_FILE: { type: String, required: false },
  COUNTRY_LOGO_RENDER_WIDTH: { type: Number, required: false, default: 104 },
  COUNTRY_LOGO_RENDER_HEIGHT: { type: Number, required: false, default: 104 },
  DESKTOP_TIME_OUT_MILLISECONDS: {
    type: Number,
    required: false,
    default: 900000
  },
  LANGUAGES: { type: String, required: false, default: 'en' },
  CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: {
    type: Number,
    required: false,
    default: 36500
  },
  CERTIFICATE_PRINT_CHARGE_UP_LIMIT: {
    type: Number,
    required: false,
    default: 36500
  },
  CERTIFICATE_PRINT_LOWEST_CHARGE: {
    type: Number,
    required: false,
    default: 0
  },
  CERTIFICATE_PRINT_HIGHEST_CHARGE: {
    type: Number,
    required: false,
    default: 0
  },
  UI_POLLING_INTERVAL: { type: Number, required: false, default: 5000 },
  FIELD_AGENT_AUDIT_LOCATIONS: {
    type: String,
    required: false,
    default: 'DISTRICT'
  },
  DECLARATION_AUDIT_LOCATIONS: {
    type: String,
    required: false,
    default: 'DISTRICT'
  },
  INFORMANT_MINIMUM_AGE: { type: Number, required: false, default: 16 },
  HIDE_EVENT_REGISTER_INFORMATION: {
    type: Boolean,
    required: false,
    default: false
  },
  EXTERNAL_VALIDATION_WORKQUEUE: {
    type: Boolean,
    required: false,
    default: false
  },
  PHONE_NUMBER_PATTERN: { type: phoneNumberSchema, required: false },
  BIRTH_REGISTRATION_TARGET: {
    type: Number,
    required: false,
    default: 45
  },
  DEATH_REGISTRATION_TARGET: {
    type: Number,
    required: false,
    default: 45
  },
  NID_NUMBER_PATTERN: { type: nidPatternSchema, required: false },
  SENTRY: { type: String, required: false },
  LOGROCKET: { type: String, required: false }
})

export default model<IApplicationConfigurationModel>('Config', systemSchema)
