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

import { UUID } from '@opencrvs/commons'
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { APPLICATION_CONFIG_URL } from '@gateway/constants'

/* @todo */
type Location = {
  id: string
  name: string
}

export default class LocationsAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = APPLICATION_CONFIG_URL
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { headers } = this.context
    const headerKeys = Object.keys(headers)
    for (const each of headerKeys) {
      request.headers.set(each, headers[each])
    }
  }

  getLocation(id: string): Promise<Location> {
    return this.get(`/locations/${id}`)
  }

  getHierarchy(id: UUID): Promise<Array<Location>> {
    return this.get(`/locations/${id}/hierarchy`)
  }
}
