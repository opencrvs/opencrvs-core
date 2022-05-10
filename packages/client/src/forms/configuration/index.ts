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
  createCustomField,
  createCustomGroup,
  ISortedCustomGroup,
  getCustomFields
} from '@client/forms/configuration/customUtils'
import {
  FieldEnabled,
  getDefaultField,
  IDefaultField,
  IDefaultFieldCustomisation
} from '@client/forms/configuration/defaultUtils'
import { getEventDraft } from '@client/forms/configuration/formDrafts/utils'
import { registerForms } from './default'
import { DraftStatus } from './formDrafts/utils'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { populateRegisterFormsWithAddresses } from './administrative/addresses'
import { cloneDeep, concat } from 'lodash'

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
  questionConfig: IQuestionConfig[],
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
  questionConfig.forEach((question) => {
    const defaultField: IDefaultField | undefined = getDefaultField(
      defaultEventForm,
      question.fieldId
    )
    if (defaultField && !question.custom) {
      // this is a customisation to a default field
      formCustomisations.defaultFieldCustomisations?.push({
        question,
        defaultField
      })
    } else if (question.custom && question.preceedingFieldId) {
      // this is a configuration for a new custom field

      // custom questions may be stacked below each other in blocks, so we need to group those fields so that the whole block can be repositioned
      const preceedingDefaultField: IDefaultField | undefined = getDefaultField(
        defaultEventForm,
        question.preceedingFieldId
      )

      // initialise blocks that either appear after a default field or at the top of the form
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
        // throw every other custom question in this storage array
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
  event: Event,
  inConfig: boolean
): ISerializedForm {
  const formWithAddresses = populateRegisterFormsWithAddresses(
    defaultEventForm,
    event
  )
  // TODO: merge configureDefaultQuestions and configureCustomQuestions into a  single function as repositioning will have to happen together
  const newForm = cloneDeep(formWithAddresses)
  formCustomisations.defaultFieldCustomisations.forEach(
    (defaultFieldCustomisation) => {
      // this is a customisation to a default field

      /* TODO: Handle the changed positions */

      const field: SerializedFormField =
        newForm.sections[
          defaultFieldCustomisation.defaultField.selectedSectionIndex
        ].groups[defaultFieldCustomisation.defaultField.selectedGroupIndex]
          .fields[defaultFieldCustomisation.defaultField.index]
      field.required = defaultFieldCustomisation.question.required

      // removing hidden fields should be the last thing to do after repositioning all default and custom fields vertically
      if (
        defaultFieldCustomisation.question.enabled === FieldEnabled.DISABLED &&
        !inConfig
      ) {
        /*
         * Splice the disabled field away only when in registration, not in configuration mode
         */
        newForm.sections[
          defaultFieldCustomisation.defaultField.selectedSectionIndex
        ].groups[
          defaultFieldCustomisation.defaultField.selectedGroupIndex
        ].fields.splice(defaultFieldCustomisation.defaultField.index, 1)
      }
    }
  )

  console.log(
    'formCustomisations.customQuestionConfigurations: ',
    JSON.stringify(formCustomisations.customQuestionConfigurations)
  )

  formCustomisations.customQuestionConfigurations.forEach((customGroup) => {
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

export function getConfiguredForm(
  questionConfig: IQuestionConfig[],
  event: Event,
  inConfig: boolean
) {
  const form: ISerializedForm = configureRegistrationForm(
    sortFormCustomisations(
      filterQuestionsByEventType(questionConfig, event),
      registerForms[event]
    ),
    registerForms[event],
    event,
    inConfig
  )
  return deserializeForm(form)
}

function isConfigured(status: DraftStatus | null) {
  return status === DraftStatus.PUBLISHED || status === DraftStatus.PREVIEW
}

export function getConfiguredOrDefaultForm(
  formConfig: IFormConfig,
  event: Event,
  inConfig: boolean
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
        event,
        inConfig
      )
    : populateRegisterFormsWithAddresses(registerForms[event], event)
  return deserializeForm(form)
}
