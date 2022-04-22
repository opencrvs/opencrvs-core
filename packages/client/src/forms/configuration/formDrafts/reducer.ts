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
import { find, isEmpty } from 'lodash'
import { formDraftQueries } from './queries'
import * as actions from './actions'
import { Event } from '@client/forms'

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
      formDraftData: null
      error: boolean
    }
  | {
      state: 'READY'
      formDraftData: IFormDraft
      error: boolean
    }

export const initialState: IFormDraftState = {
  state: 'LOADING',
  formDraftData: null,
  error: false
}

function getEventFormDraftData(formDrafts: IDraft[], event: Event) {
  const formDraft = find(formDrafts, { event })
  if (!formDraft) {
    throw new Error(`Default ${event} formDraft not found`)
  }
  return formDraft
}

export function getOfflineFormDraftData(formDrafts: IDraft[]) {
  const birthFormDraft = getEventFormDraftData(formDrafts, Event.BIRTH)
  const deathFormDraft = getEventFormDraftData(formDrafts, Event.DEATH)
  return {
    birth: birthFormDraft,
    death: deathFormDraft
  }
}

async function saveFormDraftData(formDraftData: IFormDraft) {
  return storage.setItem('formDraft', JSON.stringify(formDraftData))
}

export const formDraftReducer: LoopReducer<
  IFormDraftState,
  actions.FormDraftActions
> = (
  state: IFormDraftState = initialState,
  action: actions.FormDraftActions
): IFormDraftState | Loop<IFormDraftState, actions.FormDraftActions> => {
  switch (action.type) {
    case actions.LOAD_STORAGE_FORM_DRAFT:
      return loop(
        state,
        Cmd.run(storage.getItem, {
          args: ['formDraft'],
          successActionCreator: actions.loadStorageFormDraftSuccessAction
        })
      )

    case actions.LOAD_STORAGE_FORM_DRAFT_SUCCESS: {
      const offlineDataString = action.payload
      const offlineData: IFormDraft = JSON.parse(
        offlineDataString ? offlineDataString : '{}'
      )

      if (isEmpty(offlineData)) {
        return loop(state, Cmd.action(actions.fetchFormDraft()))
      }
      return loop(
        {
          ...state,
          state: 'READY',
          formDraftData: offlineData
        },
        navigator.onLine ? Cmd.action(actions.fetchFormDraft()) : Cmd.none
      )
    }

    case actions.FETCH_FORM_DRAFT:
      return loop(
        state,
        Cmd.run(formDraftQueries.fetchFormDraft, {
          successActionCreator: actions.fetchFormDraftSuccessAction,
          failActionCreator: actions.fetchFormDraftFailedAction
        })
      )

    case actions.FETCH_FORM_DRAFT_SUCCESS:
      const { formDrafts } = action.payload

      const birthFormDraft = find(formDrafts, {
        event: Event.BIRTH
      })

      const deathFormDraft = find(formDrafts, {
        event: Event.DEATH
      })

      if (!birthFormDraft) {
        throw new Error('Default birth formDraft not found')
      }

      if (!deathFormDraft) {
        throw new Error('Default death formDraft not found')
      }

      const formDraftData = {
        birth: birthFormDraft,
        death: deathFormDraft
      } as IFormDraft

      return loop(
        {
          ...state,
          state: 'READY',
          formDraftData: formDraftData
        },
        Cmd.run(saveFormDraftData, { args: [formDraftData] })
      )
    case actions.MODIFY_FORM_DRAFT:
      const { formDraft } = action.payload
      if (state.state === 'LOADING') {
        return state
      }
      return {
        ...state,
        formDraftData: {
          ...state.formDraftData,
          [formDraft.event]: formDraft
        }
      }
    case actions.FETCH_FORM_DRAFT_FAILED:
      return {
        ...state,
        error: true
      }
    default:
      return state
  }
}
