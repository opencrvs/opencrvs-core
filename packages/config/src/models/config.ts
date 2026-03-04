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
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: string
}

const countryLogoSchema = new Schema<ICountryLogo>({
  fileName: String,
  file: String
})

const currencySchema = new Schema<ICurrency>({
  isoCode: { type: String },
  languagesAndCountry: { type: [String] }
})

export interface Integration {
  name: string
  status: string
}

const configSchema = new Schema({
  APPLICATION_NAME: { type: String, required: false, default: 'OpenCRVS' },
  COUNTRY_LOGO: { type: countryLogoSchema, required: false },
  CURRENCY: { type: currencySchema, required: false },
  PHONE_NUMBER_PATTERN: { type: String, required: false },
  NID_NUMBER_PATTERN: { type: String, required: false }
})

export default model<IApplicationConfigurationModel>('Config', configSchema)
