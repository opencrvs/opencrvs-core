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
import {
  FEMALE,
  MALE,
  WITHIN_1_YEAR,
  WITHIN_45_DAYS,
  WITHIN_45_DAYS_TO_1_YEAR
} from '@metrics/features/metrics/constants'
import {
  ageIntervals,
  calculateInterval,
  fetchEstimateByLocation,
  generateEmptyBirthKeyFigure,
  IPoint,
  LABEL_FOMRAT,
  Location
} from '@metrics/features/metrics/utils'
import { query } from '@metrics/influxdb/client'
import * as moment from 'moment'

interface IGroupedByGender {
  total: number
  gender: string
}

export interface IBirthKeyFigures {
  label: string
  value: number
  total: number
  estimate: number
  categoricalData: IBirthKeyFiguresData[]
}

interface IBirthKeyFiguresData {
  name: string
  value: number
}

export interface IEstimation {
  estimation: number
  locationId: string
}

interface ICurrentAndLowerLocationLevels {
  currentLocationLevel: string
  lowerLocationLevel: string
}
interface IGenderBasisMetrics {
  location: string
  maleUnder18: number
  femaleUnder18: number
  maleOver18: number
  femaleOver18: number
  total: number
}

interface IGenderBasisPoint {
  gender: string
  over18: number
  under18: number
  locationLevel2?: string
  locationLevel3?: string
  locationLevel4?: string
  locationLevel5?: string
}

export async function regByAge(timeStart: string, timeEnd: string) {
  const metricsData: any[] = []
  for (const ageInterval of ageIntervals) {
    const points = await query(
      // tslint:disable-next-line
      `SELECT COUNT(ageInDays) FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd} AND ageInDays > ${ageInterval.minAgeInDays} AND ageInDays <= ${ageInterval.maxAgeInDays}`
    )

    metricsData.push({
      label: ageInterval.title,
      value: (points && points.length > 0 && points[0].count) || 0
    })
  }

  return metricsData
}

type Payment = {
  total: number
}

export async function fetchCertificationPayments(
  timeStart: string,
  timeEnd: string,
  locationId: string,
  currentLocationLevel: string,
  lowerLocationLevel: string
) {
  const payments = await query(
    `SELECT SUM(total) as total FROM certification_payment WHERE time > ${timeStart} AND time <= ${timeEnd}
      AND ${currentLocationLevel}='${locationId}'
      GROUP BY ${lowerLocationLevel}`
  )

  return payments.map((payment: Payment) => ({
    total: payment.total,
    locationId: payment[lowerLocationLevel]
  }))
}

export async function fetchRegWithinTimeFrames(
  timeStart: string,
  timeEnd: string,
  locationId: string,
  currentLocationLevel: string,
  lowerLocationLevel: string
) {
  const timeFramePoints = await query(
    `SELECT
      SUM(within45Days) AS regWithin45d,
      SUM(within45DTo1Yr) AS regWithin45dTo1yr,
      SUM(within1YrTo5Yr) AS regWithin1yrTo5yr,
      SUM(over5Yr) AS regOver5yr
     FROM (
       SELECT within45Days, within45DTo1Yr, within1YrTo5Yr, over5Yr, ${lowerLocationLevel}
       FROM (
        SELECT COUNT(ageInDays) AS within45Days FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd}
      AND ageInDays > -1 AND ageInDays <= 45 AND ${currentLocationLevel}='${locationId}'
        GROUP BY ${lowerLocationLevel}
       ), (
        SELECT COUNT(ageInDays) AS within45DTo1Yr FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd}
      AND ageInDays > 46 AND ageInDays <= 365 AND ${currentLocationLevel}='${locationId}'
        GROUP BY ${lowerLocationLevel}
       ), (
        SELECT COUNT(ageInDays) AS within1YrTo5Yr FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd}
      AND ageInDays > 366 AND ageInDays <= 1825 AND ${currentLocationLevel}='${locationId}'
        GROUP BY ${lowerLocationLevel}
       ), (
        SELECT COUNT(ageInDays) AS over5Yr FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd}
      AND ageInDays > 1826 AND ${currentLocationLevel}='${locationId}'
        GROUP BY ${lowerLocationLevel}
       ) FILL(0)
     ) GROUP BY ${lowerLocationLevel}
     `
  )

  return timeFramePoints.map((point: any) => {
    const {
      regWithin45d,
      regWithin45dTo1yr,
      regWithin1yrTo5yr,
      regOver5yr
    } = point
    const total =
      regWithin45d + regWithin45dTo1yr + regWithin1yrTo5yr + regOver5yr
    return {
      locationId: point[lowerLocationLevel],
      regWithin45d,
      regWithin45dTo1yr,
      regWithin1yrTo5yr,
      regOver5yr,
      total
    }
  })
}

export async function getCurrentAndLowerLocationLevels(
  timeStart: string,
  timeEnd: string,
  locationId: string
): Promise<ICurrentAndLowerLocationLevels> {
  const allPointsContainingLocationId = await query(
    `SELECT LAST(*) FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd}
      AND ( locationLevel2 = '${locationId}'
        OR locationLevel3 = '${locationId}'
        OR locationLevel4 = '${locationId}'
        OR locationLevel5 = '${locationId}')
      GROUP BY locationLevel2,locationLevel3,locationLevel4,locationLevel5`
  )

  const locationLevelOfQueryId =
    allPointsContainingLocationId &&
    allPointsContainingLocationId.length > 0 &&
    Object.keys(allPointsContainingLocationId[0]).find(
      key => allPointsContainingLocationId[0][key] === locationId
    )
  const oneLevelLowerLocationColumn =
    locationLevelOfQueryId &&
    locationLevelOfQueryId.replace(/\d/, level =>
      level === '5' ? level : String(Number(level) + 1)
    )

  if (!locationLevelOfQueryId || !oneLevelLowerLocationColumn) {
    throw new Error(`Location level not found for location ${locationId}`)
  }

  return {
    currentLocationLevel: locationLevelOfQueryId,
    lowerLocationLevel: oneLevelLowerLocationColumn
  }
}

export const regWithin45Days = async (timeStart: string, timeEnd: string) => {
  const interval = calculateInterval(timeStart, timeEnd)
  const points = await query(
    `
      SELECT COUNT(ageInDays) AS count
        FROM birth_reg
      WHERE time >= ${timeStart} AND time <= ${timeEnd}
        GROUP BY time(${interval})
    `
  )

  const total =
    (points &&
      points.reduce((pointsTotal: IPoint, point: IPoint) => ({
        count: pointsTotal.count + point.count
      }))) ||
    0
  const label = LABEL_FOMRAT[interval]

  return (
    (points &&
      points.map((point: IPoint) => ({
        label: moment(point.time).format(label),
        value: point.count,
        totalEstimate: total.count
      }))) ||
    []
  )
}

export async function fetchKeyFigures(
  timeStart: string,
  timeEnd: string,
  location: Location
) {
  const estimatedFigure = await fetchEstimateByLocation(
    location,
    // TODO: need to adjust this when date range is properly introduced
    new Date().getFullYear()
  )

  const keyFigures: IBirthKeyFigures[] = []
  const queryLocationId = `Location/${estimatedFigure.locationId}`

  /* Populating < 45D data */
  const within45DaysData: IGroupedByGender[] = await query(
    `SELECT COUNT(ageInDays) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}
      AND ( locationLevel2 = '${queryLocationId}'
          OR locationLevel3 = '${queryLocationId}'
          OR locationLevel4 = '${queryLocationId}'
          OR locationLevel5 = '${queryLocationId}' )
      AND ageInDays <= 45
    GROUP BY gender`
  )
  keyFigures.push(
    populateBirthKeyFigurePoint(
      WITHIN_45_DAYS,
      within45DaysData,
      estimatedFigure.estimation
    )
  )
  /* Populating > 45D and < 365D data */
  const within1YearData: IGroupedByGender[] = await query(
    `SELECT COUNT(ageInDays) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}
      AND ( locationLevel2 = '${queryLocationId}'
          OR locationLevel3 = '${queryLocationId}'
          OR locationLevel4 = '${queryLocationId}'
          OR locationLevel5 = '${queryLocationId}' )
      AND ageInDays > 45
      AND ageInDays <= 365
    GROUP BY gender`
  )
  keyFigures.push(
    populateBirthKeyFigurePoint(
      WITHIN_45_DAYS_TO_1_YEAR,
      within1YearData,
      estimatedFigure.estimation
    )
  )
  /* Populating < 365D data */
  let fullData: IGroupedByGender[] = []
  if (within45DaysData) {
    fullData = fullData.concat(within45DaysData)
  }
  if (within1YearData) {
    fullData = fullData.concat(within1YearData)
  }
  keyFigures.push(
    populateBirthKeyFigurePoint(
      WITHIN_1_YEAR,
      fullData,
      estimatedFigure.estimation
    )
  )
  return keyFigures
}

const populateBirthKeyFigurePoint = (
  figureLabel: string,
  groupedByGenderData: IGroupedByGender[],
  estimation: number
): IBirthKeyFigures => {
  if (!groupedByGenderData || groupedByGenderData === []) {
    return generateEmptyBirthKeyFigure(figureLabel, estimation)
  }
  let percentage = 0
  let totalMale = 0
  let totalFemale = 0

  groupedByGenderData.forEach(data => {
    if (data.gender === FEMALE) {
      totalFemale += data.total
    } else if (data.gender === MALE) {
      totalMale += data.total
    }
  })
  if (totalMale + totalFemale === 0) {
    return generateEmptyBirthKeyFigure(figureLabel, estimation)
  }

  /* TODO: need to implement different percentage calculation logic
     based on different date range here */
  percentage = Math.round(((totalMale + totalFemale) / estimation) * 100)

  return {
    label: figureLabel,
    value: percentage,
    total: totalMale + totalFemale,
    estimate: estimation,
    categoricalData: [
      {
        name: FEMALE,
        value: totalFemale
      },
      {
        name: MALE,
        value: totalMale
      }
    ]
  }
}

export async function fetchGenderBasisMetrics(
  timeFrom: string,
  timeTo: string,
  currLocation: string,
  currLocationLevel: string,
  locationLevel: string
) {
  const points = await query(`
  SELECT
    SUM(under18) AS under18,
    SUM(over18) AS over18
  FROM (
    SELECT under18, over18, gender, ${locationLevel} FROM (
      SELECT
        COUNT(ageInDays) AS under18
      FROM birth_reg
      WHERE ageInDays < 6574
       AND time > ${timeFrom}
       AND time <= ${timeTo}
       AND ${currLocationLevel}='${currLocation}'
      GROUP BY gender, ${locationLevel}
    ), (
      SELECT
        COUNT(ageInDays) AS over18
      FROM birth_reg
      WHERE ageInDays >= 6574
       AND time > ${timeFrom}
       AND time <= ${timeTo}
       AND ${currLocationLevel}='${currLocation}'
      GROUP BY gender, ${locationLevel}
    ) FILL(0)
  )
  GROUP BY gender, ${locationLevel}
  `)

  return populateGenderBasisMetrics(points, locationLevel)
}

function populateGenderBasisMetrics(
  points: IGenderBasisPoint[],
  locationLevel: string
): IGenderBasisMetrics[] {
  const metricsArray: IGenderBasisMetrics[] = []

  points.forEach((point: IGenderBasisPoint) => {
    const metrics = metricsArray.find(
      element => element.location === point[locationLevel]
    )
    const femaleOver18 =
      point.gender === 'female'
        ? point.over18
        : metrics
        ? metrics.femaleOver18
        : 0
    const maleOver18 =
      point.gender === 'male' ? point.over18 : metrics ? metrics.maleOver18 : 0
    const femaleUnder18 =
      point.gender === 'female'
        ? point.under18
        : metrics
        ? metrics.femaleUnder18
        : 0
    const maleUnder18 =
      point.gender === 'male'
        ? point.under18
        : metrics
        ? metrics.maleUnder18
        : 0

    const total = maleOver18 + femaleOver18 + maleUnder18 + femaleUnder18

    if (!metrics) {
      metricsArray.push({
        location: point[locationLevel],
        femaleOver18: femaleOver18,
        maleOver18: maleOver18,
        maleUnder18: maleUnder18,
        femaleUnder18: femaleUnder18,
        total: total
      })
    } else {
      const index = metricsArray.indexOf(metrics)

      metricsArray.splice(index, 1, {
        location: metrics.location,
        femaleOver18: femaleOver18,
        maleOver18: maleOver18,
        maleUnder18: maleUnder18,
        femaleUnder18: femaleUnder18,
        total: total
      })
    }
  })

  return metricsArray
}
