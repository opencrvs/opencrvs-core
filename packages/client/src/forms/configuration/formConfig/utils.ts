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
  Event,
  IFormField,
  IForm,
  IQuestionConfig,
  IFormSection,
  ISerializedFormSection,
  ISerializedFormSectionGroup,
  IFormSectionGroup,
  SerializedFormField,
  IRadioOption,
  ISelectOption,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  DOCUMENT_UPLOADER_WITH_OPTION,
  QuestionConfigFieldType,
  ISerializedForm,
  IRadioGroupFormField,
  IRadioGroupWithNestedFieldsFormField,
  ISelectFormFieldWithOptions,
  IDocumentUploaderWithOptionsFormField
} from '@client/forms'
import { camelCase, keys } from 'lodash'
import {
  FieldPosition,
  getIdentifiersFromFieldId
} from '@client/forms/configuration'
import { FieldEnabled } from '@client/forms/configuration/defaultUtils'
import { getDefaultLanguage } from '@client/i18n/utils'
import { MessageDescriptor } from 'react-intl'
import { deserializeFormField } from '@client/forms/mappings/deserializer'
import { createCustomField } from '@client/forms/configuration/customUtils'

const CUSTOM_FIELD_LABEL = 'Custom Field'

export type EventSectionGroup = {
  event: Event
  section: string
  group: string
}

type IPreviewGroupPlaceholder = {
  previewGroupID?: string
  previewGroupLabel?: MessageDescriptor
}

export type IDefaultConfigField = Pick<
  IQuestionConfig,
  'fieldId' | 'enabled' | 'required' | 'preceedingFieldId' | 'custom'
> & {
  foregoingFieldId: string
  identifiers: {
    sectionIndex: number
    groupIndex: number
    fieldIndex: number
  }
} & IPreviewGroupPlaceholder

export type ICustomConfigField = IQuestionConfig & {
  foregoingFieldId: string
} & IPreviewGroupPlaceholder

export type IConfigField = IDefaultConfigField | ICustomConfigField

export type IConfigFieldMap = Record<string, IConfigField>

export type ISectionFieldMap = Record<string, IConfigFieldMap>

function defaultFieldToQuestionConfig(
  fieldId: string,
  preceedingFieldId: string,
  sectionIndex: number,
  groupIndex: number,
  fieldIndex: number,
  field: IFormField
): IDefaultConfigField {
  return {
    fieldId,
    enabled: field.enabled ?? '',
    required: field.required,
    preceedingFieldId,
    foregoingFieldId: FieldPosition.BOTTOM,
    identifiers: {
      sectionIndex,
      groupIndex,
      fieldIndex
    }
  }
}

function customFieldToQuestionConfig(
  fieldId: string,
  preceedingFieldId: string,
  field: IFormField,
  questionConfig: IQuestionConfig[]
): ICustomConfigField {
  /* TODO: add errorMessage when implemented for FormFields */

  const originalConfig = questionConfig.filter(
    (question) => question.fieldId === fieldId
  )[0]
  let fieldType

  for (const k in QuestionConfigFieldType) {
    if (
      QuestionConfigFieldType[k as keyof typeof QuestionConfigFieldType] ===
      field.type
    ) {
      fieldType =
        QuestionConfigFieldType[k as keyof typeof QuestionConfigFieldType]
    }
  }

  const customQuestionConfig: ICustomConfigField = {
    fieldId,
    fieldName: field.name,
    preceedingFieldId,
    required: originalConfig.required,
    enabled: field.enabled ?? '',
    custom: true,
    foregoingFieldId: FieldPosition.BOTTOM,
    label: originalConfig.label,
    placeholder: originalConfig.placeholder,
    tooltip: originalConfig.tooltip,
    description: originalConfig.description
  }
  if (fieldType) {
    customQuestionConfig.fieldType = fieldType
  }
  return customQuestionConfig
}

export function fieldToQuestionConfig(
  fieldId: string,
  preceedingFieldId: string,
  sectionIndex: number,
  groupIndex: number,
  fieldIndex: number,
  field: IFormField,
  questionConfig: IQuestionConfig[]
): IConfigField {
  if (!field.custom) {
    return defaultFieldToQuestionConfig(
      fieldId,
      preceedingFieldId,
      sectionIndex,
      groupIndex,
      fieldIndex,
      field
    )
  }
  return customFieldToQuestionConfig(
    fieldId,
    preceedingFieldId,
    field,
    questionConfig
  )
}

export function getFieldDefinition(
  formSection: IFormSection,
  configField: IConfigField
) {
  let formField: IFormField
  if (isDefaultField(configField)) {
    const { groupIndex, fieldIndex } = configField.identifiers
    formField = {
      ...formSection.groups[groupIndex].fields[fieldIndex],
      required: configField.required
    }
  } else {
    formField = deserializeFormField(createCustomField(configField))
  }
  /* We need to build the field regardless of the conditionals */
  delete formField.conditionals
  return formField
}

function hasOptions(
  formField: IFormField
): formField is
  | IRadioGroupFormField
  | IRadioGroupWithNestedFieldsFormField
  | ISelectFormFieldWithOptions
  | IDocumentUploaderWithOptionsFormField {
  if (
    formField.type === RADIO_GROUP ||
    formField.type === RADIO_GROUP_WITH_NESTED_FIELDS ||
    formField.type === SELECT_WITH_OPTIONS ||
    formField.type === DOCUMENT_UPLOADER_WITH_OPTION
  ) {
    return true
  }
  return false
}

export function getContentKeys(formField: IFormField) {
  let contentKeys = [formField.label.id]
  if (
    hasOptions(formField) &&
    !['country', 'countryPrimary', 'countrySecondary'].includes(formField.name)
  ) {
    contentKeys = contentKeys.concat(
      /* We can remove this type assertion in typescript 4.2+ */
      (formField.options as (ISelectOption | IRadioOption)[]).map(
        (option) => option.label.id
      )
    )
  }
  return contentKeys
}

export function getCertificateHandlebar(formField: IFormField) {
  return formField.mapping?.template?.[0]
}

export function isDefaultField(
  configField: IDefaultConfigField | ICustomConfigField
): configField is IDefaultConfigField {
  return !configField.custom
}

function getFieldId(
  event: Event,
  section: IFormSection | ISerializedFormSection,
  group: IFormSectionGroup | ISerializedFormSectionGroup,
  field: IFormField | SerializedFormField
) {
  return [event.toLowerCase(), section.id, group.id, field.name].join('.')
}

export function getSectionFieldsMap(
  event: Event,
  form: IForm,
  questionConfig: IQuestionConfig[]
) {
  return form.sections.reduce<ISectionFieldMap>(
    (sectionFieldMap, section, sectionIndex) => {
      let precedingFieldId: string = FieldPosition.TOP
      sectionFieldMap[section.id] = section.groups.reduce<IConfigFieldMap>(
        (groupFieldMap, group, groupIndex) =>
          group.fields.reduce((fieldMap, field, fieldIndex) => {
            const fieldId = getFieldId(event, section, group, field)
            fieldMap[fieldId] = fieldToQuestionConfig(
              fieldId,
              precedingFieldId,
              sectionIndex,
              groupIndex,
              fieldIndex,
              field,
              questionConfig
            )
            if (precedingFieldId in fieldMap) {
              fieldMap[precedingFieldId]!.foregoingFieldId = fieldId
            }
            precedingFieldId = fieldId
            return fieldMap
          }, groupFieldMap),
        {}
      )
      return sectionFieldMap
    },
    {}
  )
}

export function getDefaultConfigFieldIdentifiers(
  defaultConfigField: IDefaultConfigField
) {
  const { sectionIndex, groupIndex, fieldIndex } =
    defaultConfigField.identifiers
  return {
    event: defaultConfigField.fieldId.split('.')[0] as Event,
    sectionIndex,
    groupIndex,
    fieldIndex
  }
}

function getIdentifiersInDefaultForm(
  defaultConfigField: IDefaultConfigField,
  defaultForm: ISerializedForm
) {
  const { event, sectionId, groupId, fieldName } = getIdentifiersFromFieldId(
    defaultConfigField.fieldId
  )

  const sectionIndex = defaultForm.sections.findIndex(
    ({ id }) => id === sectionId
  )

  const groups = defaultForm.sections[sectionIndex].groups

  const groupIndex = groups.findIndex(({ id }) => id === groupId)

  const fields = groups[groupIndex].fields

  const fieldIndex = fields.findIndex(({ name }) => name === fieldName)

  return {
    event: event as Event,
    sectionIndex,
    groupIndex,
    fieldIndex
  }
}

function getPrecedingDefaultFieldId(
  defaultFieldIdentifiers: ReturnType<typeof getIdentifiersInDefaultForm>,
  defaultForm: ISerializedForm
) {
  const { event, sectionIndex, groupIndex, fieldIndex } =
    defaultFieldIdentifiers
  /* First field of the section */
  if (!fieldIndex && !groupIndex) {
    return FieldPosition.TOP
  }
  const section = defaultForm.sections[sectionIndex]
  /* First field of the group */
  if (!fieldIndex) {
    const group = section.groups[groupIndex - 1]
    const field = group.fields[group.fields.length - 1]
    return getFieldId(event, section, group, field)
  }
  const group = section.groups[groupIndex]
  const field = group.fields[fieldIndex - 1]
  return getFieldId(event, section, group, field)
}

export function hasDefaultFieldChanged(
  defaultConfigField: IDefaultConfigField,
  defaultForm: ISerializedForm
) {
  const defaultFieldIdentifiers = getIdentifiersInDefaultForm(
    defaultConfigField,
    defaultForm
  )

  const { sectionIndex, groupIndex, fieldIndex } = defaultFieldIdentifiers
  const defaultFormField =
    defaultForm.sections[sectionIndex].groups[groupIndex].fields[fieldIndex]
  const precedingDefaultFieldId = getPrecedingDefaultFieldId(
    defaultFieldIdentifiers,
    defaultForm
  )
  if (precedingDefaultFieldId !== defaultConfigField.preceedingFieldId) {
    return true
  }
  return (
    defaultConfigField.enabled === FieldEnabled.DISABLED ||
    /* These can be undefined so need to be converted to boolean */
    !!defaultFormField.required !== !!defaultConfigField.required
  )
}

function determineNextFieldIdNumber(
  fieldsMap: IConfigFieldMap,
  event: Event,
  section: string,
  groupId: string
): number {
  const partialHandleBar = camelCase(CUSTOM_FIELD_LABEL)
  const customFieldNumber = keys(fieldsMap)
    .filter((item) => item.includes(partialHandleBar))
    .map((item) => {
      const elemNumber = item.replace(
        `${event}.${section}.${groupId}.${partialHandleBar}`,
        ''
      )
      return parseInt(elemNumber)
    })
  return customFieldNumber.length ? Math.max(...customFieldNumber) + 1 : 1
}

function getLastConfigField(fieldsMap: IConfigFieldMap) {
  return Object.values(fieldsMap).find(
    ({ foregoingFieldId }) => foregoingFieldId === FieldPosition.BOTTOM
  )
}

export function prepareNewCustomFieldConfig(
  fieldsMap: IConfigFieldMap,
  event: Event,
  section: string,
  groupId: string,
  fieldType: QuestionConfigFieldType
): ICustomConfigField {
  const customFieldNumber = determineNextFieldIdNumber(
    fieldsMap,
    event,
    section,
    groupId
  )
  const defaultMessage = `${CUSTOM_FIELD_LABEL} ${customFieldNumber}`
  const customFieldIndex = `${event}.${section}.${groupId}.${camelCase(
    defaultMessage
  )}`
  const lastField = getLastConfigField(fieldsMap)

  return {
    fieldId: customFieldIndex,
    fieldName: camelCase(defaultMessage),
    fieldType,
    preceedingFieldId: lastField ? lastField.fieldId : FieldPosition.TOP,
    foregoingFieldId: FieldPosition.BOTTOM,
    required: false,
    enabled: '',
    custom: true,
    label: [
      {
        lang: getDefaultLanguage(),
        descriptor: {
          id: `form.customField.label.customField${customFieldNumber}`,
          defaultMessage
        }
      }
    ]
  }
}

export function generateModifiedQuestionConfigs(
  configFields: ISectionFieldMap,
  defaultRegisterForm: ISerializedForm
) {
  const questionConfigs: IQuestionConfig[] = []
  Object.values(configFields).forEach((sectionConfigFields) => {
    Object.values(sectionConfigFields).forEach((configField) => {
      if (!isDefaultField(configField)) {
        const { foregoingFieldId, previewGroupID, previewGroupLabel, ...rest } =
          configField
        questionConfigs.push(rest)
      } else if (hasDefaultFieldChanged(configField, defaultRegisterForm)) {
        const {
          foregoingFieldId,
          identifiers,
          previewGroupID,
          previewGroupLabel,
          ...rest
        } = configField
        questionConfigs.push(rest)
      }
    })
  })
  return questionConfigs
}
