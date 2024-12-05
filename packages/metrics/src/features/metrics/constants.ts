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

import { cleanEnv, str } from 'envalid'

// Environment validation
const env = cleanEnv(process.env, {
  OPENCRVS_SPECIFICATION_URL: str({
    devDefault: 'http://opencrvs.org/specs/'
  }),
  CRUD_BIRTH_RATE_SEC: str({
    devDefault: 'id/statistics-crude-birth-rates'
  }),
  JURISDICTION_TYPE_SEC: str({
    devDefault: 'id/jurisdiction-type'
  }),
  TOTAL_POPULATION_SEC: str({
    devDefault: 'id/statistics-total-populations'
  }),
  MALE_POPULATION_SEC: str({
    devDefault: 'id/statistics-male-populations'
  }),
  FEMALE_POPULATION_SEC: str({
    devDefault: 'id/statistics-female-populations'
  }),
  WITHIN_1_YEAR: str({
    devDefault: 'DAYS_0_TO_365'
  }),
  EVENT: str({
    devDefault: 'event'
  }),
  NOTIFICATION_TYPES: str({
    devDefault: 'birth-notification,death-notification'
  })
})

export const OPENCRVS_SPECIFICATION_URL = env.OPENCRVS_SPECIFICATION_URL
export const CRUD_BIRTH_RATE_SEC = env.CRUD_BIRTH_RATE_SEC
export const JURISDICTION_TYPE_SEC = env.JURISDICTION_TYPE_SEC
export const TOTAL_POPULATION_SEC = env.TOTAL_POPULATION_SEC
export const MALE_POPULATION_SEC = env.MALE_POPULATION_SEC
export const FEMALE_POPULATION_SEC = env.FEMALE_POPULATION_SEC
export const JURISDICTION_TYPE_IDENTIFIER = env.JURISDICTION_TYPE_SEC
export const TIME_FROM = 'timeStart'
export const TIME_TO = 'timeEnd'
export const LOCATION_ID = 'locationId'
export const COUNT = 'count'
export const MALE = 'male'
export const FEMALE = 'female'
export const POPULATION_YEAR = 'populationYear'
export const SKIP = 'skip'
export const SIZE = 'size'

//export const WITHIN_45_DAYS = 'DAYS_0_TO_45'
//export const WITHIN_45_DAYS_TO_1_YEAR = 'DAYS_46_TO_365'
export const WITHIN_1_YEAR = env.WITHIN_1_YEAR
export const EVENT = env.EVENT
export const NOTIFICATION_TYPES = env.NOTIFICATION_TYPES.split(',')

export enum Events {
  INCOMPLETE = 'in-progress-declaration', // Field agent or DHIS2 in progress
  READY_FOR_REVIEW = 'new-declaration', // Field agent complete
  WAITING_EXTERNAL_VALIDATION = 'registrar-registration-waiting-external-resource-validation', // Registrar
  VALIDATED = 'request-for-registrar-validation' // Registration agent new event
}
