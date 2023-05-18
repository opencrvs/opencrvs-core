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

export enum EmailTemplateType {
  ONBOARDING_INVITE = 'onboarding-invite',
  TWO_FACTOR_AUTHENTICATION = '2-factor-authentication',
  CHANGE_PHONE_NUMBER = 'change-phone-number',
  PASSWORD_RESET_BY_SYSTEM_ADMIN = 'password-reset-by-system-admin',
  PASSWORD_RESET = 'password-reset',
  USERNAME_REMINDER = 'username-reminder',
  USERNAME_UPDATED = 'username-updated'
}

export enum SMSTemplateType {
  AUTHENTICATION_CODE_NOTIFICATION = 'authenticationCodeNotification',
  USER_CREDENTIALS_NOTIFICATION = 'userCredentialsNotification',
  RETIEVE_USERNAME_NOTIFICATION = 'retieveUserNameNotification',
  UPDATE_USERNAME_NOTIFICATION = 'updateUserNameNotification',
  RESET_USER_PASSWORD_NOTIFICATION = 'resetUserPasswordNotification'
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
  templateName: EmailTemplateType | SMSTemplateType,
  userFullName: IUserName[],
  mobile?: string,
  email?: string
): Promise<void> {
  const params = {
    msisdn: mobile,
    email,
    code: verificationCode,
    templateName,
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
