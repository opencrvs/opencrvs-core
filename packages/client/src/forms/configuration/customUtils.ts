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
  ISerializedForm,
  IQuestionConfig,
  SerializedFormField,
  QuestionConfigFieldType
} from '@client/forms/index'
import { cloneDeep, concat } from 'lodash'
import { MessageDescriptor } from 'react-intl'
import { IDefaultField } from '@client/forms/configuration/defaultUtils'
import {
  getGroup,
  getQuestionsIdentifiersFromFieldId,
  getSection,
  IGroup,
  ISection
} from '@client/forms/configuration'

// THIS FILE CONTAINS FUNCTIONS TO CONFIGURE CUSTOM FORM CONFIGURATIONS

interface ICustomQuestionConfiguration {
  question: IQuestionConfig
  field: SerializedFormField
}

export interface ISortedCustomGroup {
  preceedingDefaultField?: IDefaultField
  positionTop?: boolean
  questions: ICustomQuestionConfiguration[]
  sectionIndex: number
  groupIndex: number
}

export function createCustomGroup(
  form: ISerializedForm,
  customQuestionConfigurations: ISortedCustomGroup[],
  question: IQuestionConfig,
  preceedingDefaultField: IDefaultField | null,
  positionTop?: boolean
) {
  const customQuestionIdentifiers = getQuestionsIdentifiersFromFieldId(
    question.fieldId
  )
  const section: ISection = getSection(
    form.sections,
    customQuestionIdentifiers.sectionId
  )
  const group: IGroup = getGroup(
    section.section.groups,
    customQuestionIdentifiers.groupId
  )
  const newCustomGroup: ISortedCustomGroup = {
    sectionIndex: section.index,
    groupIndex: group.index,
    questions: [{ question, field: createCustomField(question) }]
  }
  if (preceedingDefaultField) {
    newCustomGroup.preceedingDefaultField = preceedingDefaultField
  }
  if (positionTop) {
    newCustomGroup.positionTop = positionTop
  }
  customQuestionConfigurations.push(newCustomGroup)
}

export function createCustomField(
  question: IQuestionConfig
): SerializedFormField {
  const baseField: SerializedFormField = {
    name: question.fieldName as string,
    custom: true,
    type: question.fieldType as QuestionConfigFieldType,
    label: question.label as MessageDescriptor,
    initialValue: '',
    validate: [],
    mapping: {
      mutation: {
        operation: 'customFieldToQuestionnaireTransformer'
      },
      query: {
        operation: 'questionnaireToCustomFieldTransformer'
      }
    }
  }
  if (
    baseField.type === 'TEXT' ||
    baseField.type === 'NUMBER' ||
    baseField.type === 'TEXTAREA'
  ) {
    baseField.required = question.required
    baseField.placeholder = question.placeholder as MessageDescriptor
  }
  if (baseField.type === 'TEL') {
    baseField.validate = [
      {
        operation: 'phoneNumberFormat'
      }
    ]
  }
  if (baseField.type === 'TEXT' || baseField.type === 'TEXTAREA') {
    baseField.maxLength = question.maxLength as number
  }
  return baseField
}

function getCustomFields(customQuestionConfig: ICustomQuestionConfiguration[]) {
  const fields: SerializedFormField[] = []
  customQuestionConfig.forEach((config) => {
    fields.push(config.field)
  })
  return fields
}

export function configureCustomQuestions(
  sortedCustomGroups: ISortedCustomGroup[],
  defaultFormWithCustomisations: ISerializedForm
): ISerializedForm {
  const newForm = cloneDeep(defaultFormWithCustomisations)
  sortedCustomGroups.forEach((customGroup) => {
    if (customGroup.positionTop) {
      newForm.sections[customGroup.sectionIndex].groups[
        customGroup.groupIndex
      ].fields = concat(
        getCustomFields(customGroup.questions),
        newForm.sections[customGroup.sectionIndex].groups[
          customGroup.groupIndex
        ].fields
      )
    } else if (customGroup.preceedingDefaultField) {
      newForm.sections[customGroup.sectionIndex].groups[
        customGroup.groupIndex
      ].fields.splice(
        customGroup.preceedingDefaultField.index + 1,
        0,
        ...getCustomFields(customGroup.questions)
      )
    }
  })
  return newForm
}
