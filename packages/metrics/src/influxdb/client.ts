import * as Influx from 'influx'
import { INFLUX_DB, INFLUX_HOST, INFLUX_PORT } from './constants'

export const influx = new Influx.InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: INFLUX_PORT,
  schema: [
    {
      measurement: 'birth_reg',
      fields: {
        locationLevel5: Influx.FieldType.STRING,
        locationLevel4: Influx.FieldType.STRING,
        locationLevel3: Influx.FieldType.STRING,
        locationLevel2: Influx.FieldType.STRING,
        current_status: Influx.FieldType.STRING,
        gender: Influx.FieldType.STRING,
        age_in_days: Influx.FieldType.INTEGER
      },
      tags: ['reg_status']
    }
  ]
})

export const writePoints = (points: any[]) => {
  influx
    .writePoints(points)
    .catch((err: Error) =>
      console.log(`Error saving data to InfluxDB! ${err.stack}`)
    )
}

export const readPoints = (query: string) => {
  try {
    return influx.query(query)
  } catch (err) {
    console.log(`Error reading data from InfluxDB! ${err.stack}`)
    throw new Error(err)
  }
}
