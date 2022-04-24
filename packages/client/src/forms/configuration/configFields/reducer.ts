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
import { Event, ISerializedForm, IQuestionConfig } from '@client/forms'
import {
  configureRegistrationForm,
  sortFormCustomisations,
  filterQuestionsByEventType
} from '@client/forms/configuration'
import { registerForms } from '@client/forms/configuration/default'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { ISectionFieldMap, getEventSectionFieldsMap } from './utils'

export type IConfigFieldsState =
  | {
      state: 'LOADING'
      questions: IQuestionConfig[]
      birth: null
      death: null
    }
  | {
      state: 'READY'
      questions: IQuestionConfig[]
      birth: ISectionFieldMap
      death: ISectionFieldMap
    }

export const initialState: IConfigFieldsState = {
  state: 'LOADING',
  questions: [],
  birth: null,
  death: null
}

async function saveConfigFields(configFields: IConfigFieldsState) {
  return storage.setItem('configFields', JSON.stringify(configFields))
}

async function loadConfigFields() {
  return storage.getItem('configFields')
}

type Actions = actions.ConfigFieldsActions | offlineActions.Action

export const configFieldsReducer: LoopReducer<IConfigFieldsState, Actions> = (
  state: IConfigFieldsState = initialState,
  action: Actions
): IConfigFieldsState | Loop<IConfigFieldsState, Actions> => {
  switch (action.type) {
    case offlineActions.READY:
      return loop(
        {
          ...state,
          questions: action.payload.formConfig.questionConfig
        },
        Cmd.run<
          actions.GetStorageConfigFieldsFailedAction,
          actions.GetStorageConfigFieldsSuccessAction
        >(loadConfigFields, {
          successActionCreator: actions.getStorageConfigFieldsSuccess,
          failActionCreator: actions.getStorageConfigFieldsFailed
        })
      )
    case actions.GET_STORAGE_CONFIG_FIELDS_SUCCESS:
      if (action.payload) {
        const configFieldsState: IConfigFieldsState = JSON.parse(action.payload)
        return { ...configFieldsState }
      }
      const configuredBirthForm: ISerializedForm = configureRegistrationForm(
        sortFormCustomisations(
          filterQuestionsByEventType(state.questions, Event.BIRTH),
          registerForms.birth
        ),
        registerForms.birth
      )

      const configuredDeathForm: ISerializedForm = configureRegistrationForm(
        sortFormCustomisations(
          filterQuestionsByEventType(state.questions, Event.DEATH),
          registerForms.death
        ),
        registerForms.death
      )

      const birthForm = deserializeForm(configuredBirthForm)
      const deathForm = deserializeForm(configuredDeathForm)

      const newState: IConfigFieldsState = {
        ...state,
        state: 'READY',
        birth: getEventSectionFieldsMap(birthForm, Event.BIRTH),
        death: getEventSectionFieldsMap(deathForm, Event.DEATH)
      }

      return loop(newState, Cmd.action(actions.storeConfigFields(newState)))

    case actions.STORE_CONFIG_FIELDS:
      return loop(
        state,
        Cmd.run<
          actions.StoreConfigFieldsFailedAction,
          actions.StoreConfigFieldsSuccessAction
        >(saveConfigFields, {
          successActionCreator: actions.storeConfigFieldsSuccess,
          failActionCreator: actions.storeConfigFieldsFailed,
          args: [action.payload]
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
    default:
      return state
  }
}
