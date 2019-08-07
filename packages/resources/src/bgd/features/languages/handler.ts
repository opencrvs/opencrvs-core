import * as Hapi from 'hapi'
import {
  ILanguageDataResponse,
  getLanguages
} from '@resources/bgd/features/languages/service/service'

export async function languagesHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<ILanguageDataResponse> {
  const application = request.params.application
  let result
  try {
    result = await getLanguages(application)
  } catch (err) {
    throw Error(err)
  }

  return result
}
