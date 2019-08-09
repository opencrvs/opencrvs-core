import fetch from 'node-fetch'
import { FHIR_URL } from '@resources/constants'

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
  nameBn?: string
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

// This is a temporary solution, used to map facilities and employees to a location
// Currently we are requesting facility and employee information manually from a csv file
// Until the A2I system is complete and has ORG and Health staff and facilities fully populated and internally mapped,
// or until we scale out an OpenCRVS team management system, to allow all OpenCRVS employees, facilities, and administrative structures
// to be configurable, we have a temporary solution here, to connect the reference data only in the areas of our test in March 2019

export function getLocationIDByDescription(
  locations: fhir.Location[],
  description: string
) {
  const location = locations.find(obj => {
    return obj.description === description
  }) as fhir.Location
  return location.id as string
}

const kaliganjA2IIdescription = 'division=3&district=20&upazila=165'
const narsingdiA2IIdescription = 'division=3&district=29&upazila=229'
const kurigramA2IIdescription = 'division=6&district=55&upazila=417'
const bhurungamariA2IIdescription = 'division=6&district=55&upazila=413'

export async function getUpazilaID(
  upazilas: fhir.Location[],
  name: string
): Promise<string> {
  let description: string
  if (name === 'Kaliganj') {
    description = kaliganjA2IIdescription
  } else if (name === 'Narsingdi Sadar') {
    description = narsingdiA2IIdescription
  } else if (name === 'Bhurungamari') {
    description = bhurungamariA2IIdescription
  } else {
    description = kurigramA2IIdescription
  }

  return getLocationIDByDescription(upazilas, description)
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
