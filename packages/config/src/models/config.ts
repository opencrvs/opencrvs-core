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
interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

export interface IApplicationConfigurationModel extends Document {
  APPLICATION_NAME: string
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  COUNTRY: string
  COUNTRY_LOGO_FILE: string
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  CURRENCY: ICurrency
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
  PHONE_NUMBER_PATTERN: RegExp
  BIRTH_REGISTRATION_TARGET: number
  DEATH_REGISTRATION_TARGET: number
  NID_NUMBER_PATTERN: string
}

const currencySchema = new Schema<ICurrency>({
  isoCode: { type: String },
  languagesAndCountry: { type: [String] }
})

const systemSchema = new Schema({
  APPLICATION_NAME: { type: String, required: false, default: 'OpenCRVS' },
  BACKGROUND_SYNC_BROADCAST_CHANNEL: { type: String, required: false },
  COUNTRY: { type: String, required: false },
  COUNTRY_LOGO_FILE: { type: String, required: false },
  COUNTRY_LOGO_RENDER_WIDTH: { type: Number, required: false, default: 104 },
  COUNTRY_LOGO_RENDER_HEIGHT: { type: Number, required: false, default: 104 },
  CURRENCY: { type: currencySchema, required: false },
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
  PHONE_NUMBER_PATTERN: { type: String, required: false },
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
  NID_NUMBER_PATTERN: { type: String, required: false },
  SENTRY: { type: String, required: false },
  LOGROCKET: { type: String, required: false }
})

export default model<IApplicationConfigurationModel>('Config', systemSchema)
