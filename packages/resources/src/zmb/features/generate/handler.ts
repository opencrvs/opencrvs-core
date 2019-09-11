import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { generateRegistrationNumber } from '@resources/zmb/features/generate/service'
import { GENERATE_TYPE_RN } from '@resources/zmb/features/utils'

export interface IGeneratorHandlerPayload {
  trackingId: string
}

export async function generatorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IGeneratorHandlerPayload
  switch (request.params.type) {
    case GENERATE_TYPE_RN:
      return {
        registrationNumber: await generateRegistrationNumber(payload.trackingId)
      }
    default:
      throw new Error('No defined type matched')
  }
}

export const requestSchema = Joi.object({
  trackingId: Joi.string()
})

export const responseSchema = Joi.object({
  registrationNumber: Joi.string()
})
