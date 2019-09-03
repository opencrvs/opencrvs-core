import * as Hapi from 'hapi'
import {
  getAssest,
  getAssestMimeType
} from '@resources/bgd/features/assets/service'

export async function assetHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const response = h.response(await getAssest(request.params.file))
  response.type(getAssestMimeType(request.params.file))
  return response
}
