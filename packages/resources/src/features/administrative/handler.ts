import * as Hapi from 'hapi'
import { getLocationData, getDistrictData, ILocation } from './service'
// import { logger } from 'src/logger'

export default async function administrativeStructureHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const divisions: ILocation[] = await getLocationData('division', 0)

  const districts: ILocation[] = await getDistrictData(divisions)

  const locations = divisions.concat(districts)

  return { locations }
}
