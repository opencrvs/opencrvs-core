import { ILocation } from '@register/offline/reducer'
import { IUserDetails, IGQLLocation, IIdentifier } from './userUtils'

export function filterLocations(
  locations: { [key: string]: ILocation },
  filterValue: string
): { [key: string]: ILocation } {
  const locationsCopy = Object.assign({}, locations)

  Object.values(locationsCopy).forEach((location: ILocation) => {
    if (location.partOf !== `Location/${filterValue}`) {
      delete locationsCopy[location.id]
    }
  })

  return locationsCopy
}

export function getLocation(userDetails: IUserDetails, locationKey: string) {
  if (!userDetails.catchmentArea) {
    throw Error('The user has no catchment area')
  }
  const filteredArea: IGQLLocation[] = userDetails.catchmentArea.filter(
    (area: IGQLLocation) => {
      if (area.identifier) {
        const relevantIdentifier: IIdentifier[] = area.identifier.filter(
          (identifier: IIdentifier) => {
            return identifier.value === locationKey
          }
        )
        return relevantIdentifier[0] ? area : false
      } else {
        throw Error('The catchment area has no identifier')
      }
    }
  )
  return filteredArea[0] ? filteredArea[0].id : ''
}
