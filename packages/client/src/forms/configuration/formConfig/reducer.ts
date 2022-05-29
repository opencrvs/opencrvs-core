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
import { IFormConfig } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { FieldPosition } from '@client/forms/configuration'
import * as actions from '@client/forms/configuration/formConfig/actions'
import {
  getEventDraft,
  IFormDraft,
  DEFAULT_FORM_DRAFT
} from '@client/forms/configuration/formDrafts/utils'
import * as offlineActions from '@client/offline/actions'
import { Cmd, Loop, loop, LoopReducer } from 'redux-loop'
import {
  shiftCurrentFieldUp,
  shiftCurrentFieldDown,
  generateConfigFields,
  IConfigFieldMap,
  ISectionFieldMap,
  getConfigFieldIdentifiers
} from './utils'
import { populateRegisterFormsWithAddresses } from '@client/forms/configuration/administrative/addresses'
import { registerForms } from '@client/forms/configuration/default'

export type IFormConfigState =
  | {
      state: 'LOADING'
      birth: null
      death: null
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
    }

export const initialState: IFormConfigState = {
  state: 'LOADING',
  birth: null,
  death: null
}

type Actions = actions.ConfigFieldsActions | offlineActions.Action

function getPreviousField(fieldMap: IConfigFieldMap, fieldId: string) {
  const currentField = fieldMap[fieldId]

  const { precedingFieldId } = currentField

  return precedingFieldId !== FieldPosition.TOP
    ? fieldMap[precedingFieldId]
    : undefined
}

function getNextField(fieldMap: IConfigFieldMap, fieldId: string) {
  const currentField = fieldMap[fieldId]

  const { foregoingFieldId } = currentField

  return foregoingFieldId !== FieldPosition.BOTTOM
    ? fieldMap[foregoingFieldId]
    : undefined
}

function getReadyState(formConfig: IFormConfig) {
  const { formDrafts, questionConfig } = formConfig

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
        questionConfig.filter((question) =>
          question.fieldId.includes(Event.Birth)
        )
      )
    },
    death: {
      formDraft:
        getEventDraft(formDrafts, Event.Death) ||
        DEFAULT_FORM_DRAFT[Event.Death],
      configFields: generateConfigFields(
        Event.Death,
        defaultDeathForm,
        questionConfig.filter((question) =>
          question.fieldId.includes(Event.Death)
        )
      )
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
      return getReadyState(action.payload.formConfig)
    }
    return state
  }

  switch (action.type) {
    case offlineActions.APPLICATION_CONFIG_LOADED:
    case offlineActions.OFFLINE_FORM_CONFIG_UPDATED: {
      return getReadyState(action.payload.formConfig)
    }

    case actions.ADD_CUSTOM_FIELD: {
      const { event, section, customField } = action.payload
      const fields = {
        ...state[event].configFields[section],
        [customField.fieldId]: customField
      }

      if (customField.precedingFieldId !== FieldPosition.TOP) {
        fields[customField.precedingFieldId] = {
          ...fields[customField.precedingFieldId],
          foregoingFieldId: customField.fieldId
        }
      }

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [section]: fields
          }
        }
      }
    }

    case actions.MODIFY_CONFIG_FIELD: {
      const { fieldId, modifiedProps } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)
      const { [fieldId]: originalField, ...fields } =
        state[event].configFields[sectionId]

      /* Adjusting precedingFieldId & foregoingFieldId */
      if (modifiedProps.fieldId && fieldId !== modifiedProps.fieldId) {
        if (originalField.precedingFieldId !== FieldPosition.TOP) {
          fields[originalField.precedingFieldId] = {
            ...fields[originalField.precedingFieldId],
            foregoingFieldId: modifiedProps.fieldId
          }
        }

        if (originalField.foregoingFieldId !== FieldPosition.BOTTOM)
          fields[originalField.foregoingFieldId] = {
            ...fields[originalField.foregoingFieldId],
            precedingFieldId: modifiedProps.fieldId
          }

        fields[modifiedProps.fieldId] = {
          ...originalField,
          ...modifiedProps
        }

        return {
          ...state,
          [event]: {
            ...state[event],
            configFields: {
              ...state[event].configFields,
              [sectionId]: fields
            }
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
          configFields: {
            ...state[event].configFields,
            [sectionId]: fields
          }
        }
      }
    }

    case actions.REMOVE_CUSTOM_FIELD: {
      const { fieldId } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)

      const { [fieldId]: fieldToRemove, ...fields } =
        state[event].configFields[sectionId]

      if (fieldToRemove.precedingFieldId !== FieldPosition.TOP) {
        fields[fieldToRemove.precedingFieldId] = {
          ...fields[fieldToRemove.precedingFieldId],
          foregoingFieldId: fieldToRemove.foregoingFieldId
        }
      }
      if (fieldToRemove.foregoingFieldId !== FieldPosition.BOTTOM) {
        fields[fieldToRemove.foregoingFieldId] = {
          ...fields[fieldToRemove.foregoingFieldId],
          precedingFieldId: fieldToRemove.precedingFieldId
        }
      }

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [sectionId]: fields
          }
        }
      }
    }

    case actions.SHIFT_CONFIG_FIELD_UP: {
      const { fieldId } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)
      const fields = state[event].configFields[sectionId]

      const currentField = fields[fieldId]
      const previousField = getPreviousField(fields, fieldId)
      const nextField = getNextField(fields, fieldId)

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [sectionId]: shiftCurrentFieldUp(
              fields,
              currentField,
              previousField,
              nextField
            )
          }
        }
      }
    }

    case actions.SHIFT_CONFIG_FIELD_DOWN: {
      const { fieldId } = action.payload
      const { event, sectionId } = getConfigFieldIdentifiers(fieldId)
      const fields = state[event].configFields[sectionId]

      const currentField = fields[fieldId]
      const previousField = getPreviousField(fields, fieldId)
      const nextField = getNextField(fields, fieldId)

      return {
        ...state,
        [event]: {
          ...state[event],
          configFields: {
            ...state[event].configFields,
            [sectionId]: shiftCurrentFieldDown(
              fields,
              currentField,
              previousField,
              nextField
            )
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
            questionConfig
          )
        )
      )
    }

    default:
      return state
  }
}
