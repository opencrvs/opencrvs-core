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
import { IForm, BirthSection, DeathSection } from '@register/forms'
import * as offlineActions from '@register/offline/actions'
import { deserializeForm } from '@register/forms/mappings/deserializer'

import { messages } from '@register/i18n/messages/views/review'

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
      const birth = deserializeForm(action.payload.forms.registerForm.birth)
      const death = deserializeForm(action.payload.forms.registerForm.death)

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
