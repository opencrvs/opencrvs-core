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
import { find } from 'lodash'
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
