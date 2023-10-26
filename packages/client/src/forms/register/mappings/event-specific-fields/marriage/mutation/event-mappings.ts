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

import {
  IFormField,
  IFormData,
  TransformedData,
  IFormFieldMutationMapFunction
} from '@client/forms'
import { cloneDeep } from 'lodash'

export const fieldToMarriageDateTransformation =
  (
    alternativeSectionIds?: string[],
    nestedTransformer?: IFormFieldMutationMapFunction
  ) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (!draftData[sectionId] || !draftData[sectionId][field.name]) {
      return transformedData
    }

    let fieldValue = draftData[sectionId][field.name]

    if (nestedTransformer) {
      const clonedTransformedData = cloneDeep(transformedData)
      nestedTransformer(clonedTransformedData, draftData, sectionId, field)
      fieldValue = clonedTransformedData[sectionId][field.name]
    }

    alternativeSectionIds?.forEach((sectionId) => {
      transformedData[sectionId].dateOfMarriage = fieldValue
    })

    return transformedData
  }
