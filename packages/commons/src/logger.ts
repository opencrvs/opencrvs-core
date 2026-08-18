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
import pino, { LogFn, Logger } from 'pino'

/**
 * pino only merges a trailing argument into the structured log record when
 * the first argument is itself an object. Callers in this codebase mostly
 * use the `logger.error('message', err)` string-first form, so pino was
 * silently dropping the extra argument. This normalizes that form into
 * pino's native `[mergingObject, message]` shape so it always gets logged.
 */
export function normalizeLogArgs(args: unknown[]): unknown[] {
  const [first, ...rest] = args
  if (typeof first !== 'string' || rest.length === 0) {
    return args
  }

  const mergingObject: Record<string, unknown> = {}
  const primitives: unknown[] = []

  for (const arg of rest) {
    if (arg instanceof Error) {
      // Error's message/stack aren't enumerable, so extract them explicitly.
      mergingObject.err = pino.stdSerializers.err(arg)
    } else if (arg !== null && typeof arg === 'object') {
      // Plain objects get merged as top-level structured fields.
      Object.assign(mergingObject, arg)
    } else {
      // Primitives (string/number/boolean) get appended to the message text.
      primitives.push(arg)
    }
  }

  const message = primitives.length ? `${first} ${primitives.join(' ')}` : first

  return Object.keys(mergingObject).length
    ? [mergingObject, message]
    : [message]
}

function filterHealthCheckLogs(this: Logger, args: unknown[], method: LogFn) {
  const logger = this as any
  for (const arg of args) {
    if (typeof arg === 'string' && arg.includes('get /ping 200')) {
      if (logger.debug) {
        return logger.debug(...args)
      }
    }
  }
  return method.apply(this, normalizeLogArgs(args) as Parameters<LogFn>)
}

export function buildLoggerOptions(): pino.LoggerOptions {
  return {
    serializers: { err: pino.stdSerializers.err },
    hooks: { logMethod: filterHealthCheckLogs }
  }
}

export const logger: Logger =
  process.env.NODE_ENV === 'production'
    ? pino({
        level: 'info',
        redact: [
          'req.headers.authorization',
          'req.remoteAddress',
          "req.headers['x-real-ip']"
        ],
        ...buildLoggerOptions()
      })
    : pino({
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname'
          }
        },
        ...buildLoggerOptions()
      })

const level = process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL
if (level) {
  logger.level = level
}

export function maskEmail(email: string) {
  if (email.length <= 10)
    return `${email.at(0)}${'*'.repeat(email.length - 2)}${email.at(-1)}`

  // The regex matches everything EXCEPT the first 3 and last 4 characters.
  return email.replace(/(?<=.{3}).*(?=.{4})/, (match) =>
    '*'.repeat(match.length)
  )
}

export function maskSms(sms: string) {
  if (sms.length <= 8)
    return `${sms.at(0)}${'*'.repeat(sms.length - 2)}${sms.at(-1)}`

  // The regex matches everything EXCEPT the first 3 and last 2 characters.
  return sms.replace(/(?<=.{3}).*(?=.{2})/, (match) => '*'.repeat(match.length))
}
