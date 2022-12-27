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

import { IFormData, IFormField } from '@client/forms'
import { IOfflineData } from '@client/offline/reducer'

export const deceasedAddressStateTransformer = (
  transformedData: IFormData,
  registration: any,
  sectionId: string,
  field: IFormField,
  _?: IFormField,
  offlineData?: IOfflineData
) => {
  const stateId = registration.deceased?.address?.[0]?.state
  if (!stateId) return
  const state = offlineData?.locations[stateId]
  if (!state) return
  if (!transformedData[sectionId]) {
    transformedData[sectionId] = {}
  }
  transformedData[sectionId][field.name] = state.name
}

export const deceasedAddressLGATransformer = (
  transformedData: IFormData,
  registration: any,
  sectionId: string,
  field: IFormField,
  _?: IFormField,
  offlineData?: IOfflineData
) => {
  const lgaId = registration.deceased?.address?.[0]?.district
  if (!lgaId) return
  const lga = offlineData?.locations[lgaId]
  if (!lga) return
  if (!transformedData[sectionId]) {
    transformedData[sectionId] = {}
  }
  transformedData[sectionId][field.name] = lga.name
}

export const deceasedAddressLocalityTransformer = (
  transformedData: IFormData,
  registration: any,
  sectionId: string,
  field: IFormField,
  _?: IFormField,
  offlineData?: IOfflineData
) => {
  const localityId = registration.deceased?.address?.[0]?.city
  if (!localityId) return
  const locality = offlineData?.locations[localityId]
  if (!locality) return
  if (!transformedData[sectionId]) {
    transformedData[sectionId] = {}
  }
  transformedData[sectionId][field.name] = locality.name
}
