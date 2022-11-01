import { InfluxDB, FieldType } from 'influx'

const INFLUX_HOST = process.env.INFLUX_HOST || 'localhost'
const INFLUX_PORT = process.env.INFLUX_PORT || 8086
const INFLUX_DB = process.env.INFLUX_DB || 'ocrvs'

export const influx = new InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: INFLUX_PORT,
  schema: [
    {
      measurement: 'declarations_rejected',
      fields: {
        compositionId: FieldType.STRING
      },
      tags: [
        'eventType',
        'startedBy',
        'officeLocation',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2'
      ]
    }
  ]
})

export const query = (query, options) => {
  try {
    return influx.query(query, options)
  } catch (err) {
    logger.error(`Error reading data from InfluxDB! ${err.stack}`)
    throw err
  }
}

export const writePoints = (points) => {
  return influx.writePoints(points).catch((err) => {
    logger.error(`Error saving data to InfluxDB! ${err.stack}`)
    throw err
  })
}
