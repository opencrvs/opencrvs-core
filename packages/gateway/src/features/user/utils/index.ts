import { USER_MANAGEMENT_URL } from 'src/constants'
import fetch from 'node-fetch'
import { logger } from 'src/logger'
import { callingCountries } from 'country-data'

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
    const res = await fetch(`${USER_MANAGEMENT_URL}getUserMobile`, {
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
