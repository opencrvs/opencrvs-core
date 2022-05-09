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
  RADIO_GROUP_WITH_NESTED_FIELDS,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  DOCUMENT_UPLOADER_WITH_OPTION,
  QuestionConfigFieldType
} from '@client/forms'
import { camelCase, keys } from 'lodash'
import { FieldPosition } from '@client/forms/configuration'
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
  field: IFormField
): ICustomConfigField {
  /* TODO: add errorMessage when implemented for FormFields */
  const messageProperties = [
    'label',
    'placeholder',
    'tooltip',
    'description'
  ] as const

  const lang = getDefaultLanguage()

  return {
    fieldId,
    preceedingFieldId,
    enabled: field.enabled ?? '',
    foregoingFieldId: FieldPosition.BOTTOM,
    ...messageProperties.reduce(
      (accum, prop) => ({
        ...accum,
        [prop]: [{ lang, descriptor: field[prop] }]
      }),
      {}
    )
  }
}

export function fieldToQuestionConfig(
  fieldId: string,
  preceedingFieldId: string,
  sectionIndex: number,
  groupIndex: number,
  fieldIndex: number,
  field: IFormField
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
  return customFieldToQuestionConfig(fieldId, preceedingFieldId, field)
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

export function getContentKeys(formField: IFormField) {
  if (
    (formField.type === RADIO_GROUP ||
      formField.type === RADIO_GROUP_WITH_NESTED_FIELDS ||
      formField.type === SELECT_WITH_OPTIONS ||
      formField.type === DOCUMENT_UPLOADER_WITH_OPTION) &&
    !['country', 'countryPermanent', 'nationality'].includes(formField.name)
  ) {
    const listedOptions = formField.options as IRadioOption[]
    const listedContentKey = listedOptions.map((option) => option.label.id)
    return listedContentKey
  } else {
    return [formField.label.id]
  }
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

export function getSectionFieldsMap(event: Event, form: IForm) {
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
              field
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

function getPrecedingDefaultFieldId(
  defaultConfigField: IDefaultConfigField,
  registerForm: IForm
) {
  const { event, sectionIndex, groupIndex, fieldIndex } =
    getDefaultConfigFieldIdentifiers(defaultConfigField)
  /* First field of the section */
  if (!fieldIndex && !groupIndex) {
    return FieldPosition.TOP
  }
  const section = registerForm.sections[sectionIndex]
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
  registerForm: IForm
) {
  const { sectionIndex, groupIndex, fieldIndex } =
    getDefaultConfigFieldIdentifiers(defaultConfigField)
  const defaultFormField =
    registerForm.sections[sectionIndex].groups[groupIndex].fields[fieldIndex]
  const precedingDefaultFieldId = getPrecedingDefaultFieldId(
    defaultConfigField,
    registerForm
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

export function generateKeyFromObj(obj: any) {
  return btoa(JSON.stringify(obj))
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
  registerForm: IForm
) {
  const questionConfigs: IQuestionConfig[] = []
  Object.values(configFields).forEach((sectionConfigFields) => {
    Object.values(sectionConfigFields).forEach((configField) => {
      if (!isDefaultField(configField)) {
        const { foregoingFieldId, ...rest } = configField
        questionConfigs.push(rest)
      } else if (hasDefaultFieldChanged(configField, registerForm)) {
        const { foregoingFieldId, identifiers, ...rest } = configField
        questionConfigs.push(rest)
      }
    })
  })
  return questionConfigs
}
