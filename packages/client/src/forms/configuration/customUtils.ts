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
import { SerializedFormField, BirthSection } from '@client/forms/index'
import {
  IMessage,
  ICustomQuestionConfig,
  getIdentifiersFromFieldId,
  IConditionalConfig
} from '@client/forms/questionConfig'
import { find } from 'lodash'
import { MessageDescriptor } from 'react-intl'
import { getDefaultLanguage } from '@client/i18n/utils'
import {
  FATHER_DETAILS_DONT_EXIST,
  MOTHER_DETAILS_DONT_EXIST
} from './administrative/addresses'
import { CustomFieldType } from '@client/utils/gateway'

// THIS FILE CONTAINS FUNCTIONS TO CONFIGURE CUSTOM FORM CONFIGURATIONS

function getDefaultLanguageMessage(messages: IMessage[] | undefined) {
  const language = getDefaultLanguage()
  const defaultMessage = find(messages, {
    lang: language
  })
  return defaultMessage?.descriptor
}

function getOtherConditionalsAction(
  conditionals: IConditionalConfig[] | undefined
) {
  if (!conditionals) return []
  return conditionals.map((condition) => {
    const escapeRegExpValue = escapeRegExp(condition.regexp)
    const { fieldName, sectionId } = getIdentifiersFromFieldId(
      condition.fieldId
    )
    return {
      action: 'hide',
      expression: `!(new RegExp("${escapeRegExpValue}").test(draftData && draftData.${sectionId} && draftData.${sectionId}.${fieldName}))`
    }
  })
}

export function createCustomField({
  fieldName,
  fieldId,
  custom,
  fieldType,
  label,
  description,
  tooltip,
  unit,
  placeholder,
  required,
  maxLength,
  conditionals,
  options
}: ICustomQuestionConfig): SerializedFormField {
  const baseField: SerializedFormField = {
    name: fieldName,
    customQuesstionMappingId: fieldId,
    custom,
    required,
    type: fieldType,
    label: getDefaultLanguageMessage(label) as MessageDescriptor,
    initialValue: '',
    validate: [],
    description: getDefaultLanguageMessage(description),
    tooltip: getDefaultLanguageMessage(tooltip),
    options: [],
    mapping: {
      mutation: {
        operation: 'customFieldToQuestionnaireTransformer'
      },
      query: {
        operation: 'questionnaireToCustomFieldTransformer'
      },
      template: {
        fieldName: createCustomFieldHandlebarName(fieldId),
        operation: 'questionnaireToCustomFieldTransformer'
      }
    }
  }
  const { sectionId } = getIdentifiersFromFieldId(fieldId)

  const othersConditionals = getOtherConditionalsAction(conditionals)

  if (sectionId === BirthSection.Father) {
    baseField.conditionals = [
      { action: 'hide', expression: FATHER_DETAILS_DONT_EXIST }
    ]
  } else if (sectionId === BirthSection.Mother) {
    baseField.conditionals = [
      { action: 'hide', expression: MOTHER_DETAILS_DONT_EXIST }
    ]
  }

  if (othersConditionals) {
    baseField.conditionals = [
      ...(baseField.conditionals ?? []),
      ...othersConditionals
    ]
  }

  if (
    baseField.type === 'TEXT' ||
    baseField.type === 'NUMBER' ||
    baseField.type === 'TEXTAREA' ||
    baseField.type === 'TEL'
  ) {
    baseField.placeholder = getDefaultLanguageMessage(placeholder)
  }
  if (baseField.type === 'NUMBER') {
    baseField.unit = getDefaultLanguageMessage(unit)
  }
  if (baseField.type === 'TEL') {
    baseField.validate = [
      {
        operation: 'phoneNumberFormat'
      }
    ]
  }
  if (baseField.type === 'TEXT' || baseField.type === 'TEXTAREA') {
    baseField.maxLength = maxLength
  }
  if (baseField.type === CustomFieldType.SelectWithOptions) {
    baseField.options =
      options?.map((option) => {
        return {
          ...option,
          label: Array.isArray(option.label)
            ? (getDefaultLanguageMessage(option.label) as MessageDescriptor)
            : option.label
        }
      }) || []
  }
  return baseField
}

export function createCustomFieldHandlebarName(fieldId: string) {
  const fieldIdNameArray = fieldId.split('.').map((field, index) => {
    if (index !== 0) {
      return field.charAt(0).toUpperCase() + field.slice(1)
    } else {
      return field
    }
  })

  return `${fieldIdNameArray[0]}${fieldIdNameArray[1]}${
    fieldIdNameArray[fieldIdNameArray.length - 1]
  }`
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
