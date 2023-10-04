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
import fetch from 'node-fetch'
import { del, get, set } from '@auth/database'
import {
  CONFIG_SMS_CODE_EXPIRY_SECONDS,
  JWT_ISSUER,
  NOTIFICATION_SERVICE_URL
} from '@auth/constants'
import * as crypto from 'crypto'
import { resolve } from 'url'
import { IUserName, createToken } from '@auth/features/authenticate/service'

interface ICodeDetails {
  code: string
  createdAt: number
}

export enum NotificationEvent {
  TWO_FACTOR_AUTHENTICATION = 'TWO_FACTOR_AUTHENTICATION',
  PASSWORD_RESET = 'PASSWORD_RESET'
}

type SixDigitVerificationCode = string

export async function storeVerificationCode(nonce: string, code: string) {
  const codeDetails = {
    code,
    createdAt: Date.now()
  }

  await set(`verification_${nonce}`, JSON.stringify(codeDetails))
}

export async function generateVerificationCode(
  nonce: string
): Promise<SixDigitVerificationCode> {
  const code = crypto.randomInt(100000, 999999).toString()
  await storeVerificationCode(nonce, code)
  return code
}

export async function getVerificationCodeDetails(
  nonce: string
): Promise<ICodeDetails> {
  const codeDetails = await get(`verification_${nonce}`)
  return JSON.parse(codeDetails) as ICodeDetails
}

export function generateNonce() {
  return crypto.randomBytes(16).toString('base64').toString()
}

export async function sendVerificationCode(
  verificationCode: string,
  notificationEvent: NotificationEvent,
  userFullName: IUserName[],
  mobile?: string,
  email?: string
): Promise<void> {
  const params = {
    msisdn: mobile,
    email,
    code: verificationCode,
    notificationEvent,
    userFullName
  }
  await fetch(resolve(NOTIFICATION_SERVICE_URL, 'authenticationCode'), {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await createToken(
        'auth',
        ['service'],
        ['opencrvs:notification-user', 'opencrvs:countryconfig-user'],
        JWT_ISSUER,
        true
      )}`
    }
  })

  return undefined
}

export async function checkVerificationCode(
  nonce: string,
  code: string
): Promise<void> {
  const codeDetails: ICodeDetails = await getVerificationCodeDetails(nonce)

  if (!codeDetails) {
    throw new Error('Auth code not found')
  }

  const codeExpired =
    (Date.now() - codeDetails.createdAt) / 1000 >=
    CONFIG_SMS_CODE_EXPIRY_SECONDS

  if (code !== codeDetails.code) {
    throw new Error('Auth code invalid')
  }

  if (codeExpired) {
    throw new Error('Auth code expired')
  }
}

export async function deleteUsedVerificationCode(
  nonce: string
): Promise<boolean> {
  const count = await del(`verification_${nonce}`)
  return Boolean(count)
}
