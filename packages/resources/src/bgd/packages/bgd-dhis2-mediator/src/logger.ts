import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  transports: [new transports.Console()],
  silent: process.env.NODE_ENV === 'test' ? true : false,
  format: format.combine(format.splat(), format.simple())
})
