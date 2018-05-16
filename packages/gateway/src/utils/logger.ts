import * as Bunyan from 'bunyan'

export const getLogger = (
  logLevel: number | undefined,
  appName: string | undefined
) => {
  return Bunyan.createLogger({
    name: appName ? appName : 'testApp',
    level: logLevel ? logLevel : 0,
    serializers: Bunyan.stdSerializers
  })
}
