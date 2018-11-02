import * as Hapi from 'hapi'
import { internal } from 'boom'
import { sendSMS } from './service'

export interface ISMSPayload {
  msisdn: string
}

interface IAuthPayload extends ISMSPayload {
  message: string
}

export async function smsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IAuthPayload
  try {
    await sendSMS(payload.msisdn, payload.message)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

interface IDeclarationPayload extends ISMSPayload {
  trackingid: string
  recipientName: string
}

export async function sendBirthDeclarationConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  // TODO: need to change it
  const message = `Birth registration tracking ID for ${
    payload.recipientName
  } is ${
    payload.trackingid
  }. You will get an SMS within 2 days with progress and next steps.`
  try {
    await sendSMS(payload.msisdn, message)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
