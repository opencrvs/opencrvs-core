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
  IDefaultQuestionConfig,
  IFieldIdentifiers,
  ICustomQuestionConfig
} from '@client/forms/questionConfig'
import { IConnection, IConfigField, getConfigFieldIdentifiers } from '.'
import { isCustomConfigField } from './customConfig'
import {
  getField,
  getGroup,
  getPrecedingDefaultFieldIdAcrossGroups
} from '@client/forms/configuration/defaultUtils'
import {
  isPreviewGroupConfigField,
  getPreviewGroupLabel,
  isPlaceHolderPreviewGroup
} from './previewGroup'
import { ISerializedForm } from '@client/forms'
import { FieldEnabled } from '@client/forms/configuration'
import { Event } from '@client/utils/gateway'
import { MessageDescriptor } from 'react-intl'

export type IDefaultConfigField = IDefaultQuestionConfig & IConnection

export type IDefaultConfigFieldWithPreviewGroup = IDefaultConfigField & {
  previewGroup: string
  previewGroupLabel: MessageDescriptor
}

export function isDefaultConfigField(
  configField: IConfigField
): configField is IDefaultConfigField {
  return (
    !isCustomConfigField(configField) && !isPreviewGroupConfigField(configField)
  )
}

export function isDefaultConfigFieldWithPreviewGroup(
  configField:
    | ICustomQuestionConfig
    | IDefaultConfigField
    | IDefaultConfigFieldWithPreviewGroup
): configField is IDefaultConfigFieldWithPreviewGroup {
  return 'previewGroup' in configField
}

export function defaultFieldToQuestionConfig(
  fieldId: string,
  { precedingFieldId, foregoingFieldId }: IConnection,
  identifiers: IFieldIdentifiers,
  defaultForm: ISerializedForm
): IDefaultConfigField | IDefaultConfigFieldWithPreviewGroup {
  const { sectionIndex, groupIndex, fieldIndex } = identifiers
  const { enabled, previewGroup, required } = getField(identifiers, defaultForm)
  const configField = {
    fieldId,
    enabled: enabled ?? '',
    required: required ?? false,
    precedingFieldId,
    foregoingFieldId,
    identifiers: {
      sectionIndex,
      groupIndex,
      fieldIndex
    }
  }
  if (previewGroup && isPlaceHolderPreviewGroup(previewGroup)) {
    return {
      ...configField,
      previewGroup,
      previewGroupLabel: getPreviewGroupLabel(
        getGroup(identifiers, defaultForm),
        previewGroup
      )
    }
  }
  return configField
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

export function hasDefaultFieldChanged(
  questionConfig: IDefaultQuestionConfig,
  defaultForm: ISerializedForm
) {
  const { sectionIndex, groupIndex, fieldIndex } = questionConfig.identifiers
  const { event } = getConfigFieldIdentifiers(questionConfig.fieldId)
  const defaultFormField =
    defaultForm.sections[sectionIndex].groups[groupIndex].fields[fieldIndex]
  const precedingDefaultFieldId = getPrecedingDefaultFieldIdAcrossGroups(
    event,
    questionConfig.identifiers,
    defaultForm
  )
  if (precedingDefaultFieldId !== questionConfig.precedingFieldId) {
    return true
  }
  return (
    questionConfig.enabled === FieldEnabled.DISABLED ||
    /* These can be undefined so need to be converted to boolean */
    !!defaultFormField.required !== !!questionConfig.required
  )
}
