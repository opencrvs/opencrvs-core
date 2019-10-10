import fetch from 'node-fetch'
import { FHIR_URL } from '@bgd-dhis2-mediator/constants'
import { IIncomingAddress } from '@bgd-dhis2-mediator/features/fhir/service'

interface IIdentifier {
  system: string
  value: string
}

export async function fetchLocationByIdentifiersAndParent(
  identifiers: IIdentifier[],
  partOfRef: string,
  authHeader: string
): Promise<fhir.Location> {
  const identifierQueryStrings = identifiers.map(
    identifier => `identifier=${identifier.system}|${identifier.value}`
  )

  const res = await fetch(
    `${FHIR_URL}/Location?${identifierQueryStrings.join(
      '&'
    )}&partof=${partOfRef}`,
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
      `Location not found, identifiers: ${JSON.stringify(
        identifiers
      )}, parentRef: ${partOfRef}`
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
    result.division = await fetchLocationByIdentifiersAndParent(
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
      'Location/0', // the root location
      authHeader
    )
  }

  if (codes.districtCode && result.division) {
    if (!result.division.partOf || !result.division.partOf.reference) {
      throw new Error('Division does not have a partOf reference')
    }

    result.district = await fetchLocationByIdentifiersAndParent(
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
      `Location/${result.division.id}`,
      authHeader
    )
  }

  if (codes.upazilaCode && result.district) {
    if (!result.district.partOf || !result.district.partOf.reference) {
      throw new Error('District does not have a partOf reference')
    }

    result.upazila = await fetchLocationByIdentifiersAndParent(
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
      `Location/${result.district.id}`,
      authHeader
    )
  }

  if (codes.unionCode && result.upazila) {
    if (!result.upazila.partOf || !result.upazila.partOf.reference) {
      throw new Error('Upazila does not have a partOf reference')
    }

    result.union = await fetchLocationByIdentifiersAndParent(
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
      `Location/${result.upazila.id}`,
      authHeader
    )
  }

  if (codes.municipalityCode && result.upazila) {
    if (!result.upazila.partOf || !result.upazila.partOf.reference) {
      throw new Error('Upazila does not have a partOf reference')
    }

    result.municipality = await fetchLocationByIdentifiersAndParent(
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
      `Location/${result.upazila.id}`,
      authHeader
    )
  }

  if (codes.cityCorpCode && result.district) {
    if (!result.district.partOf || !result.district.partOf.reference) {
      throw new Error('District does not have a partOf reference')
    }

    result.cityCorp = await fetchLocationByIdentifiersAndParent(
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
      `Location/${result.district.id}`,
      authHeader
    )
  }

  if (codes.wardCode && result.cityCorp) {
    // ward can be part of municipalities to, how do we handle this
    if (!result.cityCorp.partOf || !result.cityCorp.partOf.reference) {
      throw new Error('CityCorp does not have a partOf reference')
    }

    result.ward = await fetchLocationByIdentifiersAndParent(
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
      `Location/${result.cityCorp.id}`,
      authHeader
    )
  }

  return result
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
