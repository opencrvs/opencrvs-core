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
  IForm,
  IFormData,
  IFormField,
  IFormFieldMapping,
  IFormFieldMutationMapFunction,
  IFormFieldQueryMapFunction,
  TransformedData
} from '@client/forms'
import { sectionTransformer } from '@client/forms/register/mappings/query'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import { IOfflineData } from '@client/offline/reducer'
import { UserDetails } from '@client/utils/userUtils'

const nestedFieldsMapping = (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  fieldDef: IFormField,
  mappingKey: keyof IFormFieldMapping
) => {
  let tempFormField: IFormField
  for (const index in fieldDef.nestedFields) {
    for (const nestedIndex in fieldDef.nestedFields[index]) {
      tempFormField = fieldDef.nestedFields[index][nestedIndex]
      tempFormField &&
        tempFormField.mapping &&
        tempFormField.mapping[mappingKey] &&
        (
          tempFormField.mapping[mappingKey] as
            | IFormFieldMutationMapFunction
            | IFormFieldQueryMapFunction
        )(transformedData, draftData, sectionId, fieldDef, tempFormField)
    }
  }
}

export const gqlToDraftTransformer = (
  formDefinition: IForm,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  queryData: any,
  offlineData?: IOfflineData,
  userDetails?: UserDetails
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  if (!queryData) {
    throw new Error('Provided query data is not valid')
  }
  const transformedData: IFormData = {}

  const visibleSections = formDefinition.sections.filter((section) =>
    getVisibleSectionGroupsBasedOnConditions(
      section,
      queryData[section.id] || {},
      queryData,
      userDetails
    )
  )
  visibleSections.forEach((section) => {
    transformedData[section.id] = {}
    section.groups.forEach((groupDef) => {
      groupDef.fields.forEach((fieldDef) => {
        if (fieldDef.mapping?.template) {
          if (!transformedData.template) {
            transformedData.template = {}
          }
          /**
           * Wraps actual transformer with
           * section transformer
           */
          const [fieldName, fieldTransformer] = fieldDef.mapping.template
          sectionTransformer('template', fieldTransformer, fieldName)(
            transformedData,
            queryData,
            section.id,
            fieldDef,
            undefined,
            offlineData
          )
        }
        if (fieldDef.mapping && fieldDef.mapping.query) {
          fieldDef.mapping.query(
            transformedData,
            queryData,
            section.id,
            fieldDef
          )
          nestedFieldsMapping(
            transformedData,
            queryData,
            section.id,
            fieldDef,
            'query'
          )
        } else if (
          queryData[section.id] &&
          queryData[section.id][fieldDef.name] &&
          queryData[section.id][fieldDef.name] !== ''
        ) {
          transformedData[section.id][fieldDef.name] =
            queryData[section.id][fieldDef.name]
        }
      })
    })
    if (queryData[section.id] && queryData[section.id].id) {
      transformedData[section.id]._fhirID = queryData[section.id].id
    }
    if (section.mapping && section.mapping.query) {
      section.mapping.query(
        transformedData,
        queryData,
        section.id,
        undefined,
        undefined,
        offlineData
      )
    }
    if (section.mapping?.template) {
      if (!transformedData.template) {
        transformedData.template = {}
      }
      section.mapping.template.forEach(([fieldName, transformer]) => {
        transformer(
          transformedData,
          queryData,
          section.id,
          'template',
          fieldName,
          offlineData,
          userDetails
        )
      })
    }
    if (
      transformedData[section.id] &&
      Object.keys(transformedData[section.id]).length < 1
    ) {
      delete transformedData[section.id]
    }
  })
  if (queryData._fhirIDMap) {
    transformedData._fhirIDMap = queryData._fhirIDMap
  }
  if (queryData.history) {
    transformedData.history = queryData.history
  }

  if (queryData.user?.role) {
    transformedData.user.role = queryData.user.role
  }

  return transformedData
}
