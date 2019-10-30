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
import { IFormField, IFormData } from '@register/forms'

export function hasCaseOfDeathSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) {
  if (queryData.causeOfDeathMethod || queryData.causeOfDeath) {
    transformedData[sectionId][field.name] = true
  } else {
    transformedData[sectionId][field.name] = false
  }
  return transformedData
}
