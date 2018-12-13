import { USER_MGNT_SERVICE_URL } from 'src/constants'
import fetch from 'node-fetch'
import { logger } from 'src/logger'
import { callingCountries } from 'country-data'
import { IAuthHeader } from 'src/common-types'

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

export async function getUserMobile(userId: string, authHeader: IAuthHeader) {
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
