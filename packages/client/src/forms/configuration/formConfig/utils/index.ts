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
  IDefaultQuestionConfig,
  ICustomQuestionConfig,
  isDefaultQuestionConfig,
  configFieldToQuestionConfig,
  getConfiguredQuestions
} from '@client/forms/questionConfig'
import { Event, QuestionInput } from '@client/utils/gateway'
import { FieldPosition } from '@client/forms/configuration'
import { deserializeFormField } from '@client/forms/mappings/deserializer'
import { createCustomField } from '@client/forms/configuration/customUtils'
import {
  isPreviewGroupConfigField,
  getLastFieldOfPreviewGroup,
  IPreviewGroupConfigField
} from './previewGroup'
import { ICustomConfigField } from './customConfig'
import {
  IDefaultConfigField,
  defaultFieldToQuestionConfig,
  isDefaultConfigField,
  hasDefaultFieldChanged,
  isDefaultConfigFieldWithPreviewGroup,
  IDefaultConfigFieldWithPreviewGroup
} from './defaultConfig'
import { getField } from '@client/forms/configuration/defaultUtils'

export * from './previewGroup'
export * from './motion'
export * from './customConfig'
export * from './defaultConfig'

export type IConnection = {
  precedingFieldId: string
  foregoingFieldId: string
}

export type IConfigField =
  | IDefaultConfigField
  | ICustomConfigField
  | IPreviewGroupConfigField

export type IConfigFieldMap = Record<string, IConfigField>

export type ISectionFieldMap = Record<string, IConfigFieldMap>

export function getConfigFieldIdentifiers(fieldId: string) {
  const [event, sectionId, groupId] = fieldId.split('.')
  return {
    event: event as Event,
    sectionId,
    groupId
  }
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
    /* We need to build the field regardless of the conditionals */
    delete serializedField.conditionals
  } else {
    serializedField = createCustomField(configField)
  }
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

function getPreviewGroupFieldId(fieldId: string, previewGroup: string) {
  const { event, sectionId, groupId } = getConfigFieldIdentifiers(fieldId)
  return [event, sectionId, groupId, 'previewGroup', previewGroup].join('.')
}

type IConfigFieldMaybeWithPreviewGroup =
  | ICustomConfigField
  | IDefaultConfigField
  | IDefaultConfigFieldWithPreviewGroup

function isFromDifferentSections(fieldIdA: string, fieldIdB: string) {
  const { sectionId: sectionA } = getConfigFieldIdentifiers(fieldIdA)
  const { sectionId: sectionB } = getConfigFieldIdentifiers(fieldIdB)
  return sectionA !== sectionB
}

function removeForegoingFieldIdAcrossSections({
  foregoingFieldId,
  fieldId
}: IConfigField) {
  return foregoingFieldId === FieldPosition.BOTTOM ||
    isFromDifferentSections(foregoingFieldId, fieldId)
    ? FieldPosition.BOTTOM
    : foregoingFieldId
}

function getConfigFieldsWithoutPreviewGroups(
  configFields: IConfigFieldMaybeWithPreviewGroup[]
) {
  return configFields
    .filter(
      (configField): configField is IDefaultConfigField | ICustomConfigField =>
        !isDefaultConfigFieldWithPreviewGroup(configField)
    )
    .reduce<ISectionFieldMap>((sectionFieldsMap, configField) => {
      const { sectionId: currentSection } = getConfigFieldIdentifiers(
        configField.fieldId
      )
      const currentSectionFields = sectionFieldsMap[currentSection] ?? {}
      return {
        ...sectionFieldsMap,
        [currentSection]: {
          ...currentSectionFields,
          [configField.fieldId]: configField
        }
      }
    }, {})
}

function getPreviewGroupConfigFields(
  previewGroupDefaultFields: IDefaultConfigFieldWithPreviewGroup[]
) {
  /*
   * We need to check if the precedingField or foregoingField
   * is also a field with a previewGroup or not
   */
  const getPrecedingFieldId = (precedingFieldId: string) => {
    if (precedingFieldId === FieldPosition.TOP) {
      return precedingFieldId
    }
    const precedingPreviewGroupDefaultField = previewGroupDefaultFields.find(
      ({ fieldId }) => fieldId === precedingFieldId
    )
    if (!precedingPreviewGroupDefaultField) {
      return precedingFieldId
    }
    const { fieldId, previewGroup } = precedingPreviewGroupDefaultField
    return getPreviewGroupFieldId(fieldId, previewGroup)
  }

  const getForegoingFieldId = (foregoingFieldId: string) => {
    if (foregoingFieldId === FieldPosition.BOTTOM) {
      return foregoingFieldId
    }
    const foregoingPreviewGroupDefaultField = previewGroupDefaultFields.find(
      ({ fieldId }) => fieldId === foregoingFieldId
    )
    if (!foregoingPreviewGroupDefaultField) {
      return foregoingFieldId
    }
    const { fieldId, previewGroup } = foregoingPreviewGroupDefaultField
    return getPreviewGroupFieldId(fieldId, previewGroup)
  }

  return previewGroupDefaultFields.reduce<IPreviewGroupConfigField[]>(
    (previewGroupConfigFields, previewGroupDefaultField) => {
      const { previewGroup, previewGroupLabel, ...defaultConfigField } =
        previewGroupDefaultField
      const previewGroupId = getPreviewGroupFieldId(
        defaultConfigField.fieldId,
        previewGroup
      )
      let previewGroupConfigField: IPreviewGroupConfigField = {
        ...(previewGroupConfigFields.find(
          ({ fieldId }) => fieldId === previewGroupId
        ) ?? {
          fieldId: previewGroupId,
          previewGroup,
          previewGroupLabel,
          configFields: [],
          precedingFieldId: getPrecedingFieldId(
            defaultConfigField.precedingFieldId
          ),
          foregoingFieldId: FieldPosition.BOTTOM
        })
      }
      previewGroupConfigField = {
        ...previewGroupConfigField,
        foregoingFieldId: getForegoingFieldId(
          defaultConfigField.foregoingFieldId
        ),
        configFields: [
          ...previewGroupConfigField.configFields,
          defaultConfigField
        ]
      }
      return [
        ...previewGroupConfigFields.filter(
          ({ fieldId }) => fieldId !== previewGroupId
        ),
        previewGroupConfigField
      ]
    },
    []
  )
}

function addPreviewGroupConfigField(
  sectionFieldsMap: ISectionFieldMap,
  previewGroupConfigField: IPreviewGroupConfigField
): ISectionFieldMap {
  const { precedingFieldId, foregoingFieldId, fieldId } =
    previewGroupConfigField
  const { sectionId: currentSection } = getConfigFieldIdentifiers(fieldId)
  let currentSectionConfigFields = sectionFieldsMap[currentSection]
  if (previewGroupConfigField.precedingFieldId !== FieldPosition.TOP) {
    currentSectionConfigFields = {
      ...currentSectionConfigFields,
      [precedingFieldId]: {
        ...currentSectionConfigFields[precedingFieldId],
        foregoingFieldId: fieldId
      }
    }
  }
  if (foregoingFieldId !== FieldPosition.BOTTOM) {
    currentSectionConfigFields = {
      ...currentSectionConfigFields,
      [foregoingFieldId]: {
        ...currentSectionConfigFields[foregoingFieldId],
        precedingFieldId: fieldId
      }
    }
  }
  return {
    ...sectionFieldsMap,
    [currentSection]: {
      ...currentSectionConfigFields,
      [fieldId]: previewGroupConfigField
    }
  }
}

export function generateConfigFields(
  event: Event,
  defaultForm: ISerializedForm,
  questions: IQuestionConfig[]
) {
  /*
   * We get a list of all the fields, configured & default,
   * transformed into questionConfigs
   */
  const configFieldsWithDefaultPreviewGroupFields = getConfiguredQuestions(
    event,
    defaultForm,
    questions
  )
    .map((question, idx, questions): IConfigFieldMaybeWithPreviewGroup => {
      const foregoingFieldId =
        idx === questions.length - 1
          ? FieldPosition.BOTTOM
          : questions[idx + 1].fieldId

      if (!isDefaultQuestionConfig(question)) {
        return {
          ...question,
          foregoingFieldId
        }
      }
      return defaultFieldToQuestionConfig(
        question.fieldId,
        { precedingFieldId: question.precedingFieldId, foregoingFieldId },
        question.identifiers,
        defaultForm
      )
    })
    .map((configField) => ({
      ...configField,
      foregoingFieldId: removeForegoingFieldIdAcrossSections(configField)
    }))

  const configFieldsWithoutPreviewGroups = getConfigFieldsWithoutPreviewGroups(
    configFieldsWithDefaultPreviewGroupFields
  )

  const previewGroupDefaultFields =
    configFieldsWithDefaultPreviewGroupFields.filter(
      (configField): configField is IDefaultConfigFieldWithPreviewGroup =>
        isDefaultConfigFieldWithPreviewGroup(configField)
    )

  const previewGroupConfigFields = getPreviewGroupConfigFields(
    previewGroupDefaultFields
  )

  return previewGroupConfigFields.reduce<ISectionFieldMap>(
    addPreviewGroupConfigField,
    configFieldsWithoutPreviewGroups
  )
}

function configFieldsToQuestionConfigs(configFields: ISectionFieldMap) {
  const getPrecedingFieldId = ({ precedingFieldId, fieldId }: IConfigField) => {
    if (precedingFieldId === FieldPosition.TOP) {
      return precedingFieldId
    }
    const { sectionId } = getConfigFieldIdentifiers(fieldId)
    const previousConfigField = configFields[sectionId][precedingFieldId]
    if (isPreviewGroupConfigField(previousConfigField)) {
      return getLastFieldOfPreviewGroup(previousConfigField).fieldId
    }
    return previousConfigField.fieldId
  }

  /*
   * The precedingFieldId needs to be recalculated for the fields that
   * have a previewGroup as a preceding field and the first field inside
   * a previewGroup as it's not updated as the fields are moved around
   */
  return Object.values(configFields).reduce<
    Array<IDefaultQuestionConfig | ICustomQuestionConfig>
  >(
    (questionConfigs, sectionConfigFields) =>
      Object.values(sectionConfigFields)
        .map((configField) => ({
          ...configField,
          precedingFieldId: getPrecedingFieldId(configField)
        }))
        .reduce((sectionQuestionConfigs, configField) => {
          return [
            ...sectionQuestionConfigs,
            ...configFieldToQuestionConfig(configField)
          ]
        }, questionConfigs),
    []
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
      return questionConfig
    })
}
