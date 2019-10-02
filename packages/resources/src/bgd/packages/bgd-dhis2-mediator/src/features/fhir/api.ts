import fetch from 'node-fetch'
import { FHIR_URL } from '@search/constants'

interface IIdentifier {
  system: string
  value: string
}

async function fetchLocationByIdentifiersAndParent(
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
      'Received bundle has no entries or entry resource is undefined'
    )
  }

  return bundle.entry[0].resource as fhir.Location
}

export async function fetchLocationByFullBBSCode(
  bbsCode: string,
  authHeader: string
) {
  const divisionCode = bbsCode.substr(0, 2)
  const districtCode = bbsCode.substr(2, 2)
  const upazillaCode = bbsCode.substr(4, 2)
  const unionCode = bbsCode.substr(6, 2)

  if (!unionCode || unionCode.length !== 2) {
    throw new Error(
      'No all components up to union level were supplied in the BBS code.'
    )
  }

  const division = await fetchLocationByIdentifiersAndParent(
    [
      { system: 'http://opencrvs.org/specs/id/bbs-code', value: divisionCode },
      {
        system: 'http://opencrvs.org/specs/id/jurisdiction-type',
        value: 'DIVISION'
      }
    ],
    'Location/0', // the root location
    authHeader
  )

  if (!division.partOf || !division.partOf.reference) {
    throw new Error('Division does not have a partOf reference')
  }

  const district = await fetchLocationByIdentifiersAndParent(
    [
      { system: 'http://opencrvs.org/specs/id/bbs-code', value: districtCode },
      {
        system: 'http://opencrvs.org/specs/id/jurisdiction-type',
        value: 'DISTRICT'
      }
    ],
    `Location/${division.id}`,
    authHeader
  )

  if (!district.partOf || !district.partOf.reference) {
    throw new Error('District does not have a partOf reference')
  }

  const upazila = await fetchLocationByIdentifiersAndParent(
    [
      { system: 'http://opencrvs.org/specs/id/bbs-code', value: upazillaCode },
      {
        system: 'http://opencrvs.org/specs/id/jurisdiction-type',
        value: 'UPAZILA'
      }
    ],
    `Location/${district.id}`,
    authHeader
  )

  if (!upazila.partOf || !upazila.partOf.reference) {
    throw new Error('Upazila does not have a partOf reference')
  }

  const union = await fetchLocationByIdentifiersAndParent(
    [
      { system: 'http://opencrvs.org/specs/id/bbs-code', value: unionCode },
      {
        system: 'http://opencrvs.org/specs/id/jurisdiction-type',
        value: 'UNION'
      }
    ],
    `Location/${upazila.id}`,
    authHeader
  )

  return union
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
