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
  IFormSectionGroup,
  Event
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
import { getEventDraft } from '@client/forms/configuration/formDrafts/utils'
import { registerForms } from './default'
import { DraftStatus } from './formDrafts/utils'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { populateRegisterFormsWithAddresses } from './administrative/addresses'

// THIS FILE SORTS & COMBINES CONFIGURATIONS WITH THE DEFAULT CONFIGURATION FOR RENDERING IN THE APPLICATION

/*
 * For preceedingFieldId & foregoingFieldId to
 * denote front most and bottom most position
 */
export enum FieldPosition {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}

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
  customQuestions.forEach((question) => {
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
      } else if (question.preceedingFieldId === FieldPosition.TOP) {
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
  questions: IQuestionConfig[],
  event: string
) {
  return questions?.filter((question) => question.fieldId.includes(event)) || []
}

export function configureRegistrationForm(
  formCustomisations: IFormConfigurations,
  defaultEventForm: ISerializedForm,
  event: Event
): ISerializedForm {
  const formWithAddresses = populateRegisterFormsWithAddresses(
    defaultEventForm,
    event
  )
  const defaultFormWithCustomisations = configureDefaultQuestions(
    formCustomisations.defaultFieldCustomisations,
    formWithAddresses
  )
  return configureCustomQuestions(
    formCustomisations.customQuestionConfigurations,
    defaultFormWithCustomisations
  )
}

export function getConfiguredForm(
  questionConfig: IQuestionConfig[],
  event: Event
) {
  const form: ISerializedForm = configureRegistrationForm(
    sortFormCustomisations(
      filterQuestionsByEventType(questionConfig, event),
      registerForms[event]
    ),
    registerForms[event],
    event
  )
  return deserializeForm(form)
}

function isConfigured(status: DraftStatus | null) {
  return status === DraftStatus.PUBLISHED || status === DraftStatus.PREVIEW
}

export function getConfiguredOrDefaultForm(
  formConfig: IFormConfig,
  event: Event
) {
  const { status } = getEventDraft(formConfig.formDrafts, event) || {
    status: null
  }

  const form: ISerializedForm = isConfigured(status)
    ? configureRegistrationForm(
        sortFormCustomisations(
          filterQuestionsByEventType(formConfig.questionConfig, event),
          registerForms[event]
        ),
        registerForms[event],
        event
      )
    : registerForms[event]
  return deserializeForm(form)
}
