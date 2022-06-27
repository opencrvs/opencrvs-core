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
import { CustomFieldType, Event } from '@client/utils/gateway'
import { Message } from 'typescript-react-intl'
import { ISerializedForm, BirthSection, DeathSection } from '@client/forms'
import { FieldPosition } from '@client/forms/configuration'
import { defaultFormSectionToQuestionConfigs } from './transformers'

export * from './transformers'

export interface IMessage {
  lang: string
  descriptor: Message
}

interface IBaseQuestionConfig {
  fieldId: string
  precedingFieldId: string
}

export interface IFieldIdentifiers {
  sectionIndex: number
  groupIndex: number
  fieldIndex: number
}

export interface IDefaultQuestionConfig extends IBaseQuestionConfig {
  required?: boolean
  enabled: string
  identifiers: IFieldIdentifiers
}

export interface ICustomQuestionConfig extends IBaseQuestionConfig {
  custom: boolean
  label: IMessage[]
  required: boolean
  placeholder?: IMessage[]
  description?: IMessage[]
  tooltip?: IMessage[]
  errorMessage?: IMessage[]
  maxLength?: number
  fieldName: string
  fieldType: CustomFieldType
}

export type IQuestionConfig = IDefaultQuestionConfig | ICustomQuestionConfig

export function isDefaultQuestionConfig(
  questionConfig: IQuestionConfig
): questionConfig is IDefaultQuestionConfig {
  return !('custom' in questionConfig)
}

export function getIdentifiersFromFieldId(fieldId: string) {
  const splitIds = fieldId.split('.')
  return {
    event: splitIds[0] as Event,
    sectionId: splitIds[1],
    groupId: splitIds[2],
    fieldName: splitIds[3]
  }
}

export function getCustomizedDefaultField(
  question: IDefaultQuestionConfig,
  defaultForm: ISerializedForm
) {
  const {
    identifiers: { sectionIndex, groupIndex, fieldIndex },
    ...rest
  } = question

  const serializedField =
    defaultForm.sections[sectionIndex].groups[groupIndex].fields[fieldIndex]

  return {
    ...serializedField,
    ...rest
  }
}

export function getSectionIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, sectionId } = getIdentifiersFromFieldId(fieldId)

  const sectionIndex = form.sections.findIndex(({ id }) => id === sectionId)
  return {
    event,
    sectionIndex
  }
}

export function getGroupIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, groupId } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex } = getSectionIdentifiers(fieldId, form)

  const groups = form.sections[sectionIndex].groups

  const groupIndex = groups.findIndex(({ id }) => id === groupId)

  return {
    event,
    sectionIndex,
    groupIndex
  }
}

export function getFieldIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, fieldName } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex, groupIndex } = getGroupIdentifiers(fieldId, form)

  const fields = form.sections[sectionIndex].groups[groupIndex].fields

  const fieldIndex = fields.findIndex(({ name }) => name === fieldName)

  return {
    event,
    sectionIndex,
    groupIndex,
    fieldIndex
  }
}

function orderByPosition(questions: IQuestionConfig[]) {
  const questionsMap = questions.reduce<Record<string, IQuestionConfig>>(
    (accum, question) => ({ ...accum, [question.fieldId]: question }),
    {}
  )
  const previouslyVisited: Record<string, boolean> = {}

  function dfs(question: IQuestionConfig): IQuestionConfig[] {
    if (previouslyVisited[question.fieldId]) {
      return []
    }
    previouslyVisited[question.fieldId] = true
    if (question.precedingFieldId === FieldPosition.TOP) {
      return [question]
    }
    const precedingQuestions = dfs(questionsMap[question.precedingFieldId])
    return [...precedingQuestions, question]
  }

  return questions.reduce<IQuestionConfig[]>(
    (orderedQuestions, question) => [...orderedQuestions, ...dfs(question)],
    []
  )
}

export function getConfiguredQuestions(
  event: Event,
  defaultForm: ISerializedForm,
  customizedQuestions: IQuestionConfig[]
) {
  const sections = Object.values<BirthSection | DeathSection>(
    event === Event.Birth ? BirthSection : DeathSection
  )
  return sections.reduce<IQuestionConfig[]>((orderedQuestions, section) => {
    const isPreviouslyCustomized = (fieldId: string) =>
      customizedQuestions.some(
        (customizedQuestion) => customizedQuestion.fieldId === fieldId
      )

    const nonCustomizedQuestions = defaultFormSectionToQuestionConfigs(
      event,
      section,
      defaultForm
    ).filter((question) => !isPreviouslyCustomized(question.fieldId))

    return [
      ...orderedQuestions,
      ...orderByPosition([
        ...customizedQuestions.filter(({ fieldId }) =>
          fieldId.startsWith(`${event}.${section}`)
        ),
        ...nonCustomizedQuestions
      ])
    ]
  }, [])
}
