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
import * as actions from '@client/forms/configuration/configFields/actions'
import { storage } from '@client/storage'
import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import * as offlineActions from '@client/offline/actions'
import { Event } from '@client/forms'
import { getConfiguredForm, FieldPosition } from '@client/forms/configuration'
import { ISectionFieldMap, getSectionFieldsMap, IConfigFieldMap } from './utils'
import {
  shiftCurrentFieldDown,
  shiftCurrentFieldUp,
  getConfigFieldIdentifiers
} from './motionUtils'

export type IConfigFieldsState =
  | {
      state: 'LOADING'
      birth: null
      death: null
    }
  | {
      state: 'READY'
      birth: ISectionFieldMap
      death: ISectionFieldMap
    }

export const initialState: IConfigFieldsState = {
  state: 'LOADING',
  birth: null,
  death: null
}

async function saveConfigFields(configFields: IConfigFieldsState) {
  return storage.setItem('configFields', JSON.stringify(configFields))
}

async function loadConfigFields() {
  return storage.getItem('configFields')
}

async function clearConfigFields() {
  return storage.removeItem('configFields')
}

type Actions = actions.ConfigFieldsActions | offlineActions.Action

function getPreviousField(fieldMap: IConfigFieldMap, fieldId: string) {
  const currentField = fieldMap[fieldId]

  const { preceedingFieldId } = currentField

  return preceedingFieldId && preceedingFieldId !== FieldPosition.TOP
    ? fieldMap[preceedingFieldId]
    : undefined
}

function getNextField(fieldMap: IConfigFieldMap, fieldId: string) {
  const currentField = fieldMap[fieldId]

  const { foregoingFieldId } = currentField

  return foregoingFieldId !== FieldPosition.BOTTOM
    ? fieldMap[foregoingFieldId]
    : undefined
}

export const configFieldsReducer: LoopReducer<IConfigFieldsState, Actions> = (
  state: IConfigFieldsState = initialState,
  action: Actions
): IConfigFieldsState | Loop<IConfigFieldsState, Actions> => {
  switch (action.type) {
    case offlineActions.READY: {
      const { questionConfig } = action.payload.formConfig
      return loop(state, Cmd.action(actions.updateConfigFields(questionConfig)))
    }

    case actions.UPDATE_CONFIG_FIELDS: {
      const { questionConfig } = action.payload
      const birthForm = getConfiguredForm(questionConfig, Event.BIRTH)
      const deathForm = getConfiguredForm(questionConfig, Event.DEATH)

      const newState: IConfigFieldsState = {
        ...state,
        state: 'READY',
        birth: getSectionFieldsMap(Event.BIRTH, birthForm),
        death: getSectionFieldsMap(Event.DEATH, deathForm)
      }
      return loop(
        newState,
        Cmd.run<
          actions.GetStorageConfigFieldsFailedAction,
          actions.GetStorageConfigFieldsSuccessAction
        >(loadConfigFields, {
          successActionCreator: actions.getStorageConfigFieldsSuccess,
          failActionCreator: actions.getStorageConfigFieldsFailed
        })
      )
    }

    case actions.GET_STORAGE_CONFIG_FIELDS_SUCCESS:
      if (action.payload) {
        const configFieldsState: IConfigFieldsState = JSON.parse(action.payload)
        return { ...configFieldsState }
      }
      return loop(state, Cmd.action(actions.storeConfigFields()))

    case actions.STORE_CONFIG_FIELDS:
      return loop(
        state,
        Cmd.run<
          actions.StoreConfigFieldsFailedAction,
          actions.StoreConfigFieldsSuccessAction
        >(saveConfigFields, {
          successActionCreator: actions.storeConfigFieldsSuccess,
          failActionCreator: actions.storeConfigFieldsFailed,
          args: [state]
        })
      )

    /* TODO: Add action handler for GET_STORAGE_CONFIG_FIELDS_FAILED */

    case actions.STORE_CONFIG_FIELDS_SUCCESS:
      if (action.payload) {
        const configFieldsState: IConfigFieldsState = JSON.parse(action.payload)
        return {
          ...configFieldsState
        }
      }
      return state

    case actions.ADD_CUSTOM_FIELD: {
      if (state.state === 'LOADING') {
        return state
      }
      const { event, section, customField } = action.payload
      const fields = {
        ...state[event][section],
        [customField.fieldId]: customField
      }

      if (
        customField.preceedingFieldId &&
        customField.preceedingFieldId !== FieldPosition.TOP
      ) {
        fields[customField.preceedingFieldId] = {
          ...fields[customField.preceedingFieldId],
          foregoingFieldId: customField.fieldId
        }
      }

      return {
        ...state,
        [event]: {
          ...state[event],
          [section]: fields
        }
      }
    }

    case actions.MODIFY_CONFIG_FIELD: {
      if (state.state === 'LOADING') return state
      const { fieldId, modifiedProps } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)
      const { [fieldId]: originalField, ...fields } = state[event][sectionId]

      /* Adjusting preceedingFieldId & foregoingFieldId */
      if (modifiedProps.fieldId && fieldId !== modifiedProps.fieldId) {
        if (
          originalField.preceedingFieldId &&
          originalField.preceedingFieldId !== FieldPosition.TOP
        ) {
          fields[originalField.preceedingFieldId] = {
            ...fields[originalField.preceedingFieldId],
            foregoingFieldId: modifiedProps.fieldId
          }
        }

        if (originalField.foregoingFieldId !== FieldPosition.BOTTOM)
          fields[originalField.foregoingFieldId] = {
            ...fields[originalField.foregoingFieldId],
            preceedingFieldId: modifiedProps.fieldId
          }

        fields[modifiedProps.fieldId] = {
          ...originalField,
          ...modifiedProps
        }

        return {
          ...state,
          [event]: {
            ...state[event],
            [sectionId]: fields
          }
        }
      }

      fields[fieldId] = {
        ...originalField,
        ...modifiedProps
      }

      return {
        ...state,
        [event]: {
          ...state[event],
          [sectionId]: fields
        }
      }
    }

    case actions.REMOVE_CUSTOM_FIELD: {
      if (state.state === 'LOADING') return state
      const { fieldId } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)

      const { [fieldId]: fieldToRemove, ...fields } = state[event][sectionId]

      if (
        fieldToRemove.preceedingFieldId &&
        fieldToRemove.preceedingFieldId !== FieldPosition.TOP
      ) {
        fields[fieldToRemove.preceedingFieldId] = {
          ...fields[fieldToRemove.preceedingFieldId],
          foregoingFieldId: fieldToRemove.foregoingFieldId
        }
      }
      if (fieldToRemove.foregoingFieldId !== FieldPosition.BOTTOM) {
        fields[fieldToRemove.foregoingFieldId] = {
          ...fields[fieldToRemove.foregoingFieldId],
          preceedingFieldId: fieldToRemove.preceedingFieldId
        }
      }

      return {
        ...state,
        [event]: {
          ...state[event],
          [sectionId]: fields
        }
      }
    }

    case actions.UPDATE_QUESTION_CONFIG: {
      const { formDraft, questionConfig } = action.payload
      return loop(
        state,
        Cmd.list([
          Cmd.run(clearConfigFields),
          Cmd.action(actions.updateConfigFields(questionConfig)),
          Cmd.action(
            offlineActions.updateOfflineQuestionConfig(
              formDraft,
              questionConfig
            )
          )
        ])
      )
    }

    case actions.SHIFT_CONFIG_FIELD_UP: {
      if (state.state === 'LOADING') return state
      const { fieldId } = action.payload

      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)

      const fieldMap = state[event][sectionId]

      const currentField = fieldMap[fieldId]

      const newSection = shiftCurrentFieldUp(
        state[event][sectionId],
        currentField,
        getPreviousField(fieldMap, fieldId),
        getNextField(fieldMap, fieldId)
      )

      return loop(
        {
          ...state,
          [event]: {
            ...state[event],
            [sectionId]: newSection
          }
        },
        Cmd.action(actions.storeConfigFields())
      )
    }

    case actions.SHIFT_CONFIG_FIELD_DOWN: {
      if (state.state === 'LOADING') return state
      const { fieldId } = action.payload

      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)

      const fieldMap = state[event][sectionId]

      const currentField = fieldMap[fieldId]

      const newSection = shiftCurrentFieldDown(
        state[event][sectionId],
        currentField,
        getPreviousField(fieldMap, fieldId),
        getNextField(fieldMap, fieldId)
      )

      return loop(
        {
          ...state,
          [event]: {
            ...state[event],
            [sectionId]: newSection
          }
        },
        Cmd.action(actions.storeConfigFields())
      )
    }

    default:
      return state
  }
}
