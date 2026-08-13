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
import * as nodemailer from 'nodemailer'
import { EMAIL_ENABLED, env } from './constants'
import type { FastifyBaseLogger } from 'fastify'

export const sendEmail = async (
  subject: string,
  text: string,
  logger?: FastifyBaseLogger
) => {
  if (!EMAIL_ENABLED) {
    logger?.info(
      {
        event: 'mailer.skipped'
      },
      'Skipping email send because SMTP is disabled'
    )

    return
  }
  try {
    const emailTransport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD
      }
    })
    // Without awaiting, error never reaches catch.
    return await emailTransport.sendMail({
      from: env.SENDER_EMAIL_ADDRESS,
      to: env.ALERT_EMAIL,
      subject,
      text
    })
  } catch (e) {
    logger?.info(
      {
        event: 'mailer.error'
      },
      'Could not send email. Usually this is because the SMTP environment variables are not set up correctly.'
    )
    logger?.error(e)
  }
}
