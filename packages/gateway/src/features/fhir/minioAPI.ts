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

import { AugmentedRequest } from '@apollo/datasource-rest'
import { DOCUMENTS_URL } from '@gateway/constants'
import { OpenCRVSRESTDataSource } from '@gateway/graphql/data-source'

export default class MinioAPI extends OpenCRVSRESTDataSource {
  override baseURL = `${DOCUMENTS_URL}`

  override willSendRequest(
    _path: string,
    request: AugmentedRequest
  ): void | Promise<void> {
    super.willSendRequest(_path, request)
    request.headers['Content-Type'] = 'application/fhir+json'
  }

  getStaticData(fileUri: string) {
    return this.get(`/presigned-url${fileUri}`)
  }
}
