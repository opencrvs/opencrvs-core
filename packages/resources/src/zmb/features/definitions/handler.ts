import * as Hapi from 'hapi'
import { getForms, IForms } from '@resources/zmb/features/forms/service'
import {
  getLanguages,
  ILanguage
} from '@resources/zmb/features/languages/service/service'
import {
  getTemplates,
  ITemplates
} from '@resources/zmb/features/templates/service'

interface IDefinitionsResponse {
  forms: IForms
  languages: ILanguage[]
  templates: ITemplates
}

export async function definitionsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IDefinitionsResponse> {
  const application = request.params.application
  return {
    forms: await getForms(),
    languages: (await getLanguages(application)).data,
    templates: await getTemplates()
  }
}
