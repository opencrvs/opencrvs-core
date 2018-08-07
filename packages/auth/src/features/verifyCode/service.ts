import fetch from 'node-fetch'
import { set, get, del } from 'src/database'
import {
  NOTIFICATION_SERVICE_URL,
  CONFIG_SMS_CODE_EXPIRY_SECONDS
} from 'src/constants'
import * as crypto from 'crypto'
import { resolve } from 'url'

interface ICodeDetails {
  code: string
  createdAt: number
}

export async function generateVerificationCode(nonce: string, mobile: string) {
  // TODO lets come back to how these are generated
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  const codeDetails = {
    code,
    createdAt: Date.now()
  }

  await set(`verification_${nonce}`, JSON.stringify(codeDetails))
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
    body: JSON.stringify(params)
  })

  return undefined
}

export async function checkVerificationCode(
  nonce: string,
  code: string
): Promise<void> {
  const codeDetails: ICodeDetails = await getVerificationCodeDetails(nonce)

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
  try {
    await del(`verification_${nonce}`)
    return true
  } catch (err) {
    throw Error(err.message)
  }
}
