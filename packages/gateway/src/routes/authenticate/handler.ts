import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { AUTH_URL } from '@gateway/constants'
import { logger } from '@opencrvs/commons'
import { forbidden, unauthorized } from '@hapi/boom'
import fetch from 'node-fetch'

interface IAuthPayload {
  username: string
  password: string
}

interface IAuthResponse {
  nonce: string
  mobile?: string
  email?: string
  status: string
  token?: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const payload = request.payload as IAuthPayload

  const authUrl = new URL('/authenticate', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (res.status === 401) throw unauthorized()
  if (res.status === 403) throw forbidden()

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling authenticate endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.json()
}

export const requestSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string().optional(),
  email: Joi.string().optional(),
  status: Joi.string(),
  token: Joi.string().optional()
})
