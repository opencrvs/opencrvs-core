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
import { APPLICATION_CONFIG_URL } from '@gateway/constants'
import { OpenCRVSRESTDataSource } from '@gateway/graphql/data-source'
import { UUID } from '@opencrvs/commons'
import {
  Location,
  Saved,
  findResourceFromBundleById
} from '@opencrvs/commons/types'

export default class LocationsAPI extends OpenCRVSRESTDataSource {
  override baseURL = APPLICATION_CONFIG_URL

  override willSendRequest(
    _path: string,
    request: AugmentedRequest
  ): void | Promise<void> {
    super.willSendRequest(_path, request)
    request.headers['Content-Type'] = 'application/fhir+json'
  }

  async getLocation(id: string): Promise<Saved<Location>> {
    const record = this.context.dataSources.recordsAPI.fetchRecord()
    if (record) {
      const inBundle = findResourceFromBundleById<Saved<Location>>(record, id)
      if (inBundle) {
        return inBundle
      }
    }

    return this.get<Saved<Location>>(`locations/${id}`)
  }

  async getHierarchy(id: UUID): Promise<Array<Saved<Location>>> {
    return this.get<Array<Saved<Location>>>(`locations/${id}/hierarchy`)
  }
}
