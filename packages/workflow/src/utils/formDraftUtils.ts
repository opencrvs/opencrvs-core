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
import fetch from 'node-fetch'
import { logger } from '@workflow/logger'
import { APPLICATION_CONFIG_URL } from '@workflow/constants'
import { setupTestExtension } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'

export enum DraftStatus {
  DRAFT = 'DRAFT',
  IN_PREVIEW = 'IN_PREVIEW',
  PUBLISHED = 'PUBLISHED'
}

export interface IDraft {
  status: DraftStatus
  event: EVENT_TYPE
}

export async function getFormDraft(token: string) {
  try {
    const res = await fetch(`${APPLICATION_CONFIG_URL}formDraft`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    return await res.json()
  } catch (err) {
    logger.error(`Unable to check form draft status for error : ${err}`)
    throw err
  }
}

export async function checkFormDraftStatusToAddTestExtension(
  taskResource: fhir.Task,
  token: string
) {
  const formDraft: IDraft[] = await getFormDraft(token)
  // Array.prototype.every returns true for an empty array
  const isPublished =
    formDraft.length === Object.values(EVENT_TYPE).length &&
    Object.values(formDraft).every(
      (draft) => draft.status === DraftStatus.PUBLISHED
    )

  if (!isPublished) {
    setupTestExtension(taskResource)
  }
}
