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
import {
  IForm,
  IFormData,
  TransformedData,
  IFormField,
  IFormFieldMapping,
  IFormFieldMutationMapFunction,
  IFormFieldQueryMapFunction,
  IFormSectionData,
  IFormSection
} from '@client/forms'
import {
  getConditionalActionsForField,
  getVisibleSectionGroupsBasedOnConditions,
  stringifyFieldValue,
  isRadioGroupWithNestedField,
  getSelectedRadioOptionWithNestedFields
} from '@client/forms/utils'
import { IDeclaration } from '@client/declarations'
import { hasFieldChanged } from '@client/views/CorrectionForm/utils'
import { get } from 'lodash'
import { sectionTransformer } from '@client/forms/mappings/query'
import { IOfflineData } from '@client/offline/reducer'
import { IUserDetails } from '@client/utils/userUtils'
import { EventRegistration, EventSearchSet } from '@client/utils/gateway'

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

export const transformRegistrationCorrection = (
  section: IFormSection,
  fieldDef: IFormField,
  draftData: IFormData,
  originalDraftData: IFormData,
  transformedData: TransformedData,
  nestedFieldDef: IFormField | null = null
): void => {
  if (!transformedData.registration) {
    transformedData.registration = {}
  }
  if (!transformedData.registration.correction) {
    transformedData.registration.correction = draftData.registration.correction
      ? { ...(draftData.registration.correction as IFormSectionData) }
      : {}
  }
  if (!transformedData.registration.correction.values) {
    transformedData.registration.correction.values = []
  }

  if (nestedFieldDef) {
    const valuePath = `${fieldDef.name}.nestedFields.${nestedFieldDef.name}`
    const newFieldValue = get(draftData[section.id], valuePath)
    const oldFieldValue = get(originalDraftData[section.id], valuePath)
    if (newFieldValue !== oldFieldValue) {
      transformedData.registration.correction.values.push({
        section: section.id,
        fieldName: valuePath,
        newValue: stringifyFieldValue(
          fieldDef,
          newFieldValue,
          draftData[section.id]
        ),
        oldValue: stringifyFieldValue(
          fieldDef,
          oldFieldValue,
          originalDraftData[section.id]
        )
      })
    }
  } else if (isRadioGroupWithNestedField(fieldDef)) {
    const selectedRadioOption = getSelectedRadioOptionWithNestedFields(
      fieldDef,
      draftData[section.id]
    )
    const selectedRadioOptionOld = getSelectedRadioOptionWithNestedFields(
      fieldDef,
      originalDraftData[section.id]
    )

    if (selectedRadioOption !== selectedRadioOptionOld) {
      transformedData.registration.correction.values.push({
        section: section.id,
        fieldName: fieldDef.name,
        newValue: selectedRadioOption,
        oldValue: selectedRadioOptionOld
      })
    }

    if (
      selectedRadioOption &&
      Array.isArray(fieldDef.nestedFields[selectedRadioOption])
    ) {
      for (const nestedFieldDef of fieldDef.nestedFields[selectedRadioOption]) {
        transformRegistrationCorrection(
          section,
          fieldDef,
          draftData,
          originalDraftData,
          transformedData,
          nestedFieldDef
        )
      }
    }
  } else {
    transformedData.registration.correction.values.push({
      section: section.id,
      fieldName: fieldDef.name,
      newValue: stringifyFieldValue(
        fieldDef,
        draftData[section.id][fieldDef.name],
        draftData[section.id]
      ),
      oldValue: stringifyFieldValue(
        fieldDef,
        originalDraftData[section.id][fieldDef.name],
        originalDraftData[section.id]
      )
    })
  }
}
export const draftToGqlTransformer = (
  formDefinition: IForm,
  draftData: IFormData,
  draftId?: string,
  originalDraftData: IFormData = {}
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  const transformedData: TransformedData = { createdAt: new Date() }
  const inCompleteFieldList: string[] = []
  formDefinition.sections.forEach((section) => {
    if (!draftData[section.id]) {
      draftData[section.id] = {}
    }
    if (!transformedData[section.id]) {
      transformedData[section.id] = {}
    }
    getVisibleSectionGroupsBasedOnConditions(
      section,
      draftData[section.id],
      draftData
    ).forEach((groupDef) => {
      groupDef.fields.forEach((fieldDef) => {
        const conditionalActions: string[] = getConditionalActionsForField(
          fieldDef,
          draftData[section.id],
          undefined,
          draftData
        )
        if (
          fieldDef.required &&
          !conditionalActions.includes('hide') &&
          !conditionalActions.includes('disable') &&
          (draftData[section.id][fieldDef.name] === undefined ||
            draftData[section.id][fieldDef.name] === '')
        ) {
          /* eslint-disable no-console */
          console.error(
            `Data is missing for a required field: ${fieldDef.name}` +
              `on section ${section.id}`
          )
          /* eslint-enable no-console */
          inCompleteFieldList.push(
            `${section.id}/${groupDef.id}/${fieldDef.name}`
          )
          return
        }
        if (Object.keys(originalDraftData).length) {
          if (
            !conditionalActions.includes('hide') &&
            !conditionalActions.includes('disable') &&
            hasFieldChanged(
              fieldDef,
              draftData[section.id],
              originalDraftData[section.id]
            )
          ) {
            transformRegistrationCorrection(
              section,
              fieldDef,
              draftData,
              originalDraftData,
              transformedData
            )
          }
        }

        if (
          draftData[section.id][fieldDef.name] !== null &&
          draftData[section.id][fieldDef.name] !== undefined &&
          draftData[section.id][fieldDef.name] !== '' &&
          !conditionalActions.includes('hide')
        ) {
          if (fieldDef.mapping && fieldDef.mapping.mutation) {
            fieldDef.mapping.mutation(
              transformedData,
              draftData,
              section.id,
              fieldDef
            )
            nestedFieldsMapping(
              transformedData,
              draftData,
              section.id,
              fieldDef,
              'mutation'
            )
          } else {
            transformedData[section.id][fieldDef.name] =
              draftData[section.id][fieldDef.name]
          }
        }
      })
    })
    if (draftData[section.id]._fhirID) {
      transformedData[section.id]._fhirID = draftData[section.id]._fhirID
    }
    if (section.mapping && section.mapping.mutation) {
      section.mapping.mutation(transformedData, draftData, section.id)
    }
    if (
      transformedData[section.id] &&
      Object.keys(transformedData[section.id]).length < 1
    ) {
      delete transformedData[section.id]
    }
  })
  if (draftData._fhirIDMap) {
    transformedData._fhirIDMap = draftData._fhirIDMap
  }
  if (inCompleteFieldList && inCompleteFieldList.length > 0) {
    if (transformedData.registration) {
      transformedData.registration.inCompleteFields =
        inCompleteFieldList.join(',')
    } else {
      transformedData.registration = {
        inCompleteFields: inCompleteFieldList.join(',')
      }
    }
  }
  if (draftId) {
    if (transformedData.registration) {
      transformedData.registration.draftId = draftId
    } else {
      transformedData.registration = { draftId }
    }
  }
  return transformedData
}

export const appendGqlMetadataFromDraft = (
  draft: IDeclaration,
  gqlDetails: TransformedData
) => {
  const { timeLoggedMS } = draft

  if (!gqlDetails.registration.status) {
    gqlDetails.registration.status = []
  }
  if (!gqlDetails.registration.status[0]) {
    gqlDetails.registration.status[0] = {}
  }
  gqlDetails.registration.status[0].timeLoggedMS = timeLoggedMS
}

export const gqlToDraftTransformer = (
  formDefinition: IForm,
  queryData: any,
  offlineData?: IOfflineData,
  userDetails?: IUserDetails
) => {
  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }
  if (!queryData) {
    throw new Error('Provided query data is not valid')
  }
  const transformedData: IFormData = {}

  const visibleSections = formDefinition.sections.filter(
    (section) =>
      getVisibleSectionGroupsBasedOnConditions(
        section,
        queryData[section.id] || {},
        queryData
      ).length > 0
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
      section.mapping.query(transformedData, queryData, section.id)
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
  if (queryData.registration.assignment) {
    transformedData.registration.assignment = queryData.registration.assignment
  }
  return transformedData
}

export function getPotentialDuplicateIds(
  eventRegistration: EventRegistration | EventSearchSet | null
) {
  return eventRegistration?.registration?.duplicates?.filter(
    (duplicate): duplicate is string => !!duplicate
  )
}
