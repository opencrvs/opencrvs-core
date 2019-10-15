import * as Hapi from 'hapi'
import {
  getCollectorFields,
  IFields
} from '@resources/bgd/features/certificate/service'

export interface IResponse {
  data: IFields
}
export async function collectorFieldsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IResponse> {
  let result
  try {
    result = await getCollectorFields()
  } catch (err) {
    throw Error(err)
  }
  return {
    data: result
  }
}
