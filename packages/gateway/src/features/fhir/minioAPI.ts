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
// eslint-disable-next-line import/no-relative-parent-imports
import { DOCUMENTS_URL } from '../../constants'
import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest'

export default class MinioAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = `${DOCUMENTS_URL}/presigned-url`
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { headers } = this.context
    const headerKeys = Object.keys(headers)
    for (const each of headerKeys) {
      request.headers.set(each, headers[each])
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  getStaticData(fileUri: string) {
    return this.get(`${fileUri}`)
  }
}
