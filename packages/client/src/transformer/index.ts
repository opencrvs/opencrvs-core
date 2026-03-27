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
import { IDeclaration, IDuplicates } from '@client/declarations'
import {
  IForm,
  IFormData,
  IFormField,
  IFormFieldMapping,
  IFormFieldMutationMapFunction,
  IFormFieldQueryMapFunction,
  IFormSection,
  IFormSectionData,
  TransformedData
} from '@client/forms'
import { sectionTransformer } from '@client/forms/register/mappings/query'
import {
  getConditionalActionsForField,
  getSelectedRadioOptionWithNestedFields,
  getVisibleSectionGroupsBasedOnConditions,
  isFieldButton,
  isFieldHttp,
  isFieldIDReader,
  isFieldLinkButton,
  isRadioGroupWithNestedField,
  serializeFieldValue
} from '@client/forms/utils'
import { IOfflineData } from '@client/offline/reducer'
import {
  CorrectionValueInput,
  DuplicatesInfo,
  EventRegistration,
  EventSearchSet
} from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { get, isEmpty, isEqual } from 'lodash'

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

const documentChangedValue = (
  section: IFormSection,
  fieldDef: IFormField,
  draftData: IFormData,
  originalDraftData: IFormData
): CorrectionValueInput => {
  const generateValue = (data: IFormData, prefix: string) =>
    isEmpty(data[section.id][fieldDef.name])
      ? ''
      : `${prefix} ${fieldDef.label.defaultMessage}`

  return {
    section: section.id,
    fieldName: fieldDef.name,
    newValue: generateValue(draftData, 'New'),
    oldValue: generateValue(originalDraftData, 'Old')
  }
}
const toCorrectionValue = (
  section: IFormSection,
  fieldDef: IFormField,
  draftData: IFormData,
  originalDraftData: IFormData,
  nestedFieldDef: IFormField | null = null
) => {
  const newSerializedFieldValue = serializeFieldValue(
    fieldDef,
    draftData[section.id][fieldDef.name],
    draftData[section.id]
  )
  const changedValues: CorrectionValueInput[] = []
  if (nestedFieldDef) {
    const valuePath = `${fieldDef.name}.nestedFields.${nestedFieldDef.name}`
    const newFieldValue = get(draftData[section.id], valuePath)
    const oldFieldValue = get(originalDraftData[section.id], valuePath)
    if (newFieldValue !== oldFieldValue && newSerializedFieldValue) {
      changedValues.push({
        section: section.id,
        fieldName: valuePath,
        newValue: newSerializedFieldValue,
        oldValue: serializeFieldValue(
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
      changedValues.push({
        section: section.id,
        fieldName: fieldDef.name,
        newValue: selectedRadioOption ?? '',
        oldValue: selectedRadioOptionOld ?? ''
      })
    }

    if (
      selectedRadioOption &&
      Array.isArray(fieldDef.nestedFields[selectedRadioOption])
    ) {
      for (const nestedFieldDef of fieldDef.nestedFields[selectedRadioOption]) {
        const nestedChangedValues = toCorrectionValue(
          section,
          fieldDef,
          draftData,
          originalDraftData,
          nestedFieldDef
        )
        changedValues.push(...nestedChangedValues)
      }
    }
  } else if (section.id === 'documents') {
    changedValues.push(
      documentChangedValue(section, fieldDef, draftData, originalDraftData)
    )
  } else {
    changedValues.push({
      section: section.id,
      fieldName: fieldDef.name,
      newValue: newSerializedFieldValue ?? '',
      oldValue:
        serializeFieldValue(
          fieldDef,
          originalDraftData[section.id][fieldDef.name],
          originalDraftData[section.id]
        ) ?? ''
    })
  }
  return changedValues
}
/**
 * This check ensures these fields are ignored when submitting, as they only generate
 * other field values and shouldn't be sent to the backend.
 */
function isMetaTypeField(field: IFormField): boolean {
  return (
    isFieldHttp(field) || isFieldLinkButton(field) || isFieldIDReader(field)
  )
}

function hasNestedDataChanged(
  nestedFieldData: IFormData,
  previousNestedFieldData: IFormData
) {
  if (nestedFieldData.value === previousNestedFieldData.value) {
    for (const key of Object.keys(nestedFieldData.nestedFields)) {
      if (
        !previousNestedFieldData.nestedFields[key] &&
        nestedFieldData.nestedFields[key] === ''
      ) {
        continue
      }
      if (
        nestedFieldData.nestedFields[key] !==
        previousNestedFieldData.nestedFields[key]
      ) {
        return true
      }
    }
    return false
  }
  return true
}

function hasFieldChanged(
  field: IFormField,
  sectionData: IFormSectionData,
  originalSectionData?: IFormSectionData
) {
  if (!originalSectionData) {
    const isCustomSection = sectionData && sectionData[field.name]
    if (isCustomSection) return true
    return false
  }
  if (sectionData[field.name] && (sectionData[field.name] as IFormData).value) {
    return hasNestedDataChanged(
      sectionData[field.name] as IFormData,
      originalSectionData[field.name] as IFormData
    )
  }
  /*
   * data section might have some values as empty string
   * whereas original data section have them as undefined
   */
  if (!originalSectionData[field.name] && sectionData[field.name] === '') {
    return false
  }

  if (Array.isArray(sectionData[field.name])) {
    return !isEqual(sectionData[field.name], originalSectionData[field.name])
  }
  return sectionData[field.name] !== originalSectionData[field.name]
}


function getChangedValues(
  formDefinition: IForm,
  declaration: IDeclaration,
  offlineCountryConfig: IOfflineData,
  userDetails: UserDetails | null
) {
  const draftData = declaration.data
  const originalDraftData = declaration.originalData || {}
  const changedValues: CorrectionValueInput[] = []

  if (!formDefinition.sections) {
    throw new Error('Sections are missing in form definition')
  }

  formDefinition.sections.forEach((section) => {
    if (!draftData[section.id]) {
      return
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
          offlineCountryConfig,
          draftData,
          userDetails
        )

        originalDraftData[section.id] ??= {}

        if (
          (!conditionalActions.includes('hide') ||
            fieldDef.name === 'detailsExist') &&
          !isMetaTypeField(fieldDef) &&
          hasFieldChanged(
            fieldDef,
            draftData[section.id],
            originalDraftData[section.id]
          )
        ) {
          changedValues.push(
            ...toCorrectionValue(
              section,
              fieldDef,
              draftData,
              originalDraftData
            )
          )
        }
      })
    })
  })

  return changedValues
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
