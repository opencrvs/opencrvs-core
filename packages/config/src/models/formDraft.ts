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
import { Document, model, Schema } from 'mongoose'
import { Event } from '@config/models/certificate'

export enum DraftStatus {
  DRAFT = 'DRAFT',
  IN_PREVIEW = 'IN_PREVIEW',
  PUBLISHED = 'PUBLISHED'
}

export const validStatus = Object.values(DraftStatus)
export const validEvent = Object.values(Event)

export interface IHistory {
  version: number
  status: DraftStatus
  comment: string
  updatedAt: number
}

export interface IFormDraft {
  event: Event
  status: DraftStatus
  comment: string
  version: number
  history: IHistory[]
  updatedAt: number
  createdAt: number
}

export interface IFormDraftModel extends IFormDraft, Document {}

const historySchema = new Schema<IHistory>({
  version: { type: Number, required: true },
  status: {
    type: String,
    enum: validStatus,
    default: DraftStatus.DRAFT,
    required: true
  },
  comment: { type: String, required: true },
  updatedAt: { type: Number, required: true }
})

const formDraftSchema = new Schema({
  event: {
    type: String,
    enum: validEvent,
    required: true
  },
  status: {
    type: String,
    enum: validStatus,
    default: DraftStatus.DRAFT,
    required: true
  },
  comment: { type: String, required: true },
  version: { type: Number, required: true },
  history: [
    {
      type: historySchema,
      required: true
    }
  ],
  updatedAt: { type: Number, default: Date.now, required: true },
  createdAt: { type: Number, default: Date.now, required: true }
})

export default model<IFormDraftModel>('FormDraft', formDraftSchema)
