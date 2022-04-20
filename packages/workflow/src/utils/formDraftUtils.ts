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
import { setupTestExtention } from '@workflow/features/registration/fhir/fhir-bundle-modifier'

export enum DraftStatus {
  DRAFT = 'DRAFT',
  IN_PREVIEW = 'IN_PREVIEW',
  PUBLISHED = 'PUBLISHED',
  DELETED = 'DELETED'
}

export interface IDraft {
  status: DraftStatus
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
    const result = await res.json()
    return result
  } catch (err) {
    logger.error(`Unable to check form draft status for error : ${err}`)
  }
}

export async function checkFormDraftStatusToAddTestExtention(
  taskResource: fhir.Task,
  token: string
) {
  const formDraft = (await getFormDraft(token)) as IDraft[]
  const isformDraftStatusInPreview = Object.values(formDraft).some(
    (draft) => draft.status === DraftStatus.IN_PREVIEW
  )

  if (isformDraftStatusInPreview) {
    setupTestExtention(taskResource)
  }
}
