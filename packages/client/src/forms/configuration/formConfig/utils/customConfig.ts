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
  ICustomQuestionConfig,
  getIdentifiersFromFieldId
} from '@client/forms/questionConfig'
import { IConfigField } from '.'
import { camelCase } from 'lodash'
import { FieldPosition } from '@client/forms/configuration'
import { CustomFieldType, Event } from '@client/utils/gateway'
import { getDefaultLanguage } from '@client/i18n/utils'
import {
  isPreviewGroupConfigField,
  getLastFieldOfPreviewGroup
} from './previewGroup'

const CUSTOM_FIELD_LABEL = 'Custom Field'

export type ICustomConfigField = ICustomQuestionConfig

export function isCustomConfigField(
  configField: IConfigField
): configField is ICustomConfigField {
  return 'custom' in configField
}

function determineNextFieldIdNumber(
  configFields: IConfigField[],
  event: Event,
  section: string,
  groupId: string
): number {
  const partialHandleBar = camelCase(CUSTOM_FIELD_LABEL)
  const customFieldNumber = configFields
    .map(({ fieldId }) => fieldId)
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

function getLastConfigField(configFields: IConfigField[]) {
  if (!configFields.length) {
    return undefined
  }
  return configFields[configFields.length - 1]
}

function getGroupId(configFields: IConfigField[]) {
  const lastConfigField = getLastConfigField(configFields)
  if (!lastConfigField) {
    throw new Error(`No field found in section`)
  }
  const { fieldId } = isPreviewGroupConfigField(lastConfigField)
    ? getLastFieldOfPreviewGroup(lastConfigField)
    : lastConfigField
  const { groupId } = getIdentifiersFromFieldId(fieldId)
  return groupId
}

export function prepareNewCustomFieldConfig(
  configFields: IConfigField[],
  event: Event,
  section: string,
  fieldType: CustomFieldType
): ICustomConfigField {
  const groupId = getGroupId(configFields)
  const customFieldNumber = determineNextFieldIdNumber(
    configFields,
    event,
    section,
    groupId
  )
  const defaultMessage = `${CUSTOM_FIELD_LABEL} ${customFieldNumber}`
  const customFieldIndex = `${event}.${section}.${groupId}.${camelCase(
    defaultMessage
  )}`
  const lastField = getLastConfigField(configFields)

  const { fieldId } = !lastField ? { fieldId: FieldPosition.TOP } : lastField

  return {
    fieldId: customFieldIndex,
    fieldName: camelCase(defaultMessage),
    fieldType,
    precedingFieldId: fieldId,
    required: false,
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
