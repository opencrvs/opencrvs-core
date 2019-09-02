import * as Hapi from 'hapi'
import {
  ILocationDataResponse,
  getFacilities
} from '@resources/zmb/features/facilities/service/service'

export async function facilitiesHandler(
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
