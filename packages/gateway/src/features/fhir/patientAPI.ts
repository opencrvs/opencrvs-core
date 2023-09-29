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
import { getResourceFromBundleById } from '@opencrvs/commons/types'
import { FHIR_URL } from '../../constants'
import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest'

export default class PatientAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = `${FHIR_URL}/Patient`
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { headers } = this.context
    const headerKeys = Object.keys(headers)
    for (const each of headerKeys) {
      request.headers.set(each, headers[each])
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  getPatient(id: string) {
    const inBundle = getResourceFromBundleById(this.context.record, id)

    if (inBundle) {
      return { entry: [{ resource: inBundle }] }
    }

    return this.get(`/${id}`)
  }
}
