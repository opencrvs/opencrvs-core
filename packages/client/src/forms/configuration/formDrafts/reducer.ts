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
import { Loop, LoopReducer, loop, Cmd } from 'redux-loop'
import * as actions from './actions'
import * as offlineActions from '@client/offline/actions'
import { Event } from '@client/forms'
import { getFormDraft } from './utils'

export enum DraftStatus {
  DRAFT = 'DRAFT',
  PREVIEW = 'PREVIEW',
  PUBLISHED = 'PUBLISHED',
  DELETED = 'DELETED'
}

export interface IHistory {
  version: number
  status: DraftStatus
  comment?: string
  lastUpdateAt: number
}

export interface IDraft {
  event: Event
  status: DraftStatus
  comment?: string
  version: number
  history?: IHistory[]
  updatedAt: number
  createdAt: number
}

export interface IFormDraft {
  birth: IDraft
  death: IDraft
}

export type IFormDraftState =
  | {
      state: 'LOADING'
      formDraft: null
    }
  | {
      state: 'READY'
      formDraft: IFormDraft
    }

export const initialState: IFormDraftState = {
  state: 'LOADING',
  formDraft: null
}

function getOfflineFormDrafts(formDraft: IFormDraft) {
  return [formDraft.birth, formDraft.death]
}

type Actions = actions.FormDraftActions | offlineActions.Action

export const formDraftReducer: LoopReducer<IFormDraftState, Actions> = (
  state: IFormDraftState = initialState,
  action: Actions
): IFormDraftState | Loop<IFormDraftState, Actions> => {
  switch (action.type) {
    case offlineActions.UPDATED:
    case offlineActions.READY:
      const {
        formConfig: { formDrafts }
      } = action.payload
      return {
        state: 'READY',
        formDraft: getFormDraft(formDrafts)
      }
    case actions.MODIFY_FORM_DRAFT:
      if (state.state === 'LOADING') {
        return state
      }
      const { formDraft } = action.payload
      const newFormDraft = {
        ...state.formDraft,
        [formDraft.event]: formDraft
      }
      return loop(
        {
          ...state,
          formDraft: newFormDraft
        },
        Cmd.action(
          offlineActions.updateOfflineFormDraft(
            getOfflineFormDrafts(newFormDraft)
          )
        )
      )
    default:
      return state
  }
}
