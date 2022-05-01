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
import { ICustomConfigField, IConfigField } from './utils'
import { Event } from '@client/forms'

export const ADD_CUSTOM_FIELD = 'FORM/ADD_CUSTOM_FIELD'
export type AddCustomFieldAction = {
  type: typeof ADD_CUSTOM_FIELD
  payload: {
    event: Event
    section: string
    customField: ICustomConfigField
  }
}
export const addCustomField = (
  event: Event,
  section: string,
  customField: ICustomConfigField
): AddCustomFieldAction => ({
  type: ADD_CUSTOM_FIELD,
  payload: {
    event,
    section,
    customField
  }
})

export const REMOVE_CUSTOM_FIELD = 'FORM/REMOVE_CUSTOM_FIELD'
export type RemoveCustomFieldAction = {
  type: typeof REMOVE_CUSTOM_FIELD
  payload: {
    fieldId: string
  }
}

export const removeCustomField = (
  fieldId: string
): RemoveCustomFieldAction => ({
  type: REMOVE_CUSTOM_FIELD,
  payload: {
    fieldId
  }
})

export const SHIFT_CONFIG_FIELD_UP = 'FORM/SHIFT_CONFIG_FIELD_UP'
export type ShiftConfigFieldUp = {
  type: typeof SHIFT_CONFIG_FIELD_UP
  payload: {
    fieldId: string
  }
}

export const shiftConfigFieldUp = (fieldId: string): ShiftConfigFieldUp => ({
  type: SHIFT_CONFIG_FIELD_UP,
  payload: {
    fieldId
  }
})

export const SHIFT_CONFIG_FIELD_DOWN = 'FORM/SHIFT_CONFIG_FIELD_DOWN'
export type ShiftConfigFieldDown = {
  type: typeof SHIFT_CONFIG_FIELD_DOWN
  payload: {
    fieldId: string
  }
}

export const shiftConfigFieldDown = (
  fieldId: string
): ShiftConfigFieldDown => ({
  type: SHIFT_CONFIG_FIELD_DOWN,
  payload: {
    fieldId
  }
})

export const MODIFY_CONFIG_FIELD = 'FORM/MODIFY_CONFIG_FIELD'
export type ModifyConfigFieldAction = {
  type: typeof MODIFY_CONFIG_FIELD
  payload: {
    fieldId: string
    modifiedProps: Partial<IConfigField>
  }
}

export const modifyConfigField = (
  fieldId: string,
  modifiedProps: Partial<IConfigField>
) => ({
  type: MODIFY_CONFIG_FIELD,
  payload: {
    fieldId,
    modifiedProps
  }
})

export type ConfigFieldsActions =
  | AddCustomFieldAction
  | ModifyConfigFieldAction
  | RemoveCustomFieldAction
  | ShiftConfigFieldUp
  | ShiftConfigFieldDown
