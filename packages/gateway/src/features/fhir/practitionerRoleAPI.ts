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
import { FHIR_URL } from '@gateway/constants'
import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest'

export default class PractitionerRoleAPI extends RESTDataSource {
  count: number
  constructor() {
    super()
    this.baseURL = `${FHIR_URL}/PractitionerRole`
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { dataSources, ...authHeader } = this.context
    const headerKeys = Object.keys(authHeader)
    for (const each of headerKeys) {
      request.headers.set(each, authHeader[each])
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  async getPractitionerRoleByPractitionerId(practitionerId: string) {
    return this.get(`?practitioner=${practitionerId}`)
  }

  async getPractionerRoleHistory(id: string) {
    return this.get(`/${id}/_history`)
  }
}
