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
import pino from 'pino'
export const logger =
  process.env.NODE_ENV === 'production'
    ? pino({
        redact: [
          'req.headers.authorization',
          'req.remoteAddress',
          "req.headers['x-real-ip']"
        ]
      })
    : pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname'
          }
        }
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
