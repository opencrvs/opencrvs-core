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
  SerializedFormField
} from '@client/forms/index'
import { cloneDeep } from 'lodash'
import { getGroup, getIdentifiersFromFieldId, getSection } from '.'

// THIS FILE CONTAINS FUNCTIONS TO CONFIGURE THE DEFAULT CONFIGURATION

export interface IDefaultField {
  index: number
  selectedSectionIndex: number
  selectedGroupIndex: number
  field: SerializedFormField
}

export interface IDefaultFieldCustomisation {
  question: IQuestionConfig
  defaultField: IDefaultField
}

export function getDefaultField(
  form: ISerializedForm,
  fieldId: string
): IDefaultField | undefined {
  const questionIdentifiers = getIdentifiersFromFieldId(fieldId)
  const selectedSection = getSection(
    form.sections,
    questionIdentifiers.sectionId
  )
  const selectedGroup = getGroup(
    selectedSection.section.groups,
    questionIdentifiers.groupId
  )
  const selectedField = selectedGroup.group.fields.filter(
    (field) => field.name === questionIdentifiers.fieldName
  )[0]
  if (!selectedField) {
    return undefined
  }
  return {
    index: selectedGroup.group.fields.indexOf(selectedField),
    field: selectedField,
    selectedGroupIndex: selectedGroup.index,
    selectedSectionIndex: selectedSection.index
  }
}

export function configureDefaultQuestions(
  defaultFieldCustomisations: IDefaultFieldCustomisation[],
  defaultEventForm: ISerializedForm
): ISerializedForm {
  const newForm = cloneDeep(defaultEventForm)
  defaultFieldCustomisations.forEach((defaultFieldCustomisation) => {
    // this is a customisation to a default field
    // default fields can only be enabled or disabled at present
    if (defaultFieldCustomisation.question.enabled === 'DISABLED') {
      newForm.sections[
        defaultFieldCustomisation.defaultField.selectedSectionIndex
      ].groups[
        defaultFieldCustomisation.defaultField.selectedGroupIndex
      ].fields.splice(defaultFieldCustomisation.defaultField.index, 1)
    }
  })
  return newForm
}
