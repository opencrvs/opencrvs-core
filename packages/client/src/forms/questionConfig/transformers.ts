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
  ICustomQuestionConfig,
  IFieldIdentifiers,
  getFieldIdentifiers,
  IQuestionConfig,
  getIdentifiersFromFieldId
} from '.'
import { ISerializedForm, BirthSection, DeathSection } from '@client/forms'
import {
  getField,
  getFieldId,
  getPrecedingDefaultFieldIdAcrossGroups
} from '@client/forms/configuration/defaultUtils'
import { Event, QuestionInput } from '@client/utils/gateway'
import { populateRegisterFormsWithAddresses } from '@client/forms/configuration/administrative/addresses'
import { registerForms } from '@client/forms/configuration/default'

export function fieldIdentifiersToQuestionConfig(
  event: Event,
  defaultForm: ISerializedForm,
  identifiers: IFieldIdentifiers
): IDefaultQuestionConfig {
  const { required } = getField(identifiers, defaultForm)
  return {
    fieldId: getFieldId(event, identifiers, defaultForm),
    enabled: '',
    required,
    identifiers,
    precedingFieldId: getPrecedingDefaultFieldIdAcrossGroups(
      event,
      identifiers,
      defaultForm
    )
  }
}

export function formSectionToFieldIdentifiers(
  defaultForm: ISerializedForm,
  section: BirthSection | DeathSection
) {
  return defaultForm.sections
    .map((section, sectionIndex) => ({ ...section, sectionIndex }))
    .filter(({ id }) => id === section)
    .map(({ groups, sectionIndex }) =>
      groups.map((group, groupIndex) => ({
        ...group,
        sectionIndex,
        groupIndex
      }))
    )
    .flat()
    .map<Array<IFieldIdentifiers>>(({ fields, sectionIndex, groupIndex }) =>
      fields.map((_, fieldIndex) => ({
        sectionIndex,
        groupIndex,
        fieldIndex
      }))
    )
    .flat()
}

/* TODO: The paylaod needs to be validated */
export function questionsTransformer(
  questionsPayload: QuestionInput[]
): IQuestionConfig[] {
  const defaultForms = {
    birth: populateRegisterFormsWithAddresses(
      registerForms[Event.Birth],
      Event.Birth
    ),
    death: populateRegisterFormsWithAddresses(
      registerForms[Event.Death],
      Event.Death
    ),
    marriage: populateRegisterFormsWithAddresses(
      registerForms[Event.Marriage],
      Event.Marriage
    )
  }
  return questionsPayload.map(
    ({
      fieldId,
      label,
      placeholder,
      description,
      tooltip,
      errorMessage,
      maxLength,
      fieldName,
      fieldType,
      precedingFieldId,
      required,
      enabled,
      custom,
      conditionals,
      datasetId,
      options
    }) => {
      if (custom) {
        return {
          fieldId,
          label,
          placeholder,
          description,
          tooltip,
          errorMessage,
          maxLength,
          fieldName,
          fieldType,
          precedingFieldId,
          required: required ?? false,
          custom,
          conditionals,
          datasetId,
          options
        } as ICustomQuestionConfig
      }

      const { event } = getIdentifiersFromFieldId(fieldId)

      const defaultQuestionConfig: IDefaultQuestionConfig = {
        fieldId,
        enabled: enabled ?? '',
        precedingFieldId,
        identifiers: getFieldIdentifiers(fieldId, defaultForms[event])
      }
      /* Setting required = false for default fields results
       * in "optional" showing up in some of the fields
       */
      if (required) {
        defaultQuestionConfig.required = true
      }
      return defaultQuestionConfig
    }
  )
}
