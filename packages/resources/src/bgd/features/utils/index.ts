import fetch from 'node-fetch'
import { FHIR_URL } from '@resources/constants'

export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const JURISDICTION_TYPE_DISTRICT = 'district'
export const JURISDICTION_TYPE_UPAZILA = 'upazila'
export const JURISDICTION_TYPE_UNION = 'union'
export const GENERATE_TYPE_RN = 'registrationNumber'

type ISupportedType =
  | fhir.Practitioner
  | fhir.PractitionerRole
  | fhir.Location
  | IOISFLocation

export interface IOISFLocation {
  bbsCode: string
  name: string
  nameBn: string
  id: number
}

export interface IStatistic {
  [key: string]: string
}

export interface ILocation {
  id?: string
  name?: string
  alias?: string
  physicalType?: string
  jurisdictionType?: string
  type?: string
  partOf?: string
}

export const sendToFhir = (
  doc: ISupportedType,
  suffix: string,
  method: string
) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    body: JSON.stringify(doc),
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response
    })
    .catch(error => {
      return Promise.reject(
        new Error(`FHIR ${method} failed: ${error.message}`)
      )
    })
}

export function getLocationIDByDescription(
  locations: fhir.Location[],
  description: string
) {
  const location = locations.find(obj => {
    return obj.description === description
  }) as fhir.Location
  return location.id as string
}

export const getFromFhir = (suffix: string) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export function checkDuplicate(
  propertyName: string,
  inputArray: ISupportedType[]
): boolean {
  const valueArr = inputArray.map((item: ISupportedType) => {
    return item[propertyName]
  })
  const isDuplicate = valueArr.some((item, index) => {
    return valueArr.indexOf(item) !== index
  })

  return isDuplicate
}

export const titleCase = (str: string) => {
  const stringArray = str.toLowerCase().split(' ')
  // tslint:disable-next-line
  for (let i = 0; i < stringArray.length; i++) {
    stringArray[i] =
      stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1)
  }
  return stringArray.join(' ')
}

export async function getPractitionerLocations(
  practitionerId: string
): Promise<fhir.Location[]> {
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
  return locList as fhir.Location[]
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

export function convertStringToASCII(str: string): string {
  return [...str]
    .map(char => char.charCodeAt(0).toString())
    .reduce((acc, v) => acc.concat(v))
}
