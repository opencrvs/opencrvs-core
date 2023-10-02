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
import {
  differenceInDays,
  eachMonthOfInterval,
  eachYearOfInterval,
  startOfYear,
  endOfYear
} from 'date-fns'
import {
  IBirthKeyFigures,
  IEstimation
} from '@metrics/features/metrics/metricsGenerator'
import {
  MALE,
  FEMALE,
  OPENCRVS_SPECIFICATION_URL,
  CRUD_BIRTH_RATE_SEC,
  TOTAL_POPULATION_SEC,
  MALE_POPULATION_SEC,
  FEMALE_POPULATION_SEC,
  JURISDICTION_TYPE_SEC,
  JURISDICTION_TYPE_IDENTIFIER
} from '@metrics/features/metrics/constants'
import { IAuthHeader } from '@metrics/features/registration'
import {
  fetchLocation,
  fetchFromResource,
  fetchFHIR,
  fetchChildLocationsByParentId
} from '@metrics/api'
import { getApplicationConfig } from '@metrics/configApi'
export const YEARLY_INTERVAL = '365d'
export const MONTHLY_INTERVAL = '30d'
export const WEEKLY_INTERVAL = '7d'

export const LABEL_FOMRAT = {
  [YEARLY_INTERVAL]: 'yyyy',
  [MONTHLY_INTERVAL]: 'MMMM',
  [WEEKLY_INTERVAL]: 'dd-MM-yyyy'
}

export interface IPoint {
  time: string
  count: number
}

export interface ICrudeDeathRate {
  crudeDeathRate: number
}

export interface IMonthRangeFilter {
  startOfMonthTime: string
  endOfMonthTime: string
  month: string
  year: number
  monthIndex: number
}

export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH',
  MARRIAGE = 'MARRIAGE'
}

export type Location = fhir.Location & { id: string }

export const calculateInterval = (startTime: string, endTime: string) => {
  const timeStartInMil = parseInt(startTime.substr(0, 13), 10)
  const timeEndInMil = parseInt(endTime.substr(0, 13), 10)
  const diffInDays = differenceInDays(timeEndInMil, timeStartInMil)

  if (diffInDays > 365) {
    return YEARLY_INTERVAL
  } else if (diffInDays > 30 && diffInDays <= 365) {
    return MONTHLY_INTERVAL
  } else {
    return WEEKLY_INTERVAL
  }
}

export const generateEmptyBirthKeyFigure = (
  label: string,
  estimate: number
): IBirthKeyFigures => {
  return {
    label,
    value: 0,
    total: 0,
    estimate,
    categoricalData: [
      {
        name: FEMALE,
        value: 0
      },
      {
        name: MALE,
        value: 0
      }
    ]
  }
}

export const fetchEstimateByLocation = async (
  locationData: Location,
  event: EVENT_TYPE,
  authHeader: IAuthHeader,
  timeFrom: string,
  timeTo: string
): Promise<IEstimation> => {
  let totalEstimation = 0
  let maleEstimation = 0
  let femaleEstimation = 0
  let estimateExtensionFound = false
  const toYear = new Date(timeTo).getFullYear()
  const fromYear = new Date(timeFrom).getFullYear()
  const yearArray: number[] = []
  const crudArray: number[] = []
  const malePopulationArray: number[] = []
  const femalePopulationArray: number[] = []
  const totalPopulationArray: number[] = []
  const estimationForDaysArray = getDaysPerYear(
    new Date(timeFrom),
    new Date(timeTo)
  )

  for (let year = fromYear; year <= toYear; year++) {
    yearArray.push(year)
  }

  if (!locationData.extension) {
    return {
      totalEstimation: 0,
      maleEstimation: 0,
      femaleEstimation: 0,
      locationId: locationData.id,
      locationLevel: getLocationLevelFromLocationData(locationData)
    }
  }

  locationData.extension.forEach((extension) => {
    if (
      extension.url === OPENCRVS_SPECIFICATION_URL + CRUD_BIRTH_RATE_SEC &&
      event === EVENT_TYPE.BIRTH
    ) {
      estimateExtensionFound = true
      const valueArray = JSON.parse(extension.valueString as string) as {
        [key: string]: number
      }[]

      for (let i = 0; i < yearArray.length; i++) {
        const year = yearArray[i].toString()
        const entry = valueArray.find((obj) => obj.hasOwnProperty(year))
        if (entry) {
          crudArray.push(Number(entry[year]))
        } else {
          crudArray.push(0)
        }
      }
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + TOTAL_POPULATION_SEC
    ) {
      estimateExtensionFound = true
      const valueArray = JSON.parse(extension.valueString as string) as {
        [key: string]: number
      }[]

      for (let i = 0; i < yearArray.length; i++) {
        const year = yearArray[i].toString()
        const entry = valueArray.find((obj) => obj.hasOwnProperty(year))
        if (entry) {
          totalPopulationArray.push(Number(entry[year]))
        } else {
          totalPopulationArray.push(0)
        }
      }
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + MALE_POPULATION_SEC
    ) {
      const valueArray = JSON.parse(extension.valueString as string) as {
        [key: string]: number
      }[]

      for (let i = 0; i < yearArray.length; i++) {
        const year = yearArray[i].toString()
        const entry = valueArray.find((obj) => obj.hasOwnProperty(year))
        if (entry) {
          malePopulationArray.push(Number(entry[year]))
        } else {
          malePopulationArray.push(0)
        }
      }
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + FEMALE_POPULATION_SEC
    ) {
      const valueArray = JSON.parse(extension.valueString as string) as {
        [key: string]: number
      }[]

      for (let i = 0; i < yearArray.length; i++) {
        const year = yearArray[i].toString()
        const entry = valueArray.find((obj) => obj.hasOwnProperty(year))
        if (entry) {
          femalePopulationArray.push(Number(entry[year]))
        } else {
          femalePopulationArray.push(0)
        }
      }
    }
  })
  if (!estimateExtensionFound) {
    return {
      totalEstimation: 0,
      maleEstimation: 0,
      femaleEstimation: 0,
      locationId: locationData.id,
      locationLevel: getLocationLevelFromLocationData(locationData)
    }
  }
  if (event === EVENT_TYPE.DEATH) {
    const crudeDeathRateResponse: ICrudeDeathRate = await fetchFromResource(
      'crude-death-rate',
      authHeader
    )

    for (let i = 0; i < yearArray.length; i++) {
      crudArray.push(Number(crudeDeathRateResponse.crudeDeathRate))
    }
  }
  for (let i = 0; i < yearArray.length; i++) {
    totalEstimation =
      totalEstimation +
      ((crudArray[i] * totalPopulationArray[i]) / 1000) *
        (estimationForDaysArray[i] / 365)

    maleEstimation =
      maleEstimation +
      ((crudArray[i] * malePopulationArray[i]) / 1000) *
        (estimationForDaysArray[i] / 365)

    femaleEstimation =
      femaleEstimation +
      ((crudArray[i] * femalePopulationArray[i]) / 1000) *
        (estimationForDaysArray[i] / 365)
  }

  return {
    totalEstimation: Math.round(totalEstimation),
    maleEstimation: Math.round(maleEstimation),
    femaleEstimation: Math.round(femaleEstimation),
    locationId: locationData.id,
    locationLevel: getLocationLevelFromLocationData(locationData)
  }
}

export const getLocationLevelFromLocationData = (locationData: Location) => {
  return (
    locationData?.identifier?.find(
      (identifier) =>
        identifier.system ===
        OPENCRVS_SPECIFICATION_URL + JURISDICTION_TYPE_IDENTIFIER
    )?.value ?? ''
  )
}

export const fetchEstimateForTargetDaysByLocationId = async (
  locationId: string | undefined,
  event: EVENT_TYPE,
  authHeader: IAuthHeader,
  timeFrom: string,
  timeTo: string
): Promise<IEstimation> => {
  if (locationId) {
    const locationData: Location = await fetchFHIR(locationId, authHeader)
    return await fetchEstimateByLocation(
      locationData,
      event,
      authHeader,
      timeFrom,
      timeTo
    )
  } else {
    const locationData = (await fetchChildLocationsByParentId(
      'Location/0',
      authHeader
    )) as Location[]

    const total = {
      totalEstimation: 0,
      maleEstimation: 0,
      femaleEstimation: 0,
      locationId: 'Location/0',
      locationLevel: 'COUNTRY'
    }

    for (const location of locationData) {
      const estimate = await fetchEstimateByLocation(
        location,
        event,
        authHeader,
        timeFrom,
        timeTo
      )
      total.totalEstimation += estimate.totalEstimation || 0
      total.maleEstimation += estimate.maleEstimation || 0
      total.femaleEstimation += estimate.femaleEstimation || 0
    }
    return total
  }
}

export const getDistrictLocation = async (
  locationId: string,
  authHeader: IAuthHeader
): Promise<Location> => {
  let lId = locationId

  let locationBundle = await fetchLocation(lId, authHeader)

  let locationType = getJurisdictionType(locationBundle)
  while (
    locationBundle &&
    (!locationType || locationType.value !== 'DISTRICT')
  ) {
    lId =
      (locationBundle &&
        locationBundle.partOf &&
        locationBundle.partOf.reference &&
        locationBundle.partOf.reference.split('/')[1]) ||
      ''
    locationBundle = await fetchLocation(lId, authHeader)
    locationType = getJurisdictionType(locationBundle)
  }

  if (!locationBundle) {
    throw new Error('No district location found')
  }

  return locationBundle as Location
}

export function getJurisdictionType(locationBundle: fhir.Location) {
  return (
    locationBundle &&
    locationBundle.identifier &&
    locationBundle.identifier.find(
      (identifier) =>
        identifier.system === OPENCRVS_SPECIFICATION_URL + JURISDICTION_TYPE_SEC
    )
  )
}

export function getLocationType(location: fhir.Location): string {
  if (location.type?.coding?.[0]?.code) {
    return location.type.coding[0].code
  } else {
    throw new Error(
      `Location type could not be found for location, location id ${location.id}`
    )
  }
}
export function fillEmptyDataArrayByKey(
  dataArray: Array<any>,
  emptyDataArray: Array<any>,
  key: string
) {
  const result: Array<any> = []
  for (const eachItem of emptyDataArray) {
    const itemInArray = dataArray.find(
      (itemInDataArray) => itemInDataArray[key] === eachItem[key]
    )

    result.push(itemInArray || eachItem)
  }

  return result
}

export async function fetchChildLocationIdsByParentId(
  parentLocationId: string,
  currentLocationLevel: string,
  lowerLocationLevel: string,
  authHeader: IAuthHeader
) {
  if (currentLocationLevel !== lowerLocationLevel) {
    const bundle = await fetchFHIR(
      `Location?partof=${parentLocationId}`,
      authHeader
    )

    return (
      (bundle &&
        bundle.entry.map(
          (entry: { resource: { id: string } }) =>
            `Location/${entry.resource.id}`
        )) ||
      []
    )
  }
  return [`Location/${parentLocationId}`]
}

export function getMonthRangeFilterListFromTimeRage(
  timeStart: string,
  timeEnd: string
): IMonthRangeFilter[] {
  const startDateMonth = new Date(timeStart).getMonth()
  const startDateYear = new Date(timeStart).getFullYear()
  const endDateMonth = new Date(timeEnd).getMonth()
  const endDateYear = new Date(timeEnd).getFullYear()

  const monthFilterList: IMonthRangeFilter[] = []
  const monthDiffs =
    (endDateYear - startDateYear) * 12 + (endDateMonth - startDateMonth)
  const rangeOfMonths = eachMonthOfInterval({
    start: new Date(timeStart),
    end: new Date(timeEnd)
  })
  for (let index = 0; index <= monthDiffs; index += 1) {
    const filterDate = rangeOfMonths[index]
    monthFilterList.push({
      monthIndex: filterDate.getMonth(),
      month: filterDate.toLocaleString('en-us', { month: 'long' }),
      year: filterDate.getFullYear(),
      startOfMonthTime: new Date(
        filterDate.getFullYear(),
        filterDate.getMonth(),
        1
      ).toISOString(),
      endOfMonthTime: new Date(
        filterDate.getFullYear(),
        filterDate.getMonth() + 1,
        1
      ).toISOString()
    })
  }

  return monthFilterList
}

export async function getRegistrationTargetDays(
  event: string,
  authorization: string
) {
  const applicationConfig = await getApplicationConfig(authorization)
  const targetDays =
    event === EVENT_TYPE.BIRTH
      ? applicationConfig.BIRTH?.REGISTRATION_TARGET
      : event === EVENT_TYPE.DEATH
      ? applicationConfig.DEATH?.REGISTRATION_TARGET
      : applicationConfig.MARRIAGE?.REGISTRATION_TARGET
  return targetDays
}

export async function getRegistrationLateTargetDays(
  event: string,
  authorization: string
): Promise<number | null> {
  const applicationConfig = await getApplicationConfig(authorization)
  const targetDays =
    event === EVENT_TYPE.BIRTH
      ? applicationConfig.BIRTH?.LATE_REGISTRATION_TARGET
      : null
  return targetDays
}

export function getPercentage(value: number, total: number, decimalPoint = 2) {
  return value === 0 || total === 0
    ? 0
    : Number(((value / total) * 100).toFixed(decimalPoint))
}

export function getPopulation(
  location: fhir.Location,
  populationYear: number
): number {
  const totalPopulationExtension = location.extension?.find(
    (ext) => ext.url === OPENCRVS_SPECIFICATION_URL + TOTAL_POPULATION_SEC
  )

  if (!totalPopulationExtension) {
    throw new Error(
      `Total population extension not found for location, location ID: ${location.id}`
    )
  }
  const populationDataArray: Record<string, number>[] =
    totalPopulationExtension.valueString
      ? JSON.parse(totalPopulationExtension.valueString)
      : []
  const populationYears = populationDataArray.map((data) =>
    Number(Object.keys(data)[0])
  )
  const latestAvailableYear = Math.max(...populationYears)
  const populationYearToConsider =
    populationYear > latestAvailableYear ? latestAvailableYear : populationYear
  const totalPopulation = populationDataArray.find((record) =>
    record.hasOwnProperty(populationYearToConsider.toString())
  )

  return totalPopulation ? totalPopulation[populationYearToConsider] : 0
}

export function getDaysPerYear(fromDate: Date, toDate: Date) {
  const daysPerYear: number[] = []
  eachYearOfInterval({ start: fromDate, end: toDate }).forEach((date) => {
    const year = date.getFullYear()
    let rangeStart = startOfYear(new Date(year, 0, 1))
    let rangeEnd = endOfYear(new Date(year, 11, 31))
    if (rangeStart < fromDate) rangeStart = fromDate
    if (rangeEnd > toDate) rangeEnd = toDate
    daysPerYear.push(differenceInDays(rangeEnd, rangeStart) + 1)
  })
  return daysPerYear
}
