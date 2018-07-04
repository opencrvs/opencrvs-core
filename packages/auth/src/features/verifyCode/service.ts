import fetch from 'node-fetch'

import { set, get } from 'src/database'

import { NOTIFICATION_SERVICE_URL, CONFIG_TOKEN_EXPIRY } from 'src/constants'

import * as crypto from 'crypto'
import { resolve } from 'url'

interface ICodeDetails {
  code: string
  used: string
  createdAt: number
}

export async function generateVerificationCode(nonce: string, mobile: string) {
  // TODO lets come back to how these are generated
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const codeEntry = `${code}_used_${false}_created_${Date.now()}`
  await set(`verification_${nonce}`, codeEntry)
  return code
}

export async function getVerificationCode(nonce: string): Promise<string> {
  const verificationCode = await get(`verification_${nonce}`)
  return verificationCode
}

export async function getVerificationCodeDetails(
  nonce: string
): Promise<ICodeDetails> {
  const codeEntry = await get(`verification_${nonce}`)
  const firstSplit = codeEntry.split('_used_')
  const secondSplit = firstSplit[1].split('_created_')

  return {
    code: firstSplit[0],
    used: secondSplit[0],
    createdAt: secondSplit[1]
  } as ICodeDetails
}

export async function updateVerificationCode(
  codeDetails: ICodeDetails,
  nonce: string
): Promise<boolean> {
  const codeEntry = `${codeDetails.code}_used_${codeDetails.used}_created_${
    codeDetails.createdAt
  }`
  if (await set(`verification_${nonce}`, codeEntry)) {
    return true
  }
  return false
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
): Promise<boolean> {
  const codeDetails: ICodeDetails = await getVerificationCodeDetails(nonce)
  if (codeDetails.used === 'true') {
    return false
  }
  if (
    (Date.now() - codeDetails.createdAt) / 1000 >=
    Number(CONFIG_TOKEN_EXPIRY)
  ) {
    return false
  }
  return code === codeDetails.code
}

export async function setVerificationCodeAsUsed(
  nonce: string
): Promise<boolean> {
  const codeDetails: ICodeDetails = await getVerificationCodeDetails(nonce)
  codeDetails.used = 'true'
  const updated = await updateVerificationCode(codeDetails, nonce)
  return updated
}
