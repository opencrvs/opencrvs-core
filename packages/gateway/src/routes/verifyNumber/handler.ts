import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { AUTH_URL } from '@gateway/constants'
import { unauthorized } from '@hapi/boom'
import fetch from 'node-fetch'

interface IVerifyNumberPayload {
  nonce: string
  code: string
}

interface IVerifyNumberResponse {
  nonce: string
  securityQuestionKey: string
}

export default async function verifyNumberHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyNumberResponse> {
  const payload = request.payload as IVerifyNumberPayload

  const authUrl = new URL('/verifyNumber', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (res.status === 401) throw unauthorized()

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling verifyNumber endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.json()
}

export const requestSchema = Joi.object({
  nonce: Joi.string().required(),
  code: Joi.string().required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  securityQuestionKey: Joi.string()
})
