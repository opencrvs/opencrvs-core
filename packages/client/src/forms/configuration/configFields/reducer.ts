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
import { loop, Cmd, Loop, LoopReducer } from 'redux-loop'
import { storage } from '@client/storage'
import * as actions from '@client/forms/configuration/configFields/actions'
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

    case actions.STORE_CONFIG_FIELDS_SUCCESS:
      if (action.payload) {
        const configFieldsState: IConfigFieldsState = JSON.parse(action.payload)
        return {
          ...configFieldsState
        }
      }
      return state

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
