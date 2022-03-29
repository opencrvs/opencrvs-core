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

export enum Event {
  BIRTH = 'birth',
  DEATH = 'death'
}

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
  loaded: boolean
  loadingError: boolean
}

export const initialState: IFormDraftDataState = {
  formDraftData: null,
  formDraftDataLoaded: false,
  loaded: false,
  loadingError: false
}

async function saveFormDraftData(formDraftData: IFormDraftData) {
  return storage.setItem('formDraft', JSON.stringify(formDraftData))
}

export const formDraftReducer: LoopReducer<
  IFormDraftDataState,
  actions.FormDraftAction
> = (
  state: IFormDraftDataState = initialState,
  action: actions.FormDraftAction
): IFormDraftDataState | Loop<IFormDraftDataState, actions.FormDraftAction> => {
  switch (action.type) {
    case actions.LOAD_DRAFT:
      return loop(
        state,
        Cmd.run(() => formDraftQueries.getFormDraft, {
          successActionCreator: actions.storeDraft
        })
      )

    case actions.STORE_DRAFT:
      const { queryData: formDraftQueryData } = action.payload

      const birthFormDraft = find(formDraftQueryData.data, {
        event: 'birth'
      }) as IDraft

      const deathFormDraft = find(formDraftQueryData.data, {
        event: 'death'
      }) as IDraft

      const formDraftData = {
        birth: birthFormDraft,
        death: deathFormDraft,
        loaded: true
      } as IFormDraftData

      return loop(
        {
          ...state,
          formDraftData
        },
        Cmd.run(saveFormDraftData, { args: [state.formDraftData] })
      )

    default:
      return state
  }
}
