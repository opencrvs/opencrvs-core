import { readPoints } from 'src/influxdb/client'
import {
  ageIntervals,
  calculateInterval,
  IPoint,
  LABEL_FOMRAT
} from 'src/features/registration/metrics/utils'
import * as moment from 'moment'
import { fetchFHIR } from '../fhirUtils'
import { IAuthHeader } from '..'
import {
  OPENCRVS_SPECIFICATION_URL,
  CRUD_BIRTH_RATE_SEC,
  TOTAL_POPULATION_SEC,
  MALE,
  FEMALE,
  WITHIN_45_DAYS,
  WITHIN_1_YEAR,
  TIME_TO
} from './constants'

interface IGroupedByGender {
  total: number
  gender: string
}

type BirthKeyFigures = {
  label: string
  value: number
  total: number
  categoricalData: BirthKeyFiguresData[]
}

type BirthKeyFiguresData = {
  name: string
  value: number
}

export async function regByAge(timeStart: string, timeEnd: string) {
  let metricsData: any[] = []
  for (let i = 0; i < ageIntervals.length; i++) {
    const points = await readPoints(
      `SELECT COUNT(age_in_days) FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd} AND age_in_days > ${
        ageIntervals[i].minAgeInDays
      } AND age_in_days <= ${ageIntervals[i].maxAgeInDays}`
    )

    metricsData.push({
      label: ageIntervals[i].title,
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
      points.reduce((total: IPoint, point: IPoint) => ({
        count: total.count + point.count
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
  locationId: string,
  authHeader: IAuthHeader
) {
  const year = new Date(Number(TIME_TO) / 100000).getFullYear().toString()
  const locationData: fhir.Location = await fetchFHIR(locationId, authHeader)
  const extensions = locationData.extension
  let crudBirthRate: number = 1
  let midYearPoulation: number = 1
  let valueArray: any[]

  if (!extensions) {
    return []
  }

  extensions.forEach(extension => {
    if (extension.url === OPENCRVS_SPECIFICATION_URL + CRUD_BIRTH_RATE_SEC) {
      valueArray = JSON.parse(extension.valueString as string)
      valueArray.forEach(data => {
        if (year in data) {
          crudBirthRate = data[year]
        }
      })
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + TOTAL_POPULATION_SEC
    ) {
      valueArray = JSON.parse(extension.valueString as string)
      valueArray.forEach(data => {
        if (year in data) {
          midYearPoulation = data[year]
        }
      })
    }
  })

  const within45Days: IGroupedByGender[] = await readPoints(
    `SELECT COUNT(age_in_days) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}
      AND ( locationLevel2 = '${locationId}' 
          OR locationLevel3 = '${locationId}' )
      AND age_in_days <= 45
    GROUP BY gender`
  )

  const within1Year: IGroupedByGender[] = await readPoints(
    `SELECT COUNT(age_in_days) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}
      AND age_in_days > 45
      AND age_in_days <= 365
      AND ( locationLevel2 = '${locationId}'
        OR locationLevel3 = '${locationId}' )
    GROUP BY gender`
  )

  let total45 = 0
  let total45Male = 0
  let total45Female = 0
  let total1Year = 0
  let total1YearMale = 0
  let total1YearFemale = 0

  within45Days.forEach(data => {
    if (data.gender === MALE) {
      total45Male = data.total
    } else {
      total45Female = data.total
    }
  })

  within1Year.forEach(data => {
    if (data.gender === MALE) {
      total1YearMale = data.total
    } else {
      total1YearFemale = data.total
    }
  })

  total45 = total45Female + total45Male
  total45Male = Math.ceil(
    (total45Male / ((crudBirthRate * midYearPoulation) / 1000)) * 100
  )
  total45Female = Math.ceil(
    (total45Female / ((crudBirthRate * midYearPoulation) / 1000)) * 100
  )
  total45 = Math.ceil(
    (total45 / ((crudBirthRate * midYearPoulation) / 1000)) * 100
  )

  total1Year = total1YearMale + total1YearFemale
  total1YearMale = Math.ceil(
    (total1YearMale / ((crudBirthRate * midYearPoulation) / 1000)) * 100
  )
  total1YearFemale = Math.ceil(
    (total1YearFemale / ((crudBirthRate * midYearPoulation) / 1000)) * 100
  )
  total1Year = Math.ceil(
    (total1Year / ((crudBirthRate * midYearPoulation) / 1000)) * 100
  )

  const total = total45 + total1Year

  const categoricalData45: BirthKeyFiguresData[] = [
    {
      name: FEMALE,
      value: total45Female
    },
    {
      name: MALE,
      value: total45Male
    }
  ]

  const categoricalData1Year: BirthKeyFiguresData[] = [
    {
      name: FEMALE,
      value: total1YearFemale
    },
    {
      name: MALE,
      value: total1YearMale
    }
  ]

  const keyFigs: BirthKeyFigures[] = [
    createBirthKeyFiguresObj(WITHIN_45_DAYS, total45, total, categoricalData45),
    createBirthKeyFiguresObj(
      WITHIN_1_YEAR,
      total1Year,
      total,
      categoricalData1Year
    )
  ]

  return keyFigs
}

const createBirthKeyFiguresObj = (
  label: string,
  value: number,
  total: number,
  categoricalData: BirthKeyFiguresData[]
): BirthKeyFigures => {
  return {
    label,
    value,
    total,
    categoricalData
  }
}
