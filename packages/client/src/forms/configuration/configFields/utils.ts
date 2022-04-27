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

import { Event, IFormField, IFormSection, IForm, IMessage } from '@client/forms'
import { IConfigFieldsState, IEventTypes } from './reducer'
import { camelCase, keys } from 'lodash'
import { getDefaultLanguage } from '@client/i18n/utils'

const CUSTOM_FIELD_LABEL = 'Custom Field'
export const CUSTOM_GROUP_NAME = 'custom-view-group'

export type EventSectionGroup = {
  event: Event
  section: string
  group: string
}

export interface ICustomFieldAttribute {
  label: IMessage[]
  placeholder?: IMessage[]
  description?: IMessage[]
  tooltip?: IMessage[]
  errorMessage?: IMessage[]
  maxLength?: number
}

export type IConfigFormField = {
  fieldId: string
  precedingFieldId: string | null
  foregoingFieldId: string | null
  required: boolean
  enabled: string
  custom: boolean
  customizedFieldAttributes?: ICustomFieldAttribute
  definition: IFormField
}

type IFormFieldMap = Record<string, IConfigFormField>

export type ISectionFieldMap = Record<string, IFormFieldMap>

export function getContentKey(field: IConfigFormField) {
  return field.definition.label.id
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

function determineNextFieldIdNumber(
  state: IEventTypes,
  event: keyof IEventTypes,
  section: string
): number {
  const partialHandleBar = camelCase(CUSTOM_FIELD_LABEL)
  const customFieldNumber = keys(state[event][section])
    .filter((item) => item.includes(partialHandleBar))
    .map((item) => {
      const elemNumber = item.replace(
        `${event}.${section}.${CUSTOM_GROUP_NAME}.${partialHandleBar}`,
        ''
      )
      return parseInt(elemNumber)
    })
  return customFieldNumber.length ? Math.max(...customFieldNumber) + 1 : 1
}

export function generateKeyFromObj(obj: any) {
  return btoa(JSON.stringify(obj))
}

export function getEventSectionGroupFromFieldID(
  fieldID: string
): EventSectionGroup {
  const [event, section, group] = fieldID.split('.')
  return { event: event as Event, section, group }
}

export function prepareNewCustomFieldConfig(
  state: IEventTypes,
  event: keyof IEventTypes,
  section: string,
  customField: IConfigFormField
): IConfigFormField | undefined {
  const customFieldNumber = determineNextFieldIdNumber(state, event, section)
  const defaultMessage = `${CUSTOM_FIELD_LABEL} ${customFieldNumber}`
  const handlebars = camelCase(defaultMessage)
  const customFieldIndex = `${event}.${section}.${CUSTOM_GROUP_NAME}.${handlebars}`
  const defaultLanguage = getDefaultLanguage()
  const defaultLabel = {
    id: `${customField.definition.label.id}${customFieldNumber}`,
    defaultMessage
  }
  let customFieldConfig

  for (const index in state[event][section]) {
    if (null == state[event][section][index].foregoingFieldId) {
      state[event][section][index].foregoingFieldId = customFieldIndex

      customFieldConfig = {
        ...customField,
        precedingFieldId: state[event][section][index].fieldId,
        fieldId: customFieldIndex,
        customizedFieldAttributes: {
          label: [
            {
              lang: defaultLanguage,
              descriptor: defaultLabel
            }
          ]
        },
        definition: {
          ...customField.definition,
          name: customFieldIndex,
          label: defaultLabel,
          mapping: {
            template: [camelCase(defaultMessage), () => {}]
          }
        }
      }
    }
  }

  return customFieldConfig as IConfigFormField
}
