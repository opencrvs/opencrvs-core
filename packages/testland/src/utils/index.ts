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

import { callingCountries } from 'country-data'
import csv2json from 'csv2json'
import fs, { createReadStream } from 'fs'
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'
import { build } from 'esbuild'
import { memoize } from 'lodash'
import { join } from 'path'
import { stringify } from 'csv-stringify/sync'

export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'

export interface ILocation {
  id?: string
  name?: string
  alias?: string
  status?: string
  address?: string
  physicalType?: string
  jurisdictionType?: string
  type?: string
  partOf?: string
  statistics: Array<{ name: string; year: number; value: number }>
}

interface ILoginBackground {
  backgroundColor: string
  backgroundImage: string
  imageFit: string
}
interface ICountryLogo {
  fileName: string
  file: string
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
  SENTRY: string
  LOGIN_BACKGROUND: ILoginBackground
  USER_NOTIFICATION_DELIVERY_METHOD: string
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: string
}
export interface IApplicationConfigResponse {
  config: IApplicationConfig
}

export function getTaskResource(
  bundle: fhir.Bundle & fhir.BundleEntry
): fhir.Task | undefined {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0] ||
    !bundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found')
  }

  if (bundle.entry[0].resource.resourceType === 'Composition') {
    return getTaskResourceFromFhirBundle(bundle as fhir.Bundle)
  } else if (bundle.entry[0].resource.resourceType === 'Task') {
    return bundle.entry[0].resource as fhir.Task
  } else {
    throw new Error('Unable to find Task Bundle from the provided data')
  }
}

export function getCompositionId(resBody: fhir.Bundle) {
  const id = resBody.entry
    ?.map((e) => e.resource)
    .find((res) => res?.resourceType === 'Composition')?.id

  if (!id) {
    throw new Error('Could not find composition id in FHIR Bundle')
  }

  return id
}

export function getTaskResourceFromFhirBundle(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find((entry: fhir.BundleEntry) => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })

  return taskEntry && (taskEntry.resource as fhir.Task)
}

export function getTrackingIdFromTaskResource(taskResource: fhir.Task) {
  const trackingIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id` ||
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/death-tracking-id` ||
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/marriage-tracking-id`
      )
    })
  if (!trackingIdentifier || !trackingIdentifier.value) {
    throw new Error("Didn't find any identifier for tracking id")
  }
  return trackingIdentifier.value
}

export const convertToMSISDN = (phone: string, countryAlpha3: string) => {
  const countryCode = callingCountries[countryAlpha3.toUpperCase()].alpha2

  const phoneUtil = PhoneNumberUtil.getInstance()
  const number = phoneUtil.parse(phone, countryCode)

  return (
    phoneUtil
      .format(number, PhoneNumberFormat.INTERNATIONAL)
      // libphonenumber adds spaces and dashes to phone numbers,
      // which we do not want to keep for now
      .replace(/[\s-]/g, '')
  )
}
export async function writeJSONToCSV(
  filename: string,
  data: Array<Record<string, any>>
) {
  const csv = stringify(data, {
    header: true
  })
  return fs.promises.writeFile(filename, csv, 'utf8')
}

export async function readCSVToJSON<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    createReadStream(filename)
      .on('error', reject)
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', (chunk) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}

export const buildTypeScriptToJavaScript = memoize(async (path: string) => {
  const result = await build({
    entryPoints: [path],
    write: false,
    format: 'esm',
    platform: 'browser'
  })

  return result.outputFiles[0].text
})

type Year = {
  year: number
  male_population: number
  female_population: number
  population: number
  crude_birth_rate: number
}

export type LocationStatistic = {
  id: string
  name: string
  years: Year[]
}

export async function getStatistics(path?: string) {
  if (!path) {
    path = join(__dirname, '../data-seeding/locations/source/statistics.csv')
  }
  const data =
    await readCSVToJSON<Array<Record<string, string> & { adminPcode: string }>>(
      path
    )

  return data.map<LocationStatistic>((item) => {
    const { adminPcode, name, ...yearKeys } = item
    return {
      id: adminPcode,
      name,
      years: Object.keys(yearKeys)
        .map((key) => key.split('_').pop())
        .map(Number)
        .filter((value, index, list) => list.indexOf(value) === index)
        .map((year) => ({
          year,
          male_population: parseFloat(yearKeys[`male_population_${year}`]),
          female_population: parseFloat(yearKeys[`female_population_${year}`]),
          population: parseFloat(yearKeys[`population_${year}`]),
          crude_birth_rate: parseFloat(yearKeys[`crude_birth_rate_${year}`])
        }))
    }
  })
}

export const extractStatisticsMap = (statistics: LocationStatistic[]) => {
  const statisticsMap: Map<string, LocationStatistic> = new Map()
  for (const stat of statistics) {
    statisticsMap.set(stat.id, stat)
  }
  return statisticsMap
}

export function createCustomFieldHandlebarName(fieldId: string) {
  const fieldIdNameArray = fieldId.split('.').map((field, index) => {
    if (index !== 0) {
      return field.charAt(0).toUpperCase() + field.slice(1)
    } else {
      return field
    }
  })

  return `${fieldIdNameArray[0]}${fieldIdNameArray[1]}${
    fieldIdNameArray[fieldIdNameArray.length - 1]
  }`
}

export function uppercaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateRegistrationNumber(trackingId: string): string {
  /* adding current year */
  let brn = new Date().getFullYear().toString()

  /* appending tracking id */
  brn = brn.concat(trackingId)

  return brn
}

export function createUniqueRegistrationNumberFromBundle(bundle: fhir.Bundle) {
  const taskResource = getTaskResource(bundle)

  if (!taskResource || !taskResource.extension) {
    throw new Error(
      'Failed to validate registration: could not find task resource in bundle or task resource had no extensions'
    )
  }

  const trackingId = getTrackingIdFromTaskResource(taskResource)
  const compositionId = getCompositionId(bundle)

  return {
    trackingId,
    compositionId,
    registrationNumber: generateRegistrationNumber(trackingId),
    ...(taskResource.code?.coding?.[0].code === 'BIRTH' && {
      // Some countries desire to create multiple identifiers for citizens at the point of birth registration using external systems.
      // OpenCRVS supports up to 3 additional, custom identifiers that can be created
      childIdentifiers: [
        {
          type: 'BIRTH_CONFIGURABLE_IDENTIFIER_1',
          value: ''
        },
        {
          type: 'BIRTH_CONFIGURABLE_IDENTIFIER_2',
          value: ''
        },
        {
          type: 'BIRTH_CONFIGURABLE_IDENTIFIER_3',
          value: ''
        }
      ]
    })
  }
}

/**
 * Hapi 21 types `request.headers.authorization` as `string | string[] | undefined`.
 * The toolkit API client (`createClient`) and downstream credential issuer services
 * expect a single `Bearer ...` token. Normalize the header to that shape.
 */
export function getBearerToken(
  authorization: string | string[] | undefined
): `Bearer ${string}` {
  const token = Array.isArray(authorization) ? authorization[0] : authorization
  if (!token) {
    throw new Error('Missing authorization header')
  }
  return token as `Bearer ${string}`
}
