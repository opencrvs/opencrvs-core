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
import * as Hapi from '@hapi/hapi'
import { getLanguages, ILanguage } from '@countryconfig/api/content/service'
import { applicationConfig } from '../application/application-config'

export async function countryLogoHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const base64Logo = applicationConfig.COUNTRY_LOGO.file
  // Decode the Base64 string into a buffer
  const imageBuffer = Buffer.from(base64Logo.split(',')[1], 'base64')
  const mimeType = getMimeTypeFromBase64(base64Logo)
  return h.response(imageBuffer).type(mimeType).code(200)
}

function getMimeTypeFromBase64(base64Image: string) {
  const regex = /^data:(.+);base64/
  const matches = base64Image.match(regex)

  if (matches && matches.length > 1) {
    return matches[1]
  }

  return 'image/png'
}

interface IDefinitionsResponse {
  languages: ILanguage[]
}

export async function contentHandler(
  request: Hapi.Request
): Promise<IDefinitionsResponse> {
  const application = request.params.application
  return {
    languages: await getLanguages(application)
  }
}
