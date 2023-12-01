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
import { model, Schema, Document } from 'mongoose'
interface IBirth {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    LATE: number
    DELAYED: number
  }
  PRINT_IN_ADVANCE: boolean
}
interface IDeath {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
  PRINT_IN_ADVANCE: boolean
}
interface IMarriage {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
  PRINT_IN_ADVANCE: boolean
}
interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

interface ICountryLogo {
  fileName: string
  file: string
}

interface ILoginBackground {
  backgroundColor: string
  backgroundImage: string
  imageFit: string
}

export interface IApplicationConfigurationModel extends Document {
  APPLICATION_NAME: string
  BIRTH: IBirth
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  DEATH: IDeath
  MARRIAGE: IMarriage
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: string
  LOGIN_BACKGROUND: ILoginBackground
}

const birthSchema = new Schema<IBirth>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  LATE_REGISTRATION_TARGET: { type: Number, default: 365 },
  FEE: {
    ON_TIME: Number,
    LATE: Number,
    DELAYED: Number
  },
  PRINT_IN_ADVANCE: { type: Boolean, default: true }
})

const deathSchema = new Schema<IDeath>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  FEE: {
    ON_TIME: Number,
    DELAYED: Number
  },
  PRINT_IN_ADVANCE: { type: Boolean, default: true }
})

const marriageSchema = new Schema<IMarriage>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  FEE: {
    ON_TIME: { type: Number, default: 10 },
    DELAYED: { type: Number, default: 45 }
  },
  PRINT_IN_ADVANCE: { type: Boolean, default: true }
})

const countryLogoSchema = new Schema<ICountryLogo>({
  fileName: String,
  file: String
})

const backgroundImageSchema = new Schema<ILoginBackground>({
  backgroundColor: String,
  backgroundImage: String,
  imageFit: String
})

const currencySchema = new Schema<ICurrency>({
  isoCode: { type: String },
  languagesAndCountry: { type: [String] }
})

export interface Integration {
  name: string
  status: string
}

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

const configSchema = new Schema({
  APPLICATION_NAME: { type: String, required: false, default: 'OpenCRVS' },
  BIRTH: { type: birthSchema, required: false },
  COUNTRY_LOGO: { type: countryLogoSchema, required: false },
  CURRENCY: { type: currencySchema, required: false },
  DEATH: { type: deathSchema, required: false },
  MARRIAGE: { type: marriageSchema, required: false },
  PHONE_NUMBER_PATTERN: { type: String, required: false },
  NID_NUMBER_PATTERN: { type: String, required: false },
  LOGIN_BACKGROUND: { type: backgroundImageSchema, required: false }
})

export default model<IApplicationConfigurationModel>('Config', configSchema)
