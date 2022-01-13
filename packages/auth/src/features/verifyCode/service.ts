/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import fetch from 'node-fetch'
import { set, get, del } from '@auth/database'
import {
  NOTIFICATION_SERVICE_URL,
  CONFIG_SMS_CODE_EXPIRY_SECONDS,
  JWT_ISSUER
} from '@auth/constants'
import * as crypto from 'crypto'
import { resolve } from 'url'
import { createToken } from '@auth/features/authenticate/service'

interface ICodeDetails {
  code: string
  createdAt: number
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
  nonce: string,
  mobile: string
): Promise<SixDigitVerificationCode> {
  // tslint:disable-next-line
  const code = Math.floor(100000 + Math.random() * 900000).toString()

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
  mobile: string,
  verificationCode: string
): Promise<void> {
  const params = {
    msisdn: mobile,
    code: verificationCode
  }

  await fetch(resolve(NOTIFICATION_SERVICE_URL, 'authenticationCode'), {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await createToken(
        'auth',
        ['service'],
        ['opencrvs:notification-user'],
        JWT_ISSUER
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
    throw new Error('sms code not found')
  }

  const codeExpired =
    (Date.now() - codeDetails.createdAt) / 1000 >=
    CONFIG_SMS_CODE_EXPIRY_SECONDS

  if (code !== codeDetails.code) {
    throw new Error('sms code invalid')
  }

  if (codeExpired) {
    throw new Error('sms code expired')
  }
}

export async function deleteUsedVerificationCode(
  nonce: string
): Promise<boolean> {
  const count = await del(`verification_${nonce}`)
  return Boolean(count)
}
