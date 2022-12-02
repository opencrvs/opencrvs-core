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
  IFormField,
  IRadioOption,
  ISelectOption,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  DOCUMENT_UPLOADER_WITH_OPTION,
  ISerializedForm,
  IRadioGroupFormField,
  IRadioGroupWithNestedFieldsFormField,
  ISelectFormFieldWithOptions,
  IDocumentUploaderWithOptionsFormField,
  SerializedFormField
} from '@client/forms'
import {
  IQuestionConfig,
  isDefaultQuestionConfig,
  getConfiguredQuestions,
  getIdentifiersFromFieldId,
  ICustomSelectOption
} from '@client/forms/questionConfig'
import { Event, QuestionInput } from '@client/utils/gateway'
import { FieldPosition } from '@client/forms/configuration'
import { deserializeFormField } from '@client/forms/mappings/deserializer'
import { createCustomField } from '@client/forms/configuration/customUtils'
import {
  isPreviewGroupConfigField,
  IPreviewGroupConfigField
} from './previewGroup'
import { ICustomConfigField, isCustomConfigField } from './customConfig'
import {
  IDefaultConfigField,
  defaultQuestionToConfigField,
  isDefaultConfigField,
  hasDefaultFieldChanged
} from './defaultConfig'
import { getField } from '@client/forms/configuration/defaultUtils'
import { ISelectOption as IDataSourceOption } from '@opencrvs/components/lib/Select'

export * from './previewGroup'
export * from './customConfig'
export * from './defaultConfig'

export type IConfigField =
  | IDefaultConfigField
  | ICustomConfigField
  | IPreviewGroupConfigField

export type ISectionFieldMap = Record<string, IConfigField[]>

export type IDataSourceSelectOption = IDataSourceOption & {
  options: ICustomSelectOption[] | ISelectOption[]
}

export function getFieldDefinition(
  configField: IDefaultConfigField | ICustomConfigField,
  defaultForm: ISerializedForm
) {
  let serializedField: SerializedFormField
  if (isDefaultConfigField(configField)) {
    serializedField = {
      ...getField(configField.identifiers, defaultForm),
      required: configField.required
    }
  } else {
    serializedField = createCustomField(configField)
  }
  /* We need to build the field regardless of the conditionals */
  delete serializedField.conditionals
  return deserializeFormField(serializedField)
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

function getContentKey(formField: IFormField) {
  let contentKeys = [formField.label.id]
  if (
    hasOptions(formField) &&
    !['nationality', 'country', 'countryPrimary', 'countrySecondary'].includes(
      formField.name
    )
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

export function getContentKeys(
  configField: IDefaultConfigField | IPreviewGroupConfigField,
  defaultForm: ISerializedForm
) {
  return isDefaultConfigField(configField)
    ? getContentKey(getFieldDefinition(configField, defaultForm))
    : configField.configFields
        .map((field) => getContentKey(getFieldDefinition(field, defaultForm)))
        .flat()
}

export function getCertificateHandlebar(formField: IFormField) {
  return formField.mapping?.template?.[0]
}

export function generateConfigFields(
  event: Event,
  defaultForm: ISerializedForm,
  questions: IQuestionConfig[]
) {
  questions = questions.filter((question) => question.fieldId.startsWith(event))

  return getConfiguredQuestions(event, defaultForm, questions)
    .map((sectionQuestionConfigs) =>
      sectionQuestionConfigs
        .reduce<IConfigField[]>(
          (configFields, question) => [
            ...configFields,
            isDefaultQuestionConfig(question)
              ? defaultQuestionToConfigField(question, defaultForm)
              : question
          ],
          []
        )
        .reduce<IConfigField[]>((configFields, currentConfigField, index) => {
          if (!index) return [currentConfigField]
          const previousConfigField = configFields[configFields.length - 1]
          if (
            isPreviewGroupConfigField(previousConfigField) &&
            isPreviewGroupConfigField(currentConfigField) &&
            previousConfigField.previewGroup === currentConfigField.previewGroup
          ) {
            previousConfigField.configFields = [
              ...previousConfigField.configFields,
              ...currentConfigField.configFields
            ]
            return configFields
          }
          return [...configFields, currentConfigField]
        }, [])
    )
    .reduce<ISectionFieldMap>((sectionMap, sectionConfigFields) => {
      if (sectionConfigFields.length === 0) return sectionMap
      const { sectionId } = getIdentifiersFromFieldId(
        sectionConfigFields[0].fieldId
      )
      return {
        ...sectionMap,
        [sectionId]: sectionConfigFields
      }
    }, {})
}

function configFieldsToQuestionConfigs(
  configFieldsMap: ISectionFieldMap
): IQuestionConfig[] {
  return Object.values(configFieldsMap).flatMap((sectionConfigFields) =>
    sectionConfigFields
      .flatMap((configField) => {
        if (
          isDefaultConfigField(configField) ||
          isCustomConfigField(configField)
        )
          return [configField]
        return configField.configFields
      })
      .map((configField, index, inputConfigFields) => ({
        ...configField,
        precedingFieldId: !index
          ? FieldPosition.TOP
          : inputConfigFields[index - 1].fieldId
      }))
  )
}

export function generateModifiedQuestionConfigs(
  configFields: ISectionFieldMap,
  defaultRegisterForm: ISerializedForm
): QuestionInput[] {
  const questionConfigs = configFieldsToQuestionConfigs(configFields)

  return questionConfigs
    .filter((questionConfig) => {
      if (isDefaultQuestionConfig(questionConfig)) {
        return hasDefaultFieldChanged(questionConfig, defaultRegisterForm)
      }
      return true
    })
    .map((questionConfig) => {
      if (isDefaultQuestionConfig(questionConfig)) {
        const { identifiers, ...rest } = questionConfig
        return rest
      }

      delete questionConfig.options
      return questionConfig as QuestionInput
    })
}
