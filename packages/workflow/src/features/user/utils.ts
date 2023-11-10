/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { USER_MANAGEMENT_URL } from '@workflow/constants'
import fetch from 'node-fetch'
import { getTokenPayload } from '@workflow/utils/authUtils'
import { getFromFhir } from '@workflow/features/registration/fhir/fhir-utils'
import { Practitioner } from '@opencrvs/commons/types'
import { UUID } from '@opencrvs/commons'

export async function getUser(
  userId: string,
  authHeader: { Authorization: string }
) {
  const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (!res.ok) {
    throw new Error(
      `Unable to retrieve user in workflow. Error: ${res.status} status received`
    )
  }

  const body = await res.json()

  return body
}

export async function getSystem(
  systemId: string,
  authHeader: { Authorization: string }
) {
  const res = await fetch(`${USER_MANAGEMENT_URL}getSystem`, {
    method: 'POST',
    body: JSON.stringify({ systemId }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (!res.ok) {
    throw new Error(
      `Unable to retrieve system in workflow. Error: ${res.status} status received`
    )
  }

  const body = await res.json()

  return body
}

// @todo remove this as it's not used anywhere (other than tests)
export async function getLoggedInPractitionerPrimaryLocation(
  token: string
): Promise<fhir3.Location> {
  return getPrimaryLocationFromLocationList(
    await getLoggedInPractitionerLocations(token)
  )
}

export async function getPractitionerPrimaryLocation(
  practitionerId: string
): Promise<fhir3.Location> {
  return getPrimaryLocationFromLocationList(
    await getPractitionerLocations(practitionerId)
  )
}

export async function getPractitionerOffice(
  practitionerId: string
): Promise<fhir3.Location> {
  return getOfficeLocationFromLocationList(
    await getPractitionerLocations(practitionerId)
  )
}

export function getPrimaryLocationFromLocationList(
  locations: [fhir3.Location]
): fhir3.Location {
  const primaryOffice = getOfficeLocationFromLocationList(locations)
  const primaryLocationId =
    primaryOffice &&
    primaryOffice.partOf &&
    primaryOffice.partOf.reference &&
    primaryOffice.partOf.reference.split('/')[1]

  if (!primaryLocationId) {
    throw new Error('No primary location found')
  }

  const location = locations.find((loc) => loc.id === primaryLocationId)
  if (!location) {
    throw new Error(
      `No primary location not found for office: ${primaryLocationId}`
    )
  }
  return location
}

function getOfficeLocationFromLocationList(
  locations: fhir3.Location[]
): fhir3.Location {
  let office: fhir3.Location | undefined
  locations.forEach((location: fhir3.Location) => {
    if (location.type && location.type.coding) {
      location.type.coding.forEach((code) => {
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
): Promise<[fhir3.Location]> {
  const practitionerResource = await getLoggedInPractitionerResource(token)

  if (!practitionerResource || !practitionerResource.id) {
    throw new Error('Invalid practioner found')
  }
  /* getting location list for practitioner */
  return await getPractitionerLocations(practitionerResource.id)
}

export async function getLoggedInPractitionerResource(
  token: string
): Promise<Practitioner> {
  const tokenPayload = getTokenPayload(token)
  const isNotificationAPIUser =
    tokenPayload.scope.indexOf('notification-api') > -1
  const isRecordSearchAPIUser = tokenPayload.scope.indexOf('recordsearch') > -1

  let userResponse
  if (isNotificationAPIUser || isRecordSearchAPIUser) {
    userResponse = await getSystem(tokenPayload.sub, {
      Authorization: `Bearer ${token}`
    })
  } else {
    userResponse = await getUser(tokenPayload.sub, {
      Authorization: `Bearer ${token}`
    })
  }

  return await getFromFhir(`/Practitioner/${userResponse.practitionerId}`)
}

export async function getPractitionerLocations(
  practitionerId: string
): Promise<[fhir3.Location]> {
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
    const locationResponse: fhir3.Location = await getFromFhir(
      `/Location/${splitRef[1]}`
    )
    if (!locationResponse) {
      throw new Error(`Location not found for ${location}`)
    }
    locList.push(locationResponse)
  }
  return locList as [fhir3.Location]
}

export function getPractitionerRef(practitioner: Practitioner) {
  if (!practitioner || !practitioner.id) {
    throw new Error('Invalid practitioner data found')
  }
  return `Practitioner/${
    practitioner.id as UUID /* @todo move to practitioner */
  }` as const
}
