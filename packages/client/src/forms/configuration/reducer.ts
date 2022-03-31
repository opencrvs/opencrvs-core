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
import { find } from 'lodash'
import { formDraftQueries } from './queries'
import * as actions from '@client/forms/configuration/actions'
import { Event } from '@client/forms/index'

export enum DraftStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  FINALISED = 'FINALISED'
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

export interface IFormDraftData {
  birth: IDraft
  death: IDraft
}

export type IFormDraftDataState = {
  formDraftData: IFormDraftData | null
  formDraftDataLoaded: boolean
  loadingError: boolean
}

export const initialState: IFormDraftDataState = {
  formDraftData: null,
  formDraftDataLoaded: false,
  loadingError: false
}

async function saveFormDraftData(formDraftData: IFormDraftData) {
  return storage.setItem('formDraft', JSON.stringify(formDraftData))
}

export const formDraftReducer: LoopReducer<
  IFormDraftDataState,
  actions.FormDraftActions
> = (
  state: IFormDraftDataState = initialState,
  action: actions.FormDraftActions
):
  | IFormDraftDataState
  | Loop<IFormDraftDataState, actions.FormDraftActions> => {
  switch (action.type) {
    case actions.LOAD_DRAFT:
      return loop(
        state,
        Cmd.run(formDraftQueries.fetchFormDraft, {
          successActionCreator: actions.storeDraft,
          failActionCreator: actions.failedDraft
        })
      )

    case actions.STORE_DRAFT:
      const { queryData: formDraftQueryData } = action.payload

      const birthFormDraft = find(formDraftQueryData.data.getFormDraft, {
        event: 'birth'
      })

      const deathFormDraft = find(formDraftQueryData.data.getFormDraft, {
        event: 'death'
      })

      const formDraftData = {
        birth: birthFormDraft,
        death: deathFormDraft
      } as IFormDraftData

      return loop(
        {
          ...state,
          formDraftData: formDraftData,
          formDraftDataLoaded: true
        },
        Cmd.run(saveFormDraftData, { args: [state.formDraftData] })
      )
    case actions.FAILED_DRAFT:
      return {
        ...state,
        loadingError: true
      }
    default:
      return state
  }
}
