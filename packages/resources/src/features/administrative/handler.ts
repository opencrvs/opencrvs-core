import * as Hapi from 'hapi'
import {
  ILocationDataResponse,
  getLocations
} from '@resources/features/administrative/service/service'

export default async function locationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<ILocationDataResponse> {
  let result
  try {
    result = await getLocations()
  } catch (err) {
    throw Error(err)
  }
  return result
}
