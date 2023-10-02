/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { IntlMessages } from '@login/i18n/reducer'
import { request } from './authApi'

export interface ILanguage {
  lang: string
  displayName: string
  messages: IntlMessages
}

interface IContentResponse {
  languages: ILanguage[]
}

export async function loadContent(): Promise<IContentResponse> {
  return await request<IContentResponse>({
    url: new URL('/content/login', window.config.COUNTRY_CONFIG_URL).toString(),
    method: 'GET'
  })
}
