import {
  FEMALE,
  MALE,
  WITHIN_1_YEAR,
  WITHIN_45_DAYS,
  WITHIN_45_DAYS_TO_1_YEAR
} from '@metrics/features/registration/metrics/constants'
import {
  ageIntervals,
  calculateInterval,
  fetchEstimateByLocation,
  generateEmptyBirthKeyFigure,
  IPoint,
  LABEL_FOMRAT,
  Location
} from '@metrics/features/registration/metrics/utils'
import { readPoints } from '@metrics/influxdb/client'
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

export async function regByAge(timeStart: string, timeEnd: string) {
  const metricsData: any[] = []
  for (const ageInterval of ageIntervals) {
    const points = await readPoints(
      // tslint:disable-next-line
      `SELECT COUNT(age_in_days) FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd} AND age_in_days > ${ageInterval.minAgeInDays} AND age_in_days <= ${ageInterval.maxAgeInDays}`
    )

    metricsData.push({
      label: ageInterval.title,
      value: (points && points.length > 0 && points[0].count) || 0
    })
  }

  return metricsData
}

export const regWithin45d = async (timeStart: string, timeEnd: string) => {
  const interval = calculateInterval(timeStart, timeEnd)
  const points = await readPoints(
    `
      SELECT COUNT(age_in_days) AS count
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
  const within45DaysData: IGroupedByGender[] = await readPoints(
    `SELECT COUNT(age_in_days) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}      
      AND ( locationLevel2 = '${queryLocationId}' 
          OR locationLevel3 = '${queryLocationId}'
          OR locationLevel4 = '${queryLocationId}' 
          OR locationLevel5 = '${queryLocationId}' )
      AND age_in_days <= 45
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
  const within1YearData: IGroupedByGender[] = await readPoints(
    `SELECT COUNT(age_in_days) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}      
      AND ( locationLevel2 = '${queryLocationId}' 
          OR locationLevel3 = '${queryLocationId}'
          OR locationLevel4 = '${queryLocationId}' 
          OR locationLevel5 = '${queryLocationId}' )      
      AND age_in_days > 45
      AND age_in_days <= 365
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
