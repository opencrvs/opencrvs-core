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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import {
  CERT_PUBLIC_KEY_PATH,
  CONFIG_SMS_CODE_EXPIRY_SECONDS,
  NOTIFICATION_URL,
  PRODUCTION,
  QA_ENV
} from '@gateway/constants'
import { set, get, del } from '@gateway/features/user/database'
import * as crypto from 'crypto'
import { resolve } from 'url'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import fetch from 'node-fetch'
import { unauthorized } from '@hapi/boom'
import { logger } from '@gateway/logger'
const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)
import * as t from 'io-ts'

interface ICodeDetails {
  code: string
  createdAt: number
}

type SixDigitVerificationCode = string

interface ISendVerifyCodeResponse {
  userId: string
  nonce: string
  mobile: string
  status: string
}

interface ISendVerifyCodePayload {
  phoneNumber: string
}

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

export async function getVerificationCodeDetails(
  nonce: string
): Promise<ICodeDetails> {
  const codeDetails = await get(`verification_${nonce}`)
  return JSON.parse(codeDetails) as ICodeDetails
}

export async function deleteUsedVerificationCode(
  nonce: string
): Promise<boolean> {
  const count = await del(`verification_${nonce}`)
  return Boolean(count)
}

export function generateNonce() {
  return crypto.randomBytes(16).toString('base64').toString()
}

export async function sendVerificationCode(
  mobile: string,
  verificationCode: string,
  token: string
): Promise<void> {
  const params = {
    msisdn: mobile,
    code: verificationCode
  }

  await fetch(resolve(NOTIFICATION_URL, 'authenticationCode'), {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return undefined
}

export async function generateAndSendVerificationCode(
  nonce: string,
  mobile: string,
  scope: string[],
  token: string
) {
  const isDemoUser = scope.indexOf('demo') > -1
  logger.info('isDemoUser', {
    isDemoUser: isDemoUser
  })
  let verificationCode
  if (isDemoUser) {
    verificationCode = '000000'
    await storeVerificationCode(nonce, verificationCode)
  } else {
    verificationCode = await generateVerificationCode(nonce, mobile)
  }
  if (!PRODUCTION || QA_ENV) {
    logger.info('Sending a verification SMS', {
      mobile: mobile,
      verificationCode
    })
  } else {
    if (isDemoUser) {
      throw unauthorized()
    } else {
      await sendVerificationCode(mobile, verificationCode, token)
    }
  }
}

export default async function sendVerifyCodeHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as ISendVerifyCodePayload
  const { phoneNumber } = payload
  const token = request.headers.authorization.replace('Bearer ', '') as string
  const tokenDecoded = verifyToken(token)
  const { sub: userId, scope } = tokenDecoded
  const nonce = generateNonce()
  const response: ISendVerifyCodeResponse = {
    userId,
    nonce,
    mobile: phoneNumber,
    status: 'Success'
  }
  await generateAndSendVerificationCode(nonce, phoneNumber, scope, token)
  return h.response(response).code(201)
}

export const requestSchema = Joi.object({
  phoneNumber: Joi.string()
})

export const responseSchema = Joi.object({
  userId: Joi.string(),
  nonce: Joi.string(),
  mobile: Joi.string(),
  status: Joi.string()
})

const tokenPayload = t.type({
  sub: t.string,
  scope: t.array(t.string),
  iat: t.number,
  exp: t.number,
  aud: t.array(t.string)
})

export type ITokenPayload = t.TypeOf<typeof tokenPayload>

export function verifyToken(token: string): ITokenPayload {
  const decoded = jwt.verify(token, publicCert, {
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  })
  const result = tokenPayload.decode(decoded)
  return result.value as ITokenPayload
}
