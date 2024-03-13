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
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const CRUD_BIRTH_RATE_SEC = 'id/statistics-crude-birth-rates'
export const JURISDICTION_TYPE_SEC = 'id/jurisdiction-type'
export const TOTAL_POPULATION_SEC = 'id/statistics-total-populations'
export const MALE_POPULATION_SEC = 'id/statistics-male-populations'
export const FEMALE_POPULATION_SEC = 'id/statistics-female-populations'
export const JURISDICTION_TYPE_IDENTIFIER = 'id/jurisdiction-type'
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
export const WITHIN_1_YEAR = 'DAYS_0_TO_365'
export const EVENT = 'event'
export const NOTIFICATION_TYPES = ['birth-notification', 'death-notification']
export enum Events {
  INCOMPLETE = 'in-progress-declaration', // Field agent or DHIS2 in progress
  READY_FOR_REVIEW = 'new-declaration', // Field agent complete
  WAITING_EXTERNAL_VALIDATION = 'registrar-registration-waiting-external-resource-validation', // Registrar
  VALIDATED = 'request-for-registrar-validation' // Registration agent new event
}
