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
  SerializedFormField
} from '@client/forms/index'
import {
  IQuestionConfig,
  isDefaultQuestionConfig,
  IDefaultQuestionConfig,
  getFieldIdentifiers,
  getCustomizedDefaultField,
  getGroupIdentifiers,
  IFieldIdentifiers,
  getConfiguredQuestions
} from '@client/forms/questionConfig'
import { createCustomField } from '@client/forms/configuration/customUtils'
import { getEventDraft } from '@client/forms/configuration/formDrafts/utils'
import { registerForms } from './default/index'
import { DraftStatus, Event } from '@client/utils/gateway'
import { populateRegisterFormsWithAddresses } from './administrative/addresses'
import { deserializeForm } from '@client/forms/mappings/deserializer'

// THIS FILE SORTS & COMBINES CONFIGURATIONS WITH THE DEFAULT CONFIGURATION FOR RENDERING IN THE APPLICATION

/*
 * For precedingFieldId & foregoingFieldId to
 * denote front most and bottom most position
 */
export enum FieldPosition {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}

/* For the enabled field in FormFields */
export enum FieldEnabled {
  DISABLED = 'DISABLED'
}

/* A singly linked list of questionConfigs whose
 * preceding field is a default field, which, is not
 * a part of the questionConfigs
 */
type IQuestionConfigList = {
  precedingFieldId: string
  questions: IQuestionConfig[]
}

function isConfigurable(status: DraftStatus | null) {
  return status === DraftStatus.Published || status === DraftStatus.InPreview
}

type MergedIdentifier = Omit<IFieldIdentifiers, 'fieldIndex'> & {
  fieldIndices: number[]
}

function mergeIdentifiers(
  mergedIdentifiers: MergedIdentifier[],
  { identifiers: questionIdentifiers }: IDefaultQuestionConfig
) {
  let currentFieldIdentifier = mergedIdentifiers.find(
    ({ sectionIndex, groupIndex }) =>
      sectionIndex === questionIdentifiers.sectionIndex &&
      groupIndex === questionIdentifiers.groupIndex
  ) ?? {
    sectionIndex: questionIdentifiers.sectionIndex,
    groupIndex: questionIdentifiers.groupIndex,
    fieldIndices: []
  }
  currentFieldIdentifier = {
    ...currentFieldIdentifier,
    fieldIndices: [
      ...currentFieldIdentifier.fieldIndices,
      questionIdentifiers.fieldIndex
    ]
  }
  return [
    ...mergedIdentifiers.filter(
      ({ sectionIndex, groupIndex }) =>
        sectionIndex !== questionIdentifiers.sectionIndex ||
        groupIndex !== questionIdentifiers.groupIndex
    ),
    currentFieldIdentifier
  ]
}

function filterOutDefaultFields(
  serializedForm: ISerializedForm,
  defaultQuestionConfigs: IDefaultQuestionConfig[]
): ISerializedForm {
  const filteredForm: ISerializedForm = { ...serializedForm }
  defaultQuestionConfigs
    .reduce(mergeIdentifiers, [])
    .forEach(({ sectionIndex, groupIndex, fieldIndices }) => {
      filteredForm.sections = filteredForm.sections.map((section, idx) => {
        if (idx !== sectionIndex) {
          return section
        }
        return {
          ...section,
          groups: section.groups.map((group, idx) => {
            if (idx !== groupIndex) {
              return group
            }
            return {
              ...group,
              fields: group.fields.filter((_, idx) =>
                fieldIndices.every((index) => idx !== index)
              )
            }
          })
        }
      })
    })
  return filteredForm
}

function getQuestionConfigLists(questionConfigs: IQuestionConfig[]) {
  const questionsMap = questionConfigs.reduce<
    Record<string, IQuestionConfig | undefined>
  >((accum, question) => ({ ...accum, [question.fieldId]: question }), {})

  const foregoingFieldMap = questionConfigs.reduce<
    Record<string, IQuestionConfig | undefined>
  >(
    (accum, question) => ({
      ...accum,
      [question.precedingFieldId]: question
    }),
    {}
  )

  return questionConfigs.reduce<IQuestionConfigList[]>((accum, question) => {
    /* Not the head of the linked list */
    if (question.precedingFieldId in questionsMap) {
      return accum
    }
    const { precedingFieldId } = question
    const questions: IQuestionConfig[] = []
    let currentQuestion: IQuestionConfig | undefined = question
    while (currentQuestion) {
      questions.push(currentQuestion)
      currentQuestion = foregoingFieldMap[currentQuestion.fieldId]
    }
    return accum.concat({
      precedingFieldId,
      questions
    })
  }, [])
}

function getCustomizedFields(
  defaultForm: ISerializedForm,
  questionConfigs: IQuestionConfig[]
) {
  return questionConfigs.map((question) => {
    if (isDefaultQuestionConfig(question)) {
      return getCustomizedDefaultField(question, defaultForm)
    }
    return createCustomField(question)
  })
}

function getPrecedingFieldIdentifiers(
  { precedingFieldId, questions }: IQuestionConfigList,
  defaultForm: ISerializedForm
) {
  if (precedingFieldId === FieldPosition.TOP) {
    /*
     * The fields corresponding to the questions are not
     * present in the form so we can only get till group index
     */
    const { event, sectionIndex, groupIndex } = getGroupIdentifiers(
      questions[0].fieldId,
      defaultForm
    )
    return {
      event,
      sectionIndex,
      groupIndex,
      /* The modified fields will be inserted at the front */
      fieldIndex: -1
    }
  }
  return getFieldIdentifiers(precedingFieldId, defaultForm)
}

function getFormWithCustomizedFields(
  serializedFormFields: SerializedFormField[][],
  defaultForm: ISerializedForm
) {
  return {
    ...defaultForm,
    sections: defaultForm.sections.map((section, sectionIndex) => {
      return {
        ...section,
        groups: defaultForm.sections[sectionIndex].groups.map(
          (group, gIndex) => {
            return {
              ...group,
              fields: serializedFormFields[sectionIndex].filter((field) => {
                const { groupIndex } = getFieldIdentifiers(
                  (field as SerializedFormField & { fieldId: string })
                    .fieldId || (field.customQuesstionMappingId as string),
                  defaultForm
                )
                return gIndex === groupIndex
              })
            }
          }
        )
      }
    })
  }
}

function getConfiguredForm(
  event: Event,
  defaultForm: ISerializedForm,
  questionConfig: IQuestionConfig[]
) {
  const serializedQuestions = getConfiguredQuestions(
    event,
    defaultForm,
    questionConfig
  ).map((quesionConfigs) => getCustomizedFields(defaultForm, quesionConfigs))

  const formWithCustomFields = getFormWithCustomizedFields(
    serializedQuestions,
    defaultForm
  )
  return formWithCustomFields
}

function filterOutDisabledFields(
  serializedForm: ISerializedForm
): ISerializedForm {
  return {
    ...serializedForm,
    sections: serializedForm.sections.map((section) => {
      return {
        ...section,
        groups: section.groups.map((group) => {
          return {
            ...group,
            fields: group.fields.filter(
              (field) => field.enabled !== FieldEnabled.DISABLED
            )
          }
        })
      }
    })
  }
}

/* This is for configuring the register and review forms */
export function getConfiguredOrDefaultForm(
  formConfig: IFormConfig,
  event: Event
) {
  const { status } = getEventDraft(formConfig.formDrafts, event) || {
    status: null
  }

  const formWithAddresses = populateRegisterFormsWithAddresses(
    registerForms[event],
    event
  )

  const form = isConfigurable(status)
    ? getConfiguredForm(
        event,
        formWithAddresses,
        formConfig.questionConfig.filter(({ fieldId }) =>
          fieldId.startsWith(event)
        )
      )
    : formWithAddresses

  return deserializeForm(filterOutDisabledFields(form))
}
