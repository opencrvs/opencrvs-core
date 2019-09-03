import { USER_MANAGEMENT_URL, COUNTRY } from '@workflow/constants'
import fetch from 'node-fetch'
import { callingCountries } from 'country-data'
import { logger } from '@workflow/logger'
import { getTokenPayload } from '@workflow/utils/authUtils.ts'
import { getFromFhir } from '@workflow/features/registration/fhir/fhir-utils'
const JURISDICTION_TYPE_DISTRICT = 'district'
const JURISDICTION_TYPE_UPAZILA = 'upazila'
const JURISDICTION_TYPE_UNION = 'union'

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

export const convertToLocal = (
  mobileWithCountryCode: string,
  countryCode: string
) => {
  // tslint:disable-next-line
  countryCode = countryCode.toUpperCase()
  return mobileWithCountryCode.replace(
    callingCountries[countryCode].countryCallingCodes[0],
    '0'
  )
}

// @todo remove this as it's not used anywhere (other than tests)
export async function getLoggedInPractitionerPrimaryLocation(
  token: string
): Promise<fhir.Location> {
  return getPrimaryLocationFromLocationList(
    await getLoggedInPractitionerLocations(token)
  )
}

export async function getPractitionerPrimaryLocation(
  practitionerId: string
): Promise<fhir.Location> {
  return getPrimaryLocationFromLocationList(
    await getPractitionerLocations(practitionerId)
  )
}

export async function getPractitionerOfficeLocation(
  practitionerId: string
): Promise<fhir.Location> {
  return getOfficeLocationFromLocationList(
    await getPractitionerLocations(practitionerId)
  )
}

export function getPrimaryLocationFromLocationList(
  locations: [fhir.Location]
): fhir.Location {
  const primaryOffice =
    locations &&
    locations.find(location => {
      if (
        location.physicalType &&
        location.physicalType.coding &&
        location.physicalType.coding[0].display
      ) {
        return (
          location.physicalType.coding[0].display.toLowerCase() === 'building'
        )
      }
      return false
    })
  if (!primaryOffice) {
    throw new Error('No primary office found')
  }
  return primaryOffice
}

function getOfficeLocationFromLocationList(
  locations: fhir.Location[]
): fhir.Location {
  let office: fhir.Location | undefined
  locations.forEach((location: fhir.Location) => {
    if (location.type && location.type.coding) {
      location.type.coding.forEach(code => {
        if (code.code === 'CRVS_OFFICE') {
          office = location
        }
      })
    }
  })
  if (!office) {
    throw new Error('No CRVS office found')
  }
  return office
}

export async function getLoggedInPractitionerLocations(
  token: string
): Promise<[fhir.Location]> {
  const practitionerResource = await getLoggedInPractitionerResource(token)

  if (!practitionerResource || !practitionerResource.id) {
    throw new Error('Invalid practioner found')
  }
  /* getting location list for practitioner */
  return await getPractitionerLocations(practitionerResource.id)
}

export async function getLoggedInPractitionerResource(
  token: string
): Promise<fhir.Practitioner> {
  const tokenPayload = getTokenPayload(token)
  const userMobileResponse = await getUserMobile(tokenPayload.sub, {
    Authorization: `Bearer ${token}`
  })
  const localMobile = convertToLocal(userMobileResponse.mobile, COUNTRY)
  const practitionerBundle = await getFromFhir(
    `/Practitioner?telecom=phone|${localMobile}`
  )
  if (
    !practitionerBundle ||
    !practitionerBundle.entry ||
    !practitionerBundle.entry[0] ||
    !practitionerBundle.entry[0].resource
  ) {
    throw new Error('Practitioner resource not found')
  }
  return practitionerBundle.entry[0].resource
}

export async function getPractitionerLocations(
  practitionerId: string
): Promise<[fhir.Location]> {
  const roleResponse = await getFromFhir(
    `/PractitionerRole?practitioner=${practitionerId}`
  )
  const roleEntry = roleResponse.entry[0].resource
  if (!roleEntry || !roleEntry.location) {
    throw new Error('PractitionerRole has no locations associated')
  }
  const locList = []
  for (const location of roleEntry.location) {
    const splitRef = location.reference.split('/')
    const locationResponse: fhir.Location = await getFromFhir(
      `/Location/${splitRef[1]}`
    )
    if (!locationResponse) {
      throw new Error(`Location not found for ${location}`)
    }
    locList.push(locationResponse)
  }
  return locList as [fhir.Location]
}

export function getJurisDictionalLocations() {
  return [
    {
      jurisdictionType: JURISDICTION_TYPE_DISTRICT,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UPAZILA,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UNION,
      bbsCode: ''
    }
  ]
}

export function getPractitionerRef(practitioner: fhir.Practitioner): string {
  if (!practitioner || !practitioner.id) {
    throw new Error('Invalid practitioner data found')
  }
  return `Practitioner/${practitioner.id}`
}
