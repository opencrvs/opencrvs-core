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
import { Event, IQuestionConfig, ISerializedForm } from '@client/forms'
import {
  configureRegistrationForm,
  filterQuestionsByEventType,
  sortFormCustomisations
} from '@client/forms/configuration'
import * as actions from '@client/forms/configuration/configFields/actions'
import { registerForms } from '@client/forms/configuration/default'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { APPLICATION_CONFIG_LOADED } from '@client/offline/actions'
import { storage } from '@client/storage'
import { Cmd, loop, Loop, LoopReducer } from 'redux-loop'
import {
  getEventSectionFieldsMap,
  getEventSectionGroupFromFieldID,
  ISectionFieldMap
} from './utils'

export interface IEventTypes {
  birth: ISectionFieldMap
  death: ISectionFieldMap
}

export type IConfigFieldsState =
  | {
      state: 'LOADING'
      questions: IQuestionConfig[]
      birth: null
      death: null
    }
  | ({
      state: 'READY'
      questions: IQuestionConfig[]
    } & IEventTypes)

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

export const configFieldsReducer: LoopReducer<
  IConfigFieldsState,
  actions.ConfigFieldsActions
> = (
  state: IConfigFieldsState = initialState,
  action: actions.ConfigFieldsActions
):
  | IConfigFieldsState
  | Loop<IConfigFieldsState, actions.ConfigFieldsActions> => {
  switch (action.type) {
    case APPLICATION_CONFIG_LOADED:
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
    case actions.ADD_CUSTOM_FIELD:
      if (state.state === 'LOADING') {
        return state
      }
      const { event, section, customField } = action.payload
      const eventName = event as keyof IEventTypes

      return {
        ...state,
        [eventName]: {
          ...state[eventName],
          [section]: {
            ...state[eventName][section],
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
      if (action.payload.modifiedField.precedingFieldId) {
        newState[event][section][
          action.payload.modifiedField.precedingFieldId
        ].foregoingFieldId = action.payload.modifiedField.fieldId
      }

      if (action.payload.modifiedField.foregoingFieldId)
        newState[event][section][
          action.payload.modifiedField.foregoingFieldId
        ].precedingFieldId = action.payload.modifiedField.fieldId

      return {
        ...newState
      }
    }
    case actions.REMOVE_CUSTOM_FIELD: {
      const { selectedField } = action.payload
      const [selectedFieldEvent, selectedFieldSection] =
        selectedField.fieldId.split('.') as [keyof IEventTypes, string]

      const fields = (state as IEventTypes)[selectedFieldEvent][
        selectedFieldSection
      ]

      if (selectedField.precedingFieldId) {
        fields[selectedField.precedingFieldId].foregoingFieldId =
          selectedField.foregoingFieldId
      }
      if (selectedField.foregoingFieldId) {
        fields[selectedField.foregoingFieldId].precedingFieldId =
          selectedField.precedingFieldId
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
    default:
      return state
  }
}
