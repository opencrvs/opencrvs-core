/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import fetch from 'node-fetch'
import { FHIR_URL, ORG_URL } from '@bgd-dhis2-mediator/constants'
import { IIncomingAddress } from '@bgd-dhis2-mediator/features/fhir/service'
import {
  pilotUnions,
  pilotMunicipalities,
  Ia2ILocationRefences
} from '@bgd-dhis2-mediator/features/utils'

interface IIdentifier {
  system: string
  value: string
}

export async function fetchLocationByIdentifiers(
  identifiers: IIdentifier[],
  querySuffix: string,
  authHeader: string
): Promise<fhir.Location | undefined> {
  const identifierQueryStrings = identifiers.map(
    identifier => `identifier=${identifier.system}|${identifier.value}`
  )

  const res = await fetch(
    `${FHIR_URL}/Location?${identifierQueryStrings.join('&')}&${querySuffix}`,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/fhir+json'
      }
    }
  )

  if (!res.ok) {
    return undefined
  }

  const bundle: fhir.Bundle = await res.json()

  if (!bundle.entry || !bundle.entry[0] || !bundle.entry[0].resource) {
    return undefined
  }

  return bundle.entry[0].resource as fhir.Location
}

export async function fetchCRVSOfficeByParentLocation(
  parentLocation: fhir.Location,
  authHeader: string
): Promise<fhir.Location> {
  // TODO: need to go through the location hierarchy to find crvs office
  const res = await fetch(
    `${FHIR_URL}/Location?parentRef=Location/${parentLocation.id}&type=CRVS_OFFICE`,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/fhir+json'
      }
    }
  )

  if (!res.ok) {
    throw new Error(
      `Error status code received in response, ${res.statusText} ${res.status}`
    )
  }

  const bundle: fhir.Bundle = await res.json()

  if (!bundle.entry || !bundle.entry[0] || !bundle.entry[0].resource) {
    throw new Error(
      `Location not found, parent location: ${JSON.stringify(parentLocation)}`
    )
  }

  return bundle.entry[0].resource as fhir.Location
}

export interface IBNLocationCodes {
  divisionCode: string
  districtCode?: string
  upazilaCode?: string
  unionCode?: string
  municipalityCode?: string
  cityCorpCode?: string
  wardCode?: string
}

export interface IBNLocationResult {
  division?: fhir.Location
  district?: fhir.Location
  upazila?: fhir.Location
  union?: fhir.Location
  municipality?: fhir.Location
  cityCorp?: fhir.Location
  ward?: fhir.Location
}

export async function fetchHierarchicalBangladeshLocations(
  codes: IBNLocationCodes,
  authHeader: string
) {
  const result: IBNLocationResult = {}

  if (codes.divisionCode) {
    result.division = await fetchLocationByIdentifiers(
      [
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: codes.divisionCode
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DIVISION'
        }
      ],
      'partof=Location/0', // the root location
      authHeader
    )
  }

  if (codes.districtCode && result.division) {
    if (!result.division.partOf || !result.division.partOf.reference) {
      throw new Error('Division does not have a partOf reference')
    }

    result.district = await fetchLocationByIdentifiers(
      [
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: codes.districtCode
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DISTRICT'
        }
      ],
      `partof=Location/${result.division.id}`,
      authHeader
    )
  }

  if (codes.upazilaCode && result.district) {
    if (!result.district.partOf || !result.district.partOf.reference) {
      throw new Error('District does not have a partOf reference')
    }

    result.upazila = await fetchLocationByIdentifiers(
      [
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: codes.upazilaCode
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UPAZILA'
        }
      ],
      `partof=Location/${result.district.id}`,
      authHeader
    )
  }

  if (codes.unionCode && result.upazila) {
    if (!result.upazila.partOf || !result.upazila.partOf.reference) {
      throw new Error('Upazila does not have a partOf reference')
    }

    result.union = await fetchLocationByIdentifiers(
      [
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: codes.unionCode
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UNION'
        }
      ],
      `partof=Location/${result.upazila.id}`,
      authHeader
    )
  }

  if (codes.municipalityCode && result.upazila) {
    if (!result.upazila.partOf || !result.upazila.partOf.reference) {
      throw new Error('Upazila does not have a partOf reference')
    }

    result.municipality = await fetchLocationByIdentifiers(
      [
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: codes.municipalityCode
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'MUNICIPALITY'
        }
      ],
      `partof=Location/${result.upazila.id}`,
      authHeader
    )
  }

  if (codes.cityCorpCode && result.district) {
    if (!result.district.partOf || !result.district.partOf.reference) {
      throw new Error('District does not have a partOf reference')
    }

    result.cityCorp = await fetchLocationByIdentifiers(
      [
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: codes.cityCorpCode
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'CITY_CORPORATION'
        }
      ],
      `partof=Location/${result.district.id}`,
      authHeader
    )
  }

  if (codes.wardCode && result.cityCorp) {
    // ward can be part of municipalities to, how do we handle this
    if (!result.cityCorp.partOf || !result.cityCorp.partOf.reference) {
      throw new Error('CityCorp does not have a partOf reference')
    }

    result.ward = await fetchLocationByIdentifiers(
      [
        {
          system: 'http://opencrvs.org/specs/id/bbs-code',
          value: codes.wardCode
        },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'WARD'
        }
      ],
      `partof=Location/${result.cityCorp.id}`,
      authHeader
    )
  }

  return result
}

export async function fetchFacilityByHRISId(
  hrisId: string,
  authHeader: string
) {
  return await fetchLocationByIdentifiers(
    [
      {
        system: 'http://opencrvs.org/specs/id/hris-internal-id',
        value: hrisId
      }
    ],
    'type=HEALTH_FACILITY',
    authHeader
  )
}

export async function fetchLocationByA2IReference(
  a2iRef: string,
  authHeader: string
) {
  return await fetchLocationByIdentifiers(
    [
      {
        system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
        value: encodeURIComponent(a2iRef)
      }
    ],
    'type=ADMIN_STRUCTURE',
    authHeader
  )
}

export async function fetchUnionByFullBBSCode(
  bbsCode: string,
  authHeader: string
) {
  const divisionCode = bbsCode.substr(0, 2)
  const districtCode = bbsCode.substr(2, 2)
  const upazilaCode = bbsCode.substr(4, 2)
  const unionCode = bbsCode.substr(6, 2)

  if (!unionCode || unionCode.length !== 2) {
    throw new Error(
      'Not all components up to union level were supplied in the BBS code.'
    )
  }

  return (await fetchHierarchicalBangladeshLocations(
    {
      divisionCode,
      districtCode,
      upazilaCode,
      unionCode
    },
    authHeader
  )).union
}

export async function fetchAllAddressLocations(
  addressObject: IIncomingAddress,
  authHeader: string
) {
  return fetchHierarchicalBangladeshLocations(
    {
      divisionCode: addressObject.division && addressObject.division.id,
      districtCode: addressObject.district && addressObject.district.id,
      upazilaCode: addressObject.upazila && addressObject.upazila.id,
      unionCode: addressObject.union && addressObject.union.id,
      municipalityCode:
        addressObject.municipality && addressObject.municipality.id,
      cityCorpCode:
        addressObject.city_corporation && addressObject.city_corporation.id,
      wardCode: addressObject.ward && addressObject.ward.id
    },
    authHeader
  )
}

export async function postBundle(bundle: fhir.Bundle, authHeader: string) {
  const res = await fetch(FHIR_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(bundle)
  })

  if (!res.ok) {
    throw new Error(
      `Error status code received in response, ${res.statusText} ${res.status}`
    )
  }

  return res.json()
}

export async function getLastRegLocationFromFacility(
  eventLocation: fhir.Location,
  hardcodedLocation: string,
  authCode: string
): Promise<fhir.Location | undefined> {
  let lastRegLocation
  const facilityUnion =
    eventLocation.identifier &&
    eventLocation.identifier.find(
      identifier => identifier.system === `${ORG_URL}/specs/id/hris-union-name`
    )

  const facilityMunicipality =
    eventLocation.identifier &&
    eventLocation.identifier.find(
      identifier =>
        identifier.system === `${ORG_URL}/specs/id/hris-paurasava-name`
    )
  let matched: Ia2ILocationRefences | undefined
  if (hardcodedLocation && hardcodedLocation.length !== 0) {
    // Upazila name will be used to attempt to match union or municipality
    // The Upazila name field is the only field that is consistently available in the DHIS2 form
    // for births and deaths in unions and municipalities permanent address
    const allPilotAreas = pilotUnions.concat(pilotMunicipalities)
    matched = allPilotAreas.find(
      location => location.name === hardcodedLocation
    ) as Ia2ILocationRefences
  } else {
    if (
      facilityUnion &&
      facilityUnion.value &&
      facilityUnion.value !== 'Urban Ward No-01 (narsingdi)'
    ) {
      matched = pilotUnions.find(
        location => location.name === facilityUnion.value
      ) as Ia2ILocationRefences
    } else if (facilityMunicipality && facilityMunicipality.value) {
      matched = pilotMunicipalities.find(
        location => location.name === facilityMunicipality.value
      ) as Ia2ILocationRefences
    } else {
      matched = undefined
    }
  }

  if (matched) {
    lastRegLocation = await fetchLocationByA2IReference(
      matched.a2iRef,
      authCode
    )
  }
  return lastRegLocation
}
