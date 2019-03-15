import { ILocation } from 'src/offline/reducer'

export function filterLocations(
  locations: ILocation[],
  filterValue: string
): ILocation[] {
  return locations.filter((location: ILocation) => {
    return location.partOf === `Location/${filterValue}`
  })
}
