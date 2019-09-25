import * as moment from 'moment'
import {
  IBirthKeyFigures,
  IEstimation
} from '@metrics/features/registration/metrics/metricsGenerator'
import {
  MALE,
  FEMALE,
  OPENCRVS_SPECIFICATION_URL,
  CRUD_BIRTH_RATE_SEC,
  TOTAL_POPULATION_SEC,
  JURISDICTION_TYPE_SEC
} from '@metrics/features/registration/metrics/constants'
import { fetchFHIR } from '@metrics/features/registration/fhirUtils'
import { IAuthHeader } from '@metrics/features/registration'
export const YEARLY_INTERVAL = '365d'
export const MONTHLY_INTERVAL = '30d'
export const WEEKLY_INTERVAL = '7d'

export const LABEL_FOMRAT = {
  [YEARLY_INTERVAL]: 'YYYY',
  [MONTHLY_INTERVAL]: 'MMMM',
  [WEEKLY_INTERVAL]: 'DD-MM-YYYY'
}

export interface IPoint {
  time: string
  count: number
}

export type Location = fhir.Location & { id: string }

export const ageIntervals = [
  { title: '45d', minAgeInDays: -1, maxAgeInDays: 45 },
  { title: '46d - 1yr', minAgeInDays: 46, maxAgeInDays: 365 },
  { title: '1yr', minAgeInDays: 366, maxAgeInDays: 730 },
  { title: '2yr', minAgeInDays: 731, maxAgeInDays: 1095 },
  { title: '3yr', minAgeInDays: 1096, maxAgeInDays: 1460 },
  { title: '4yr', minAgeInDays: 1461, maxAgeInDays: 1825 },
  { title: '5yr', minAgeInDays: 1826, maxAgeInDays: 2190 },
  { title: '6yr', minAgeInDays: 2191, maxAgeInDays: 2555 },
  { title: '7yr', minAgeInDays: 2556, maxAgeInDays: 2920 },
  { title: '8yr', minAgeInDays: 2921, maxAgeInDays: 3285 },
  { title: '9r', minAgeInDays: 3286, maxAgeInDays: 3650 },
  { title: '10yr', minAgeInDays: 3651, maxAgeInDays: 4015 }
]

export const calculateInterval = (startTime: string, endTime: string) => {
  const timeStartInMil = parseInt(startTime.substr(0, 13), 10)
  const timeEndInMil = parseInt(endTime.substr(0, 13), 10)
  const diffInDays = moment(timeEndInMil).diff(timeStartInMil, 'days')

  if (diffInDays > 365) {
    return YEARLY_INTERVAL
  } else if (diffInDays > 30 && diffInDays <= 365) {
    return MONTHLY_INTERVAL
  } else {
    return WEEKLY_INTERVAL
  }
}

export const generateEmptyBirthKeyFigure = (
  label: string,
  estimate: number
): IBirthKeyFigures => {
  return {
    label,
    value: 0,
    total: 0,
    estimate,
    categoricalData: [
      {
        name: FEMALE,
        value: 0
      },
      {
        name: MALE,
        value: 0
      }
    ]
  }
}

export const fetchEstimateByLocation = async (
  locationData: Location,
  estimatedYear: number
): Promise<IEstimation> => {
  let crudRate: number = 0
  let population: number = 0

  if (!locationData.extension) {
    throw new Error('Invalid location data found')
  }
  let estimateExtensionFound: boolean = false
  locationData.extension.forEach(extension => {
    if (extension.url === OPENCRVS_SPECIFICATION_URL + CRUD_BIRTH_RATE_SEC) {
      estimateExtensionFound = true
      const valueArray: [] = JSON.parse(extension.valueString as string)
      // tslint:disable-next-line
      for (let key = estimatedYear; key > 1; key--) {
        valueArray.forEach(data => {
          if (key in data) {
            crudRate = data[key]
          }
        })
        if (crudRate > 0) {
          break
        }
      }
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + TOTAL_POPULATION_SEC
    ) {
      estimateExtensionFound = true
      const valueArray: [] = JSON.parse(extension.valueString as string)
      // tslint:disable-next-line
      for (let key = estimatedYear; key > 1; key--) {
        valueArray.forEach(data => {
          if (key in data) {
            population = data[key]
          }
        })
        if (population > 0) {
          break
        }
      }
    }
  })
  if (!estimateExtensionFound) {
    if (!locationData.partOf || !locationData.partOf.reference) {
      throw new Error('Unable to fetch estimate data from location tree')
    }
    return await fetchEstimateByLocation(locationData, estimatedYear)
  }
  return {
    estimation: Math.round((crudRate * population) / 1000),
    locationId: locationData.id
  }
}

export const fetchLocation = async (
  locationId: string,
  authHeader: IAuthHeader
) => {
  return await fetchFHIR(`Location/${locationId}`, authHeader)
}

export const getDistrictLocation = async (
  locationId: string,
  authHeader: IAuthHeader
): Promise<Location> => {
  let locationBundle: Location
  let locationType: fhir.Identifier | undefined
  let lId = locationId

  locationBundle = await fetchLocation(lId, authHeader)
  locationType = getLocationType(locationBundle)
  while (
    locationBundle &&
    (!locationType || locationType.value !== 'DISTRICT')
  ) {
    lId =
      (locationBundle &&
        locationBundle.partOf &&
        locationBundle.partOf.reference &&
        locationBundle.partOf.reference.split('/')[1]) ||
      ''
    locationBundle = await fetchLocation(lId, authHeader)
    locationType = getLocationType(locationBundle)
  }

  if (!locationBundle) {
    throw new Error('No district location found')
  }

  return locationBundle
}

function getLocationType(locationBundle: fhir.Location) {
  return (
    locationBundle &&
    locationBundle.identifier &&
    locationBundle.identifier.find(
      identifier =>
        identifier.system === OPENCRVS_SPECIFICATION_URL + JURISDICTION_TYPE_SEC
    )
  )
}
