import { generateBirthTrackingId } from './trackingid-generator'
import { NOTIFICATION_SERVICE_URL } from 'src/constants'
import { GQLBirthRegistrationInput } from 'src/graphql/schema'
import fetch from 'node-fetch'

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
  await fetch(`${NOTIFICATION_SERVICE_URL}birthDeclarationSMS`, {
    method: 'POST',
    body: JSON.stringify({
      trackingid: details.registration && details.registration.trackingId,
      msisdn: '+8801622688231',
      name: 'অনিক'
    }),
    headers: {
      'Content-Type': 'application/json',
      /* currently default locale of notification service is 'en',
      Thinking to bring an env variable to notification service which will decide the default locale
      Then we will only override this if we don't want use the default local */
      locale: 'bn',
      ...authHeader
    }
  })
}
/*
function getMsisdn(details: GQLBirthRegistrationInput) {
    if (!details.registration.) {

    }
}*/
