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
import { IFormConfig, IFormDataSet } from '@client/forms'
import { Event } from '@client/utils/gateway'
import * as actions from '@client/forms/configuration/formConfig/actions'
import {
  getEventDraft,
  IFormDraft,
  DEFAULT_FORM_DRAFT
} from '@client/forms/configuration/formDrafts/utils'
import * as offlineActions from '@client/offline/actions'
import { Cmd, Loop, loop, LoopReducer } from 'redux-loop'
import {
  generateConfigFields,
  ISectionFieldMap,
  prepareNewCustomFieldConfig
} from './utils'
import { populateRegisterFormsWithAddresses } from '@client/forms/configuration/administrative/addresses'
import { registerForms } from '@client/forms/configuration/default'
import { getIdentifiersFromFieldId } from '@client/forms/questionConfig'
import { IDataSourceSelectOption } from '@client/forms/configuration/formConfig/utils'

export type IFormConfigState =
  | {
      state: 'LOADING'
      birth: null
      death: null
      formDataset: null
    }
  | {
      state: 'READY'
      birth: {
        formDraft: IFormDraft
        configFields: ISectionFieldMap
      }
      death: {
        formDraft: IFormDraft
        configFields: ISectionFieldMap
      }
      formDataset: IFormDataSet[]
    }

export const initialState: IFormConfigState = {
  state: 'LOADING',
  birth: null,
  death: null,
  formDataset: null
}

type Actions = actions.ConfigFieldsActions | offlineActions.Action

function getReadyState(formConfig: IFormConfig) {
  const { formDrafts, questionConfig, formDataset = [] } = formConfig

  const defaultBirthForm = populateRegisterFormsWithAddresses(
    registerForms[Event.Birth],
    Event.Birth
  )

  const defaultDeathForm = populateRegisterFormsWithAddresses(
    registerForms[Event.Death],
    Event.Death
  )

  return {
    state: 'READY' as const,
    birth: {
      formDraft:
        getEventDraft(formDrafts, Event.Birth) ||
        DEFAULT_FORM_DRAFT[Event.Birth],
      configFields: generateConfigFields(
        Event.Birth,
        defaultBirthForm,
        questionConfig,
        formDataset
      )
    },
    death: {
      formDraft:
        getEventDraft(formDrafts, Event.Death) ||
        DEFAULT_FORM_DRAFT[Event.Death],
      configFields: generateConfigFields(
        Event.Death,
        defaultDeathForm,
        questionConfig,
        formDataset
      )
    },
    formDataset
  }
}

export const formConfigReducer: LoopReducer<IFormConfigState, Actions> = (
  state: IFormConfigState = initialState,
  action: Actions
): IFormConfigState | Loop<IFormConfigState, Actions> => {
  /* First loading when offline formConfig is ready*/
  if (state.state === 'LOADING') {
    if (action.type === offlineActions.READY) {
      return getReadyState(action.payload.formConfig)
    }
    return state
  }

  switch (action.type) {
    case offlineActions.APPLICATION_CONFIG_LOADED:
    case offlineActions.OFFLINE_FORM_CONFIG_UPDATED: {
      return getReadyState(action.payload.formConfig)
    }

    case offlineActions.OFFLINE_FORM_CONFIG_ADD_FORM_DATASET: {
      return {
        ...state,
        formDataset: [...state.formDataset, action.payload.formDatasetItem]
      }
    }

    case actions.ADD_CUSTOM_FIELD: {
      const { event, section, fieldType } = action.payload
      const fields = state[event].configFields[section]
      const customField = prepareNewCustomFieldConfig(
        fields,
        event,
        section,
        fieldType
      )

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [section]: [...fields, customField]
          }
        }
      }
    }

    case actions.MODIFY_CONFIG_FIELD: {
      const { fieldId, modifiedProps } = action.payload
      const { event, sectionId } = getIdentifiersFromFieldId(fieldId)
      const fields = state[event].configFields[sectionId]
      const fieldIndex = fields.findIndex(
        (configField) => configField.fieldId === fieldId
      )
      if (fieldIndex < 0) return state

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [sectionId]: fields.map((configField, index) => {
              if (index === fieldIndex) {
                return {
                  ...configField,
                  ...modifiedProps
                }
              }
              return configField
            })
          }
        }
      }
    }

    case actions.REMOVE_CUSTOM_FIELD: {
      const { fieldId } = action.payload
      const { event, sectionId } = getIdentifiersFromFieldId(fieldId)

      const fields = state[event].configFields[sectionId]
      const fieldIndex = fields.findIndex(
        (configField) => configField.fieldId === fieldId
      )
      if (fieldIndex < 0) return state

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [sectionId]: fields.filter(
              (configField) => configField.fieldId !== fieldId
            )
          }
        }
      }
    }

    case actions.SHIFT_CONFIG_FIELD_UP: {
      const { fieldId } = action.payload
      const { event, sectionId } = getIdentifiersFromFieldId(fieldId)
      const fields = state[event].configFields[sectionId]

      const fieldIndex = fields.findIndex(
        (configField) => configField.fieldId === fieldId
      )

      /* Field not found or already at the top */
      if (fieldIndex <= 0) return state

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [sectionId]: [
              ...fields.slice(0, fieldIndex - 1),
              fields[fieldIndex],
              fields[fieldIndex - 1],
              ...fields.slice(fieldIndex + 1)
            ]
          }
        }
      }
    }

    case actions.SHIFT_CONFIG_FIELD_DOWN: {
      const { fieldId } = action.payload
      const { event, sectionId } = getIdentifiersFromFieldId(fieldId)
      const fields = state[event].configFields[sectionId]

      const fieldIndex = fields.findIndex(
        (configField) => configField.fieldId === fieldId
      )

      /* Field not found or already at the bottom */
      if (fieldIndex < 0 || fieldIndex === fields.length - 1) return state

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [sectionId]: [
              ...fields.slice(0, fieldIndex),
              fields[fieldIndex + 1],
              fields[fieldIndex],
              ...fields.slice(fieldIndex + 2)
            ]
          }
        }
      }
    }

    case actions.UPDATE_FORM_CONFIG: {
      const { formDraft, questionConfig } = action.payload

      const { event } = formDraft

      const newState = {
        ...state,
        [event]: {
          ...state[event],
          formDraft
        }
      }

      const {
        birth: { formDraft: birthFormDraft },
        death: { formDraft: deathFormDraft }
      } = newState

      return loop(
        newState,
        Cmd.action(
          offlineActions.updateOfflineFormConfig(
            [birthFormDraft, deathFormDraft],
            questionConfig,
            newState.formDataset
          )
        )
      )
    }

    default:
      return state
  }
}
