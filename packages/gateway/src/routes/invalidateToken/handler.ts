import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { AUTH_URL } from '@gateway/constants'

interface IInvalidateTokenPayload {
  token: string
}

export default async function invalidateTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IInvalidateTokenPayload

  const authUrl = new URL('/invalidateToken', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling invalidateToken endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return {}
}

export const reqInvalidateTokenSchema = Joi.object({
  token: Joi.string()
})
