import fetch from 'node-fetch'
import {
  USER_MANAGEMENT_URL,
  CERT_PRIVATE_KEY_PATH,
  CERT_PUBLIC_KEY_PATH,
  CONFIG_TOKEN_EXPIRY
} from 'src/constants'
import { resolve } from 'url'
import { readFileSync } from 'fs'
import { promisify } from 'util'
import * as jwt from 'jsonwebtoken'
import { get, set } from 'src/database'

const cert = readFileSync(CERT_PRIVATE_KEY_PATH)
const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

const sign = promisify(jwt.sign) as (
  payload: string | Buffer | object,
  secretOrPrivateKey: jwt.Secret,
  options?: jwt.SignOptions
) => Promise<string>

export interface IAuthentication {
  nonce: string
  mobile: string
  userId: string
  role: string
}

export class UserInfoNotFoundError extends Error {}

export function isUserInfoNotFoundError(err: Error) {
  return err instanceof UserInfoNotFoundError
}

export async function authenticate(
  mobile: string,
  password: string
): Promise<IAuthentication> {
  const url = resolve(USER_MANAGEMENT_URL, '/verifyPassword')

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ mobile, password })
    })
    switch (res.status) {
      case 200:
        const body = await res.json()
        return {
          nonce: body.nonce,
          userId: body.id,
          role: body.role,
          mobile
        }
      default:
        throw Error(res.statusText)
    }
  } catch (err) {
    throw Error(err.statusText)
  }
}

export async function createToken(
  userId: string,
  role: string
): Promise<string> {
  return sign({ role }, cert, {
    subject: userId,
    algorithm: 'RS256',
    expiresIn: CONFIG_TOKEN_EXPIRY
  })
}

export async function storeUserInformation(
  nonce: string,
  userId: string,
  role: string
) {
  return set(`user_information_${nonce}`, JSON.stringify({ userId, role }))
}

export async function getStoredUserInformation(nonce: string) {
  const record = await get(`user_information_${nonce}`)
  if (record === null) {
    throw new UserInfoNotFoundError('user not found')
  }
  return JSON.parse(record)
}

export async function verifyToken(token: string): Promise<any> {
  return jwt.verify(token, publicCert)
}
