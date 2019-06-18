import * as Hapi from 'hapi'
import {
  ILocationDataResponse,
  getFacilities
} from '@resources/features/facilities/service/service'

export default async function facilitiesHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<ILocationDataResponse> {
  let result
  try {
    result = await getFacilities()
  } catch (err) {
    throw Error(err)
  }
  return result
}
