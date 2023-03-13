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
  getIdentifiersFromFieldId
} from '@client/forms/questionConfig'
import { IConfigField } from '.'
import { isCustomConfigField } from './customConfig'
import {
  getField,
  getGroup,
  getPrecedingDefaultFieldIdAcrossGroups
} from '@client/forms/configuration/defaultUtils'
import {
  isPreviewGroupConfigField,
  getPreviewGroupLabel,
  isPlaceHolderPreviewGroup,
  IPreviewGroupConfigField,
  getPreviewGroupFieldId
} from './previewGroup'
import { ISerializedForm } from '@client/forms'
import { FieldEnabled } from '@client/forms/configuration'

export type IDefaultConfigField = IDefaultQuestionConfig & {
  required: boolean
}

export function isDefaultConfigField(
  configField: IConfigField
): configField is IDefaultConfigField {
  return (
    !isCustomConfigField(configField) && !isPreviewGroupConfigField(configField)
  )
}

export function defaultQuestionToConfigField(
  question: IDefaultQuestionConfig,
  defaultForm: ISerializedForm
): IDefaultConfigField | IPreviewGroupConfigField {
  const { previewGroup, required } = getField(question.identifiers, defaultForm)
  const configField = {
    required: required ?? false,
    ...question
  }
  if (!previewGroup || !isPlaceHolderPreviewGroup(previewGroup)) {
    return configField
  }
  const previewGroupConfigField: IPreviewGroupConfigField = {
    fieldId: getPreviewGroupFieldId(question.fieldId, previewGroup),
    previewGroup,
    precedingFieldId: question.precedingFieldId,
    required: question.required,
    previewGroupLabel: getPreviewGroupLabel(
      getGroup(question.identifiers, defaultForm),
      previewGroup
    ),
    configFields: [configField]
  }

  question.validator && (previewGroupConfigField.validator = question.validator)

  return previewGroupConfigField
}

export function hasDefaultFieldChanged(
  questionConfig: IDefaultQuestionConfig,
  defaultForm: ISerializedForm
) {
  const { sectionIndex, groupIndex, fieldIndex } = questionConfig.identifiers
  const { event } = getIdentifiersFromFieldId(questionConfig.fieldId)
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
