import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { AUTH_URL } from '@gateway/constants'
import { unauthorized } from '@hapi/boom'

interface IPayload {
  answer: string
  nonce: string
}

interface IResponse {
  matched: boolean
  nonce: string
  securityQuestionKey?: string
}

export default async function verifySecurityQuestionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IResponse> {
  const payload = request.payload as IPayload

  const authUrl = new URL('/verifySecurityAnswer', AUTH_URL)
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

export const verifySecurityQuestionSchema = Joi.object({
  answer: Joi.string().required(),
  nonce: Joi.string().required()
})

export const verifySecurityQuestionResSchema = Joi.object({
  matched: Joi.bool().required(),
  securityQuestionKey: Joi.string().optional(),
  nonce: Joi.string().required()
})
