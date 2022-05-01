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
import { IDraft } from './reducer'
import { IQuestionConfig } from '@client/forms'

export const UPDATE_FORM_CONFIG = 'FORM/UPDATE_FORM_CONFIG'
export type UpdateFormConfigAction = {
  type: typeof UPDATE_FORM_CONFIG
  payload: {
    formDraft: IDraft
    questionConfig?: IQuestionConfig[]
  }
}

export const updateFormConfig = (
  formDraft: IDraft,
  questionConfig?: IQuestionConfig[]
): UpdateFormConfigAction => ({
  type: UPDATE_FORM_CONFIG,
  payload: {
    formDraft,
    questionConfig
  }
})

export type FormDraftActions = UpdateFormConfigAction
