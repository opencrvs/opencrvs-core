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

import * as crypto from 'crypto'
import {
  TriggerEvent,
  triggerUserEventNotification,
  NameFieldValue,
  logger
} from '@opencrvs/commons'
import { env } from '@events/environment'

const CODE_EXPIRY_SECONDS = 300

interface CodeDetails {
  code: string
  createdAt: number
}

const verificationCodes = new Map<string, CodeDetails>()

export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

function storeVerificationCode(nonce: string, code: string): void {
  verificationCodes.set(`verification_${nonce}`, {
    code,
    createdAt: Date.now()
  })
}

function generateAndStoreVerificationCode(nonce: string): string {
  const code = crypto.randomInt(100000, 999999).toString()
  storeVerificationCode(nonce, code)
  return code
}

export function checkVerificationCode(nonce: string, code: string): void {
  const key = `verification_${nonce}`
  const codeDetails = verificationCodes.get(key)

  if (!codeDetails) {
    throw new Error('sms code not found')
  }

  const codeExpired =
    (Date.now() - codeDetails.createdAt) / 1000 >= CODE_EXPIRY_SECONDS

  if (code !== codeDetails.code) {
    throw new Error('sms code invalid')
  }

  if (codeExpired) {
    throw new Error('sms code expired')
  }

  verificationCodes.delete(key)
}

type VerifyUserChangeTrigger =
  | typeof TriggerEvent.CHANGE_PHONE_NUMBER
  | typeof TriggerEvent.CHANGE_EMAIL_ADDRESS

export async function generateAndSendVerificationCode({
  nonce,
  token,
  notificationEvent,
  recipientName,
  phoneNumber,
  email
}: {
  nonce: string
  token: string
  notificationEvent: VerifyUserChangeTrigger
  recipientName: NameFieldValue
  phoneNumber?: string
  email?: string
}): Promise<void> {
  const isTwoFADisabled = !env.TWO_FA_ENABLED

  let verificationCode: string
  if (isTwoFADisabled) {
    verificationCode = '000000'
    storeVerificationCode(nonce, verificationCode)
  } else {
    verificationCode = generateAndStoreVerificationCode(nonce)
  }

  if (!env.isProduction) {
    logger.info(
      `Sending a verification to ${JSON.stringify({
        mobile: phoneNumber,
        email: email,
        verificationCode
      })}`
    )
  } else {
    if (isTwoFADisabled) {
      throw new Error('2FA cannot be disabled in production')
    }

    await triggerUserEventNotification({
      event: notificationEvent,
      payload: {
        recipient: {
          mobile: phoneNumber,
          email,
          name: recipientName
        },
        code: verificationCode
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL,
      authHeader: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}
