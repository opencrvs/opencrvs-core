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
import { LoopReducer, Loop } from 'redux-loop'
import {
  IForm,
  BirthSection,
  DeathSection,
  ISerializedForm
} from '@client/forms'
import * as offlineActions from '@client/offline/actions'
import { deserializeForm } from '@client/forms/mappings/deserializer'
import { registerForms } from '@client/forms/configuration/default'
import { messages } from '@client/i18n/messages/views/review'
import {
  configureRegistrationForm,
  filterQuestionsByEventType,
  sortFormCustomisations
} from '@client/forms/configuration'

export type IRegisterFormState =
  | {
      state: 'LOADING'
      registerForm: null
    }
  | {
      state: 'READY'
      registerForm: {
        birth: IForm
        death: IForm
      }
    }

export const initialState: IRegisterFormState = {
  state: 'LOADING',
  registerForm: null
}

const GET_REGISTER_FORM = 'REGISTER_FORM/GET_REGISTER_FORM'
type GetRegisterFormAction = {
  type: typeof GET_REGISTER_FORM
}
type Action = GetRegisterFormAction

export const registerFormReducer: LoopReducer<IRegisterFormState, Action> = (
  state: IRegisterFormState = initialState,
  action: Action | offlineActions.Action
): IRegisterFormState | Loop<IRegisterFormState, Action> => {
  switch (action.type) {
    case offlineActions.READY:
    case offlineActions.CONTENT_LOADED:
      const configuredBirthForm: ISerializedForm = configureRegistrationForm(
        sortFormCustomisations(
          filterQuestionsByEventType(
            action.payload.formConfig.questionConfig,
            'birth'
          ),
          registerForms.birth
        ),
        registerForms.birth
      )
      const configuredDeathForm: ISerializedForm = configureRegistrationForm(
        sortFormCustomisations(
          filterQuestionsByEventType(
            action.payload.formConfig.questionConfig,
            'death'
          ),
          registerForms.death
        ),
        registerForms.death
      )
      const birth = deserializeForm(configuredBirthForm)
      const death = deserializeForm(configuredDeathForm)

      const preview = {
        viewType: 'preview' as const,
        name: messages.previewName,
        title: messages.previewTitle,
        groups: [
          {
            id: 'preview-view-group',
            fields: []
          }
        ]
      }

      return {
        ...state,
        state: 'READY',
        registerForm: {
          birth: {
            ...birth,
            sections: [
              ...birth.sections,
              { ...preview, id: BirthSection.Preview }
            ]
          },
          death: {
            ...death,
            sections: [
              ...death.sections,
              { ...preview, id: DeathSection.Preview }
            ]
          }
        }
      }
    default:
      return state
  }
}
