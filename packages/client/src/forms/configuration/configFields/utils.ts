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
  Event,
  IFormField,
  IFormSection,
  IForm,
  IRadioOption
} from '@client/forms'

export type IConfigFormField = {
  fieldId: string
  precedingFieldId: string | null
  foregoingFieldId: string | null
  required: boolean
  enabled: string
  custom: boolean
  definition: IFormField
}

type IFormFieldMap = Record<string, IConfigFormField>

export type ISectionFieldMap = Record<string, IFormFieldMap>

export function getContentKey(field: IConfigFormField) {
  if (
    (field.definition.type === 'RADIO_GROUP' ||
      field.definition.type === 'RADIO_GROUP_WITH_NESTED_FIELDS' ||
      field.definition.type === 'SELECT_WITH_OPTIONS' ||
      field.definition.type === 'DOCUMENT_UPLOADER_WITH_OPTION') &&
    !['country', 'countryPermanent', 'nationality'].includes(
      field.definition.name
    )
  ) {
    const listedOptions = field.definition.options as IRadioOption[]
    const listedContentKey = listedOptions.map((option) => option.label.id)
    return listedContentKey
  } else {
    return [field.definition.label.id]
  }
}

export function getCertificateHandlebar(field: IConfigFormField) {
  return field.definition.mapping?.template?.[0]
}

export function getSectionFieldsMap(event: Event, section: IFormSection) {
  let precedingFieldId: string | null = null
  return section.groups.reduce<IFormFieldMap>(
    (groupFieldMap, group) =>
      group.fields.reduce((fieldMap, field) => {
        const fieldId = [
          event.toLowerCase(),
          section.id,
          group.id,
          field.name
        ].join('.')
        /* We need to build the field regardless of the conditionals */
        delete field.conditionals
        fieldMap[fieldId] = {
          fieldId,
          precedingFieldId: precedingFieldId ? precedingFieldId : null,
          foregoingFieldId: null,
          required: field.required || false,
          enabled: field.enabled || 'enabled',
          custom: field.custom || false,
          definition: field
        }
        if (precedingFieldId) {
          fieldMap[precedingFieldId].foregoingFieldId = fieldId
        }
        precedingFieldId = fieldId
        return fieldMap
      }, groupFieldMap),
    {}
  )
}

export function getEventSectionFieldsMap(form: IForm, event: Event) {
  const birthSectionFieldsMap = form.sections.reduce<ISectionFieldMap>(
    (sectionFieldsMap, section) => ({
      ...sectionFieldsMap,
      [section.id]: getSectionFieldsMap(event, section)
    }),
    {}
  )

  return birthSectionFieldsMap
}
