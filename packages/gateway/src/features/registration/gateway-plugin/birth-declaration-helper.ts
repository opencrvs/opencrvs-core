import { generateBirthTrackingId } from './trackingid-generator'
import { NOTIFICATION_SERVICE_URL } from 'src/constants'
import {
  GQLBirthRegistrationInput,
  GQLContactPoint,
  GQLHumanNameInput
} from 'src/graphql/schema'
import fetch from 'node-fetch'
import { logger } from 'src/logger'

export async function pushTrackingId(
  details: GQLBirthRegistrationInput
): Promise<GQLBirthRegistrationInput> {
  const birthTrackingId = await generateBirthTrackingId()
  details = { ...details, registration: { trackingId: birthTrackingId } }
  return details
}

export async function sendBirthNotification(
  details: GQLBirthRegistrationInput,
  authHeader: { Authorization: string }
) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}birthDeclarationSMS`, {
      method: 'POST',
      body: JSON.stringify({
        trackingid: details.registration && details.registration.trackingId,
        msisdn: getMsisdn(details),
        name: getInformantName(details)
      }),
      headers: {
        'Content-Type': 'application/json',
        /* currently default locale of notification service is 'en',
      Thinking to bring an env variable to notification service which will decide the default locale
      Then we will only override this if we don't want to use the default locale */
        locale: 'bn',
        ...authHeader
      }
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}
export function getMsisdn(details: GQLBirthRegistrationInput) {
  if (!details.registration || !details.registration.contact) {
    throw new Error(
      "Didn't recieved the information for informant's shared contact"
    )
  }
  if (['MOTHER', 'FATHER'].indexOf(details.registration.contact) > -1) {
    const contact = details[details.registration.contact.toLowerCase()]
    if (!contact || !contact.telecom) {
      throw new Error(
        "Didn't find any contact point for informant's shared contact"
      )
    }
    const phoneNumber = contact.telecom.find(
      (contactPoint: GQLContactPoint) => {
        return contactPoint.system === 'phone'
      }
    )
    if (!phoneNumber) {
      throw new Error(
        "Didn't find any phone number for informant's shared contact"
      )
    }
    return phoneNumber.value
  } else {
    throw new Error(
      "Invalid information recieved for informant's shared contact"
    )
  }
}

export function getInformantName(details: GQLBirthRegistrationInput) {
  if (!details.child || !details.child.name) {
    throw new Error("Didn't recieved informant's name information")
  }
  const traditioanlName = details.child.name.find(
    (humanName: GQLHumanNameInput) => {
      return humanName.use === 'Traditional'
    }
  )
  if (!traditioanlName || !traditioanlName.familyName) {
    throw new Error("Didn't found informant's traditional name")
  }
  return ''
    .concat(traditioanlName.firstNames ? traditioanlName.firstNames : '')
    .concat(' ')
    .concat(traditioanlName.familyName)
}
