/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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
