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
import {
  Practitioner,
  isCompositionOrCompositionHistory,
  isDocumentReference,
  isPractitioner,
  isPractitionerRole,
  isPractitionerRoleOrPractitionerRoleHistory,
  isSaved
} from '@opencrvs/commons/types'

import { FHIR_URL } from '@gateway/constants'
import { OpenCRVSRESTDataSource } from '@gateway/graphql/data-source'

export default class FHIRAPI extends OpenCRVSRESTDataSource {
  override baseURL = FHIR_URL

  override willSendRequest(
    _path: string,
    request: AugmentedRequest
  ): void | Promise<void> {
    super.willSendRequest(_path, request)
    request.headers['Content-Type'] = 'application/fhir+json'
  }

  async getPractitioner(practitionerId: string) {
    const record = this.context.dataSources.recordsAPI.fetchRecord()
    if (record) {
      const inBundle = record.entry
        .map(({ resource }) => resource)
        .filter(isPractitioner)
        .find((resource) => resource.id === practitionerId)

      if (inBundle) {
        return inBundle
      }
    }

    const res = await this.get<Practitioner>(`Practitioner/${practitionerId}`)
    return res
  }
  async getPractitionerRoleByPractitionerId(practitionerId: string) {
    const record = this.context.dataSources.recordsAPI.fetchRecord()
    if (record) {
      const inBundle = record.entry
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

    return this.get(`PractitionerRole?practitioner=${practitionerId}`)
  }

  async getPractionerRoleHistory(id: string) {
    const record = this.context.dataSources.recordsAPI.fetchRecord()
    if (!record) {
      throw new Error('No record in context. This should never happen')
    }
    return record.entry
      .map(({ resource }) => resource)
      .filter(isPractitionerRoleOrPractitionerRoleHistory)
      .filter((role) => role.id === id)
  }

  getCompositionHistory(id: string) {
    const record = this.context.dataSources.recordsAPI.fetchRecord()
    if (!record) {
      throw new Error('No record in context. This should never happen')
    }
    return record.entry
      .map(({ resource }) => resource)
      .filter((composition) => composition.id === id)
      .filter(isCompositionOrCompositionHistory)
      .filter(isSaved)
      .sort((resourceA, resourceB) => {
        const dateA = new Date(resourceA.meta?.lastUpdated || '')
        const dateB = new Date(resourceB.meta?.lastUpdated || '')
        return dateA.getTime() - dateB.getTime()
      })
  }
  getDocumentReference(id: string) {
    const record = this.context.dataSources.recordsAPI.fetchRecord()
    if (!record) {
      throw new Error('No record in context. This should never happen')
    }
    const reference = record.entry
      .map(({ resource }) => resource)
      .filter(isDocumentReference)
      .find((documentReference) => documentReference.id === id)
    if (reference) {
      return reference
    }
    return this.get(`DocumentReference/${id}`)
  }
}
