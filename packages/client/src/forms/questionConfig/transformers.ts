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
  getIdentifiersFromFieldId,
  IMessage
} from '.'
import {
  ISerializedForm,
  BirthSection,
  DeathSection,
  IValidatorDescriptor
} from '@client/forms'
import {
  getField,
  getFieldId,
  getPrecedingDefaultFieldIdAcrossGroups
} from '@client/forms/configuration/defaultUtils'
import { CustomSelectOption, Event, QuestionInput } from '@client/utils/gateway'
import { populateRegisterFormsWithAddresses } from '@client/forms/configuration/administrative/addresses'
import { registerForms } from '@client/forms/configuration/default/index'
import { MessageDescriptor } from 'react-intl'
import { getDefaultLanguageMessage } from '@client/forms/configuration/customUtils'
import { maxLength } from '../../utils/validate'

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
  /*
   * If you're adding a new field you want country config to be configuring,
   * you need to also add it to function named "createCustomField"
   */
  return questionsPayload.map(
    ({
      fieldId,
      label,
      placeholder,
      description,
      tooltip,
      hideInPreview,
      helperText,
      unit,
      errorMessage,
      validateEmpty,
      maxLength,
      inputWidth,
      fieldName,
      fieldType,
      precedingFieldId,
      initialValue,
      required,
      enabled,
      custom,
      conditionals,
      datasetId,
      options,
      ignoreBottomMargin,
      optionCondition,
      validator,
      extraValue,
      mapping,
      dynamicOptions,
      hideHeader,
      previewGroup,
      disabled
    }) => {
      if (custom) {
        return {
          fieldId,
          label,
          placeholder,
          description,
          hideInPreview,
          validateEmpty,
          tooltip,
          unit,
          errorMessage,
          helperText,
          maxLength,
          inputWidth,
          fieldName,
          fieldType,
          initialValue,
          precedingFieldId,
          ignoreBottomMargin,
          required,
          custom,
          conditionals,
          datasetId,
          options,
          optionCondition,
          validator,
          extraValue,
          mapping,
          dynamicOptions,
          hideHeader,
          previewGroup,
          disabled
        } as ICustomQuestionConfig
      }

      const { event } = getIdentifiersFromFieldId(fieldId)

      const defaultQuestionConfig: IDefaultQuestionConfig = {
        fieldId,
        enabled: enabled ?? '',
        precedingFieldId,
        validateEmpty: validateEmpty ?? false,
        conditionals: conditionals || undefined,
        hideInPreview: hideInPreview ?? false,
        optionCondition: optionCondition || undefined,
        ignoreBottomMargin: ignoreBottomMargin ?? false,
        hideHeader: hideHeader ?? false,
        identifiers: getFieldIdentifiers(fieldId, defaultForms[event]),
        maxLength: maxLength ?? 250
      }

      if (validator && validator.length > 0) {
        defaultQuestionConfig['validator'] = validator as IValidatorDescriptor[]
      }
      if (label && label.length > 0) {
        defaultQuestionConfig.label = getDefaultLanguageMessage(
          label as IMessage[]
        )
      }

      if (helperText) {
        defaultQuestionConfig.helperText = getDefaultLanguageMessage(
          helperText as IMessage[]
        )
      }

      if (options) {
        defaultQuestionConfig.options =
          /*
           * This is done like this as the function parameters are typed incorrectly.
           * The actual argument type for this function should be whatever the backend returns as part of configuration.
           * Currently the type used here is whatever the frontend is expected to send to the backend as part of form configuration UI.
           */
          (options as Array<
            Omit<CustomSelectOption, 'label'> & { label: MessageDescriptor }
          >) ?? undefined
      }

      /* Setting required = false for default fields results
       * in "optional" showing up in some of the fields
       */

      if (required) {
        defaultQuestionConfig.required = true
      }

      if (required === false) {
        defaultQuestionConfig.required = false
      }

      return defaultQuestionConfig
    }
  )
}
