import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { AUTH_URL } from '@gateway/constants'
import { unauthorized } from '@hapi/boom'

interface IRefreshPayload {
  nonce: string
  token: string
}

interface IRefreshResponse {
  token: string
}

export default async function verifyRefreshTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IRefreshResponse> {
  const payload = request.payload as IRefreshPayload

  const authUrl = new URL('/refreshToken', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: request.headers.authorization
    },
    body: JSON.stringify(payload)
  })

  if (res.status === 401) throw unauthorized()

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling refreshToken endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.json()
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  token: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
