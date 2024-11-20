import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { AUTH_URL } from '@gateway/constants'
import { unauthorized } from '@hapi/boom'
import { get } from 'lodash'
import * as client from '@gateway/utils/redis'
import { RateLimitError } from '@gateway/rate-limit'

interface IVerifyUserPayload {
  mobile?: string
  email?: string
  retrieveFlow: string
}

interface IVerifyUserResponse {
  nonce: string
  securityQuestionKey?: string
}

const RETRIEVAL_FLOW_USER_NAME = 'username'
const RETRIEVAL_FLOW_PASSWORD = 'password'

/** Time to live in milliseconds for every Redis entry */
const TTL_IN_MS = 60 * 1000

const requestsPerMinute = 10

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyUserResponse> {
  const payload = request.payload as IVerifyUserPayload

  // Rate limitation
  const route = request.path

  const pathOptionsForKey = ['mobile', 'email']
  const key = pathOptionsForKey!.find(
    (path) => get(payload, path) !== undefined
  )
  const value = get(payload, key!)

  if (!value) {
    throw new Error(
      "Couldn't find the value for a rate limiting key in payload"
    )
  }
  const [requests] = await client.incrementWithTTL(
    `${value}:${route}`,
    TTL_IN_MS
  )
  if (requests > requestsPerMinute) {
    throw new RateLimitError(
      'Too many requests within a minute. Please throttle your requests.'
    )
  }

  // Currently throws an error due to securityQuestionAnswers array is empty in DB
  const authUrl = new URL('/verifyUser', AUTH_URL)
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
      `Error occured when calling verifyUser endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.json()
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  email: Joi.string().email(),
  retrieveFlow: Joi.string()
    .valid(RETRIEVAL_FLOW_USER_NAME, RETRIEVAL_FLOW_PASSWORD)
    .required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string().required(),
  securityQuestionKey: Joi.string().optional()
})
