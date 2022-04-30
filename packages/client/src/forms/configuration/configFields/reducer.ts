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
import { Event } from '@client/forms'
import * as actions from '@client/forms/configuration/configFields/actions'
import { storage } from '@client/storage'
import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import {
  getSectionFieldsMap,
  getEventSectionGroupFromFieldID,
  ISectionFieldMap
} from './utils'
import * as offlineActions from '@client/offline/actions'
import { getConfiguredForm } from '@client/forms/configuration'

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

    case actions.ADD_CUSTOM_FIELD:
      if (state.state === 'LOADING') {
        return state
      }
      const { event, section, customField } = action.payload

      return {
        ...state,
        [event]: {
          ...state[event],
          [section]: {
            ...state[event][section],
            [customField.fieldId]: customField
          }
        }
      }
    case actions.MODIFY_CUSTOM_FIELD: {
      if (state.state === 'LOADING') {
        return state
      }
      const { event, section } = getEventSectionGroupFromFieldID(
        action.payload.originalField.fieldId
      )

      const newState = { ...state }
      delete newState[event][section][action.payload.originalField.fieldId]
      newState[event][section][action.payload.modifiedField.fieldId] =
        action.payload.modifiedField

      // Adjusting precedingFieldId & foregoingFieldId
      if (action.payload.modifiedField.preceedingFieldId) {
        newState[event][section][
          action.payload.modifiedField.preceedingFieldId
        ].foregoingFieldId = action.payload.modifiedField.fieldId
      }

      if (action.payload.modifiedField.foregoingFieldId)
        newState[event][section][
          action.payload.modifiedField.foregoingFieldId
        ].preceedingFieldId = action.payload.modifiedField.fieldId

      return {
        ...newState
      }
    }

    case actions.REMOVE_CUSTOM_FIELD: {
      if (state.state === 'LOADING') return state
      const { selectedField } = action.payload
      const [selectedFieldEvent, selectedFieldSection] =
        selectedField.fieldId.split('.') as [Event, string]

      const fields = state[selectedFieldEvent][selectedFieldSection]

      if (selectedField.preceedingFieldId) {
        fields[selectedField.preceedingFieldId].foregoingFieldId =
          selectedField.foregoingFieldId
      }
      if (selectedField.foregoingFieldId) {
        fields[selectedField.foregoingFieldId].preceedingFieldId =
          selectedField.preceedingFieldId
      }

      delete fields[selectedField.fieldId]

      return {
        ...state,
        [selectedFieldEvent]: {
          ...state[selectedFieldEvent],
          [selectedFieldSection]: fields
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

    default:
      return state
  }
}
