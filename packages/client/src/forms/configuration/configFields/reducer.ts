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
import { Loop, LoopReducer } from 'redux-loop'
import * as offlineActions from '@client/offline/actions'
import { Event, IQuestionConfig, IForm } from '@client/forms'
import { getConfiguredForm, FieldPosition } from '@client/forms/configuration'
import { ISectionFieldMap, getSectionFieldsMap, IConfigFieldMap } from './utils'
import {
  shiftCurrentFieldDown,
  shiftCurrentFieldUp,
  getConfigFieldIdentifiers
} from './motionUtils'

export type IFormConfigState =
  | {
      state: 'LOADING'
      birth: null
      death: null
    }
  | {
      state: 'READY'
      birth: {
        registerForm: IForm
        configFields: ISectionFieldMap
      }
      death: {
        registerForm: IForm
        configFields: ISectionFieldMap
      }
    }

export const initialState: IFormConfigState = {
  state: 'LOADING',
  birth: null,
  death: null
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

function getReadyState(questionConfig: IQuestionConfig[]) {
  const birthForm = getConfiguredForm(questionConfig, Event.BIRTH)
  const deathForm = getConfiguredForm(questionConfig, Event.DEATH)

  return {
    state: 'READY' as const,
    birth: {
      registerForm: birthForm,
      configFields: getSectionFieldsMap(Event.BIRTH, birthForm)
    },
    death: {
      registerForm: deathForm,
      configFields: getSectionFieldsMap(Event.DEATH, deathForm)
    }
  }
}

export const formConfigReducer: LoopReducer<IFormConfigState, Actions> = (
  state: IFormConfigState = initialState,
  action: Actions
): IFormConfigState | Loop<IFormConfigState, Actions> => {
  /* First loading when offline formConfig is ready*/
  if (state.state === 'LOADING') {
    if (action.type === offlineActions.READY) {
      return getReadyState(action.payload.formConfig.questionConfig)
    }
    return state
  }

  switch (action.type) {
    case offlineActions.APPLICATION_CONFIG_LOADED:
    case offlineActions.OFFLINE_FORM_CONFIG_UPDATED: {
      const { questionConfig } = action.payload.formConfig

      return getReadyState(questionConfig)
    }

    case actions.ADD_CUSTOM_FIELD: {
      const { event, section, customField } = action.payload
      const fields = {
        ...state[event].configFields[section],
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
      const { fieldId, modifiedProps } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)
      const { [fieldId]: originalField, ...fields } =
        state[event].configFields[sectionId]

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
      const { fieldId } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)

      const { [fieldId]: fieldToRemove, ...fields } =
        state[event].configFields[sectionId]

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

    case actions.SHIFT_CONFIG_FIELD_UP: {
      const { fieldId } = action.payload

      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)

      const fieldMap = state[event].configFields[sectionId]

      const currentField = fieldMap[fieldId]

      const newSection = shiftCurrentFieldUp(
        state[event].configFields[sectionId],
        currentField,
        getPreviousField(fieldMap, fieldId),
        getNextField(fieldMap, fieldId)
      )

      return {
        ...state,
        [event]: {
          ...state[event],
          [sectionId]: newSection
        }
      }
    }

    case actions.SHIFT_CONFIG_FIELD_DOWN: {
      const { fieldId } = action.payload

      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)

      const fieldMap = state[event].configFields[sectionId]

      const currentField = fieldMap[fieldId]

      const newSection = shiftCurrentFieldDown(
        state[event].configFields[sectionId],
        currentField,
        getPreviousField(fieldMap, fieldId),
        getNextField(fieldMap, fieldId)
      )

      return {
        ...state,
        [event]: {
          ...state[event],
          [sectionId]: newSection
        }
      }
    }

    default:
      return state
  }
}
