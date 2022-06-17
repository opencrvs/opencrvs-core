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

import { ICustomQuestionConfig } from '@client/forms/questionConfig'
import { IConnection, IConfigField, IConfigFieldMap } from '.'
import { camelCase, keys } from 'lodash'
import { FieldPosition } from '@client/forms/configuration'
import { CustomFieldType, Event } from '@client/utils/gateway'
import { getDefaultLanguage } from '@client/i18n/utils'

const CUSTOM_FIELD_LABEL = 'Custom Field'

export type ICustomConfigField = ICustomQuestionConfig & IConnection

export function isCustomConfigField(
  configField: IConfigField
): configField is ICustomConfigField {
  return 'custom' in configField
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
  fieldType: CustomFieldType
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

  const { fieldId } = !lastField ? { fieldId: FieldPosition.TOP } : lastField

  return {
    fieldId: customFieldIndex,
    fieldName: camelCase(defaultMessage),
    fieldType,
    precedingFieldId: fieldId,
    foregoingFieldId: FieldPosition.BOTTOM,
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
