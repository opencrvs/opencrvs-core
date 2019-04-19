import { readPoints } from 'src/influxdb/client'
import {
  ageIntervals,
  calculateInterval,
  IPoint
} from 'src/features/registration/metrics/utils'
import * as moment from 'moment'

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
      SELECT COUNT(age_in_days) AS COUNT
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

  return (
    (points &&
      points.map((point: IPoint) => ({
        label: moment(point.time).format('MMMM'),
        value: point.count,
        total: total.count
      }))) ||
    []
  )
}
