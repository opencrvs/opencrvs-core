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
  Practitioner,
  isCompositionOrCompositionHistory,
  isDocumentReference,
  isPractitioner,
  isPractitionerRole,
  isPractitionerRoleOrPractitionerRoleHistory,
  isSaved
} from '@opencrvs/commons/types'
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { FHIR_URL } from '../../constants'

export default class FHIRAPI extends RESTDataSource<Context> {
  constructor() {
    super()
    this.baseURL = `${FHIR_URL}`
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { headers } = this.context
    const headerKeys = Object.keys(headers)
    for (const each of headerKeys) {
      request.headers.set(each, headers[each as keyof typeof headers]!)
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  async getPractitioner(practitionerId: string) {
    if (this.context.record) {
      const inBundle = this.context.record.entry
        .map(({ resource }) => resource)
        .filter(isPractitioner)
        .find((resource) => resource.id === practitionerId)

      if (inBundle) {
        return inBundle
      }
    }

    return this.get<Practitioner>(`/Practitioner/${practitionerId}`)
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

    return this.get(`/PractitionerRole?practitioner=${practitionerId}`)
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

  getCompositionHistory(id: string) {
    if (!this.context.record) {
      throw new Error('No record in context. This should never happen')
    }
    return this.context.record.entry
      .map(({ resource }) => resource)
      .filter((composition) => composition.id === id)
      .filter(isCompositionOrCompositionHistory)
      .filter(isSaved)
  }
  getDocumentReference(id: string) {
    if (!this.context.record) {
      throw new Error('No record in context. This should never happen')
    }

    const reference = this.context.record.entry
      .map(({ resource }) => resource)
      .filter(isDocumentReference)
      .find((documentReference) => documentReference.id === id)
    if (reference) {
      return reference
    }
    return this.get(`/DocumentReference/${id}`)
  }
}
