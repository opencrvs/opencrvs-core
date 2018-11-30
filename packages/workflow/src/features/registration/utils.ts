import * as ShortUIDGen from 'short-uid'
import { NOTIFICATION_SERVICE_URL, USER_MGNT_SERVICE_URL } from 'src/constants'
import fetch from 'node-fetch'
import { logger } from 'src/logger'
import {
  getSharedContactMsisdn,
  getInformantName,
  getTrackingId
} from './fhir/fhir-utils'
import { callingCountries } from 'country-data'

export function generateBirthTrackingId(): string {
  return generateTrackingId('B')
}

export function generateDeathTrackingId(): string {
  return generateTrackingId('D')
}

function generateTrackingId(prefix: string): string {
  return prefix.concat(new ShortUIDGen().randomUUID())
}

export async function sendBirthNotification(
  fhirBundle: fhir.Bundle,
  authHeader: { Authorization: string }
) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}birthDeclarationSMS`, {
      method: 'POST',
      body: JSON.stringify({
        trackingid: getTrackingId(fhirBundle),
        msisdn: getSharedContactMsisdn(fhirBundle),
        name: getInformantName(fhirBundle)
      }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}

export const convertToLocal = (
  mobileWithCountryCode: string,
  countryCode: string
) => {
  countryCode = countryCode.toUpperCase()
  return mobileWithCountryCode.replace(
    callingCountries[countryCode].countryCallingCodes[0],
    '0'
  )
}

export async function getUserMobile(
  userId: string,
  authHeader: { Authorization: string }
) {
  try {
    const res = await fetch(`${USER_MGNT_SERVICE_URL}getUserMobile`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
    const body = await res.json()

    return body
  } catch (err) {
    logger.error(`Unable to retrieve mobile for error : ${err}`)
  }
}
