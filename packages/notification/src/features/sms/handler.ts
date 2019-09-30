import * as Hapi from 'hapi'
import { internal } from 'boom'
import { sendSMS } from '@notification/features/sms/service'
import { NON_UNICODED_LANGUAGES } from '@notification/constants'
import { logger } from '@notification/logger'

export type HapiRequest = Hapi.Request & {
  i18n: {
    __: (messageKey: string, values?: object) => string
    getLocale: () => string
  }
}
interface ISMSPayload {
  msisdn: string
}

interface IAuthPayload extends ISMSPayload {
  message: string
}

export async function smsHandler(
  request: HapiRequest,
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
  name: string
}

interface IRegistrationPayload extends ISMSPayload {
  name: string
}

interface ICredentialsPayload extends ISMSPayload {
  username: string
  password: string
}

interface IRetrieveUserNamePayload extends ISMSPayload {
  username: string
}

export async function sendBirthDeclarationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  logger.info(
    `Notification service sendBirthDeclarationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  try {
    await sendSMS(
      payload.msisdn,
      request.i18n.__('birthDeclarationNotification', {
        name: payload.name,
        trackingid: payload.trackingid
      }),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function sendBirthRegistrationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRegistrationPayload
  logger.info(
    `Notification service sendBirthRegistrationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  try {
    await sendSMS(
      payload.msisdn,
      request.i18n.__('birthRegistrationNotification', {
        name: payload.name
      }),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function sendDeathDeclarationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  logger.info(
    `Notification service sendDeathDeclarationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  try {
    await sendSMS(
      payload.msisdn,
      request.i18n.__('deathDeclarationNotification', {
        name: payload.name,
        trackingid: payload.trackingid
      }),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function sendDeathRegistrationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRegistrationPayload
  logger.info(
    `Notification service sendDeathRegistrationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  try {
    await sendSMS(
      payload.msisdn,
      request.i18n.__('deathRegistrationNotification', {
        name: payload.name
      }),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function sendUserCredentials(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as ICredentialsPayload
  // TODO: need to remove this once dev env check code is here
  logger.info(`Username: ${payload.username}`)
  logger.info(`Password: ${payload.password}`)
  try {
    await sendSMS(
      payload.msisdn,
      request.i18n.__('userCredentialsNotification', {
        username: payload.username,
        password: payload.password
      }),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function retrieveUserName(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRetrieveUserNamePayload
  logger.info(`Username: ${payload.username}`)
  try {
    await sendSMS(
      payload.msisdn,
      request.i18n.__('retieveUserNameNotification', {
        username: payload.username
      }),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
