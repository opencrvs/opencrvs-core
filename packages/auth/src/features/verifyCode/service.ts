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
  return crypto
    .randomBytes(16)
    .toString('base64')
    .toString()
}

export async function sendVerificationCode(
  mobile: string,
  verificationCode: string
): Promise<void> {
  const params = {
    msisdn: mobile,
    message: verificationCode
  }

  await fetch(resolve(NOTIFICATION_SERVICE_URL, 'sms'), {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      Authorization: `Bearer ${createToken(
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
