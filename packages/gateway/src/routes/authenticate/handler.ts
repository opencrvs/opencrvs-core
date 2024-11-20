import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import * as client from '@gateway/utils/redis'
import { AUTH_URL } from '@gateway/constants'
import { RateLimitError } from '@gateway/rate-limit'
import { logger } from '@opencrvs/commons'
import { forbidden, unauthorized } from '@hapi/boom'
import { get } from 'lodash'

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

/** Time to live in milliseconds for every Redis entry */
const TTL_IN_MS = 60 * 1000

/** Maximum number of requests per minute */
const requestsPerMinute = 10

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const payload = request.payload as IAuthPayload

  // Rate Limitation
  const pathOptionsForKey = ['username']
  const route = request.path

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
