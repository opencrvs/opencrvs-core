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
  SerializedFormField
} from '@client/forms'
import { deserializeFormField } from '@client/forms/mappings/deserializer'
import { createCustomField } from '@client/forms/configuration/customUtils'
import { FieldPosition } from '@client/forms/configuration'
import { FieldEnabled } from '@client/forms/configuration/defaultUtils'
import { registerForms } from '@client/forms/configuration/default'
import { getDefaultLanguage } from '@client/i18n/utils'

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
}

type ICustomConfigField = IQuestionConfig & {
  foregoingFieldId: string
}

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
    formField = { ...formSection.groups[groupIndex].fields[fieldIndex] }
  } else {
    formField = deserializeFormField(createCustomField(configField))
  }
  /* We need to build the field regardless of the conditionals */
  delete formField.conditionals
  return formField
}

export function getContentKey(formField: IFormField) {
  return formField.label.id
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

function getIdentifiers(defaultConfigField: IDefaultConfigField) {
  const { sectionIndex, groupIndex, fieldIndex } =
    defaultConfigField.identifiers
  return {
    event: defaultConfigField.fieldId.split('.')[0] as Event,
    sectionIndex,
    groupIndex,
    fieldIndex
  }
}

function getPrecedingDefaultFieldId(defaultConfigField: IDefaultConfigField) {
  const { event, sectionIndex, groupIndex, fieldIndex } =
    getIdentifiers(defaultConfigField)
  /* First field of the section */
  if (!fieldIndex && !groupIndex) {
    return FieldPosition.TOP
  }
  const section = registerForms[event].sections[sectionIndex]
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
  defaultConfigField: IDefaultConfigField
) {
  const { event, sectionIndex, groupIndex, fieldIndex } =
    getIdentifiers(defaultConfigField)
  const defaultFormField =
    registerForms[event].sections[sectionIndex].groups[groupIndex].fields[
      fieldIndex
    ]
  const precedingDefaultFieldId = getPrecedingDefaultFieldId(defaultConfigField)
  if (precedingDefaultFieldId !== defaultConfigField.preceedingFieldId) {
    return true
  }
  return (
    defaultConfigField.enabled === FieldEnabled.DISABLED ||
    /* These can be undefined so need to be converted to boolean */
    !!defaultFormField.required !== !!defaultConfigField.required
  )
}
