import { ILocation } from '@register/offline/reducer'

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
