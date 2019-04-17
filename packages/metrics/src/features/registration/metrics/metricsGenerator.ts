import { readPoints } from 'src/influxdb/client'
import { ageIntervals } from 'src/features/registration/metrics/utils'
import { RequestQuery } from 'hapi'

export async function regByAge(params: RequestQuery) {
  const timeStart = params && params['timeStart']
  const timeEnd = params && params['timeEnd']

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
