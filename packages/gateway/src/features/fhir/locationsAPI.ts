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
// eslint-disable-next-line import/no-relative-parent-imports
import {
  Location,
  Saved,
  findResourceFromBundleById
} from '@opencrvs/commons/types'
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { FHIR_URL } from '@gateway/constants'

export default class LocationsAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = FHIR_URL
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { headers } = this.context
    const headerKeys = Object.keys(headers)
    for (const each of headerKeys) {
      request.headers.set(each, headers[each])
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  getLocation(id: string): Promise<Saved<Location>> {
    if (this.context.record) {
      const inBundle = findResourceFromBundleById<Saved<Location>>(
        this.context.record,
        id
      )
      if (inBundle) {
        return Promise.resolve(inBundle)
      }
    }

    return this.get(`/Location/${id}`)
  }
}
