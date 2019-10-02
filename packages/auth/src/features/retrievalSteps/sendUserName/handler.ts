import * as Hapi from 'hapi'
import * as Joi from 'joi'

import { unauthorized } from 'boom'

import { sendUserName } from '@auth/features/retrievalSteps/sendUserName/service'
import {
  getRetrievalStepInformation,
  RetrievalSteps,
  deleteRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'
import { logger } from '@auth/logger'
import { PRODUCTION } from '@auth/constants'

interface IPayload {
  nonce: string
}

export default async function sendUserNameHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IPayload
  const retrivalStepInformation = await getRetrievalStepInformation(
    payload.nonce
  ).catch(() => {
    throw unauthorized()
  })

  if (retrivalStepInformation.status !== RetrievalSteps.SECURITY_Q_VERIFIED) {
    return h.response().code(401)
  }

  const isDemoUser = retrivalStepInformation.scope.indexOf('demo') > -1
  if (!PRODUCTION || isDemoUser) {
    logger.info('Sending a verification SMS', {
      mobile: retrivalStepInformation.mobile,
      username: retrivalStepInformation.username
    })
  } else {
    await sendUserName(
      retrivalStepInformation.mobile,
      retrivalStepInformation.username
    )
  }
  await deleteRetrievalStepInformation(payload.nonce)
  return h.response().code(200)
}

export const requestSchema = Joi.object({
  nonce: Joi.string().required()
})
