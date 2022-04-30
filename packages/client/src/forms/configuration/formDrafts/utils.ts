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
import { IDraft } from './reducer'
import { Event } from '@client/forms'

export function getEventDraft(formDrafts: IDraft[], event: Event) {
  const formDraft = find(formDrafts, { event })
  if (!formDraft) {
    throw new Error(`${event} formDraft not found`)
  }
  return formDraft
}

export function getFormDraft(formDrafts: IDraft[]) {
  const birthDraft = getEventDraft(formDrafts, Event.BIRTH)
  const deathDraft = getEventDraft(formDrafts, Event.DEATH)
  return {
    birth: birthDraft,
    death: deathDraft
  }
}
