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
import { Context } from '@gateway/graphql/context'
import {
  isPractitionerRole,
  isPractitionerRoleOrPractitionerRoleHistory
} from '@opencrvs/commons/types'
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { FHIR_URL } from '../../constants'

export default class PractitionerRoleAPI extends RESTDataSource<Context> {
  constructor() {
    super()
    this.baseURL = `${FHIR_URL}/PractitionerRole`
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { headers } = this.context
    const headerKeys = Object.keys(headers)
    for (const each of headerKeys) {
      request.headers.set(each, headers[each as keyof typeof headers]!)
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  async getPractitionerRoleByPractitionerId(practitionerId: string) {
    if (this.context.record) {
      const inBundle = this.context.record.entry
        .map(({ resource }) => resource)
        .filter(isPractitionerRole)
        .find(
          (resource) =>
            resource.practitioner?.reference ===
            `Practitioner/${practitionerId}`
        )

      if (inBundle) {
        return { entry: [{ resource: inBundle }] }
      }
    }

    return this.get(`?practitioner=${practitionerId}`)
  }

  async getPractionerRoleHistory(id: string) {
    if (!this.context.record) {
      throw new Error('No record in context. This should never happen')
    }
    return this.context.record.entry
      .map(({ resource }) => resource)
      .filter(isPractitionerRoleOrPractitionerRoleHistory)
      .filter((role) => role.id === id)
  }
}
