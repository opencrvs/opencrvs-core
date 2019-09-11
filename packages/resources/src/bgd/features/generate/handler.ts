import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { generateRegistrationNumber } from '@resources/bgd/features/generate/service'
import { GENERATE_TYPE_RN } from '@resources/bgd/features/utils'

export interface IGeneratorHandlerPayload {
  trackingId: string
  practitionerId: string
}

export async function generatorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IGeneratorHandlerPayload
  switch (request.params.type) {
    case GENERATE_TYPE_RN:
      return {
        registrationNumber: await generateRegistrationNumber(
          payload.trackingId,
          payload.practitionerId
        )
      }
    default:
      throw new Error('No defined type matched')
  }
}

export const requestSchema = Joi.object({
  trackingId: Joi.string(),
  practitionerId: Joi.string()
})

export const responseSchema = Joi.object({
  registrationNumber: Joi.string()
})
