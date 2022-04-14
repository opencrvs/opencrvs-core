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
  IFormConfig,
  ISerializedForm,
  IIdentifiers,
  IQuestionConfig,
  SerializedFormField,
  ISerializedFormSection,
  IFormSectionGroup
} from '@client/forms/index'
import {
  configureCustomQuestions,
  createCustomField,
  createCustomGroup,
  ISortedCustomGroup
} from '@client/forms/configuration/customUtils'
import {
  configureDefaultQuestions,
  getDefaultField,
  IDefaultField,
  IDefaultFieldCustomisation
} from '@client/forms/configuration/defaultUtils'

// THIS FILE SORTS & COMBINES CONFIGURATIONS WITH THE DEFAULT CONFIGURATION FOR RENDERING IN THE APPLICATION

export interface IFormConfigurations {
  defaultFieldCustomisations: IDefaultFieldCustomisation[]
  customQuestionConfigurations: ISortedCustomGroup[]
}

export interface ISection {
  index: number
  section: ISerializedFormSection
}

type IGroups = (Omit<IFormSectionGroup, 'fields'> & {
  fields: SerializedFormField[]
})[]

export interface IGroup {
  index: number
  group: Omit<IFormSectionGroup, 'fields'> & {
    fields: SerializedFormField[]
  }
}

export function getSection(
  sections: ISerializedFormSection[],
  id: string
): ISection {
  const selectedSection = sections.filter((section) => section.id === id)[0]
  return {
    section: selectedSection,
    index: sections.indexOf(selectedSection)
  }
}

export function getGroup(groups: IGroups, id: string): IGroup {
  const selectedGroup = groups.filter((group) => group.id === id)[0]
  return {
    group: selectedGroup,
    index: groups.indexOf(selectedGroup)
  }
}

export function getIdentifiersFromFieldId(fieldId: string): IIdentifiers {
  const splitIds = fieldId.split('.')
  return {
    event: splitIds[0],
    sectionId: splitIds[1],
    groupId: splitIds[2],
    fieldName: splitIds[3]
  }
}

interface ISortedCustomQuestionPosition {
  parsed: boolean
  sortedCustomGroupIndex?: number
  preceedingCustomQuestionIndex?: number
}

function sortCustomQuestionPosition(
  nextCustomQuestion: IQuestionConfig,
  customQuestionConfigurations: ISortedCustomGroup[]
): ISortedCustomQuestionPosition {
  const result: ISortedCustomQuestionPosition = {
    parsed: false
  }
  customQuestionConfigurations.forEach(
    (customGroup, sortedCustomGroupIndex) => {
      customGroup.questions.forEach((customQuestion, customQuestionIndex) => {
        if (
          customQuestion.question.fieldId ===
          nextCustomQuestion.preceedingFieldId
        ) {
          result.parsed = true
          result.sortedCustomGroupIndex = sortedCustomGroupIndex
          result.preceedingCustomQuestionIndex = customQuestionIndex
        }
      })
    }
  )
  return result
}

export function sortFormCustomisations(
  customQuestions: IQuestionConfig[],
  defaultEventForm: ISerializedForm
): IFormConfigurations {
  // Separates default field customisations
  // Sorts custom questions into ordered blocks
  // so that they can be positioned vertically correctly
  const formCustomisations: IFormConfigurations = {
    defaultFieldCustomisations: [],
    customQuestionConfigurations: []
  }
  const customQsToBeSorted: IQuestionConfig[] = []
  customQuestions.forEach((question, index) => {
    const defaultField: IDefaultField | undefined = getDefaultField(
      defaultEventForm,
      question.fieldId
    )
    if (defaultField && !question.custom) {
      formCustomisations.defaultFieldCustomisations?.push({
        question,
        defaultField
      })
    } else if (question.custom && question.preceedingFieldId) {
      const preceedingDefaultField: IDefaultField | undefined = getDefaultField(
        defaultEventForm,
        question.preceedingFieldId
      )

      if (preceedingDefaultField) {
        createCustomGroup(
          defaultEventForm,
          formCustomisations.customQuestionConfigurations,
          question,
          preceedingDefaultField,
          false
        )
      } else if (question.preceedingFieldId === 'TOP') {
        createCustomGroup(
          defaultEventForm,
          formCustomisations.customQuestionConfigurations,
          question,
          null,
          true
        )
      } else {
        customQsToBeSorted.push(question)
      }
    }
  })
  while (
    customQsToBeSorted.length &&
    formCustomisations.customQuestionConfigurations.length
  ) {
    customQsToBeSorted.forEach((nextQuestion, index) => {
      const nextQuestionPosition = sortCustomQuestionPosition(
        nextQuestion,
        formCustomisations.customQuestionConfigurations
      )
      if (
        nextQuestionPosition.parsed &&
        typeof nextQuestionPosition.sortedCustomGroupIndex === 'number' &&
        typeof nextQuestionPosition.preceedingCustomQuestionIndex === 'number'
      ) {
        formCustomisations.customQuestionConfigurations[
          nextQuestionPosition.sortedCustomGroupIndex
        ].questions.splice(
          nextQuestionPosition.preceedingCustomQuestionIndex + 1,
          0,
          {
            question: nextQuestion,
            field: createCustomField(nextQuestion)
          }
        )

        customQsToBeSorted.splice(index, 1)
      }
    })
  }

  return formCustomisations
}

export function filterQuestionsByEventType(
  formConfig: IFormConfig,
  event: string
): IQuestionConfig[] {
  const filteredQuestions: IQuestionConfig[] = []
  if (
    formConfig &&
    formConfig.questionConfig &&
    formConfig.questionConfig.length > 0
  ) {
    formConfig.questionConfig.forEach((question) => {
      if (question.fieldId.includes(event)) {
        filteredQuestions.push(question)
      }
    })
  }
  return filteredQuestions
}

export function configureRegistrationForm(
  formCustomisations: IFormConfigurations,
  defaultEventForm: ISerializedForm
): ISerializedForm {
  const defaultFormWithCustomisations = configureDefaultQuestions(
    formCustomisations.defaultFieldCustomisations,
    defaultEventForm
  )
  return configureCustomQuestions(
    formCustomisations.customQuestionConfigurations,
    defaultFormWithCustomisations
  )
}
