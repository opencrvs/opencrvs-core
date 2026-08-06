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

import csv2json from 'csv2json'
import { createReadStream } from 'fs'
import fs from 'fs'
import { build } from 'esbuild'
import { memoize } from 'lodash'
import { join } from 'path'
import { stringify } from 'csv-stringify/sync'

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
    loader: { '.ts': 'ts' },
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
