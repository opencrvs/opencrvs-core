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
import { IFormData } from '@client/forms'

export function emptyFatherSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (!queryData[sectionId]) {
    transformedData[sectionId] = {
      detailsExist: false,
      primaryAddressSameAsOtherPrimary: true
    }
  } else {
    transformedData[sectionId] = {
      detailsExist: true,
      ...transformedData[sectionId]
    }
  }
  return transformedData
}
