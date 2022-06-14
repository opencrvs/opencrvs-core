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
interface IBirth {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    LATE: number
    DELAYED: number
  }
}
interface IDeath {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
}
interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

interface ICountryLogo {
  fileName: string
  file: string
}
export interface IApplicationConfigurationModel extends Document {
  APPLICATION_NAME: string
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  BIRTH: IBirth
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  CURRENCY: ICurrency
  DEATH: IDeath
  DESKTOP_TIME_OUT_MILLISECONDS: number
  UI_POLLING_INTERVAL: number
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  INFORMANT_MINIMUM_AGE: number
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  SENTRY: string
  LOGROCKET: string
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: string
  ADDRESSES: number
}

const birthSchema = new Schema<IBirth>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  LATE_REGISTRATION_TARGET: { type: Number, default: 365 },
  FEE: {
    ON_TIME: Number,
    LATE: Number,
    DELAYED: Number
  }
})

const deathSchema = new Schema<IDeath>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  FEE: {
    ON_TIME: Number,
    DELAYED: Number
  }
})

const countryLogoSchema = new Schema<ICountryLogo>({
  fileName: String,
  file: String
})

const currencySchema = new Schema<ICurrency>({
  isoCode: { type: String },
  languagesAndCountry: { type: [String] }
})

const systemSchema = new Schema({
  APPLICATION_NAME: { type: String, required: false, default: 'OpenCRVS' },
  BACKGROUND_SYNC_BROADCAST_CHANNEL: { type: String, required: false },
  BIRTH: { type: birthSchema, required: false },
  COUNTRY: { type: String, required: false },
  COUNTRY_LOGO: { type: countryLogoSchema, required: false },
  COUNTRY_LOGO_RENDER_WIDTH: { type: Number, required: false, default: 104 },
  COUNTRY_LOGO_RENDER_HEIGHT: { type: Number, required: false, default: 104 },
  CURRENCY: { type: currencySchema, required: false },
  DEATH: { type: deathSchema, required: false },
  DESKTOP_TIME_OUT_MILLISECONDS: {
    type: Number,
    required: false,
    default: 900000
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
  NID_NUMBER_PATTERN: { type: String, required: false },
  SENTRY: { type: String, required: false },
  LOGROCKET: { type: String, required: false },
  ADDRESSES: {
    type: Number,
    required: false,
    enum: [1, 2],
    default: 1
  }
})

export default model<IApplicationConfigurationModel>('Config', systemSchema)
