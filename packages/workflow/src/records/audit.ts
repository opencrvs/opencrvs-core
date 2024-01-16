/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import fetch from 'node-fetch'
import { getEventType } from '@workflow/features/registration/utils'
import { SavedBundle, ValidRecord } from '@opencrvs/commons/types'
import { METRICS_URL } from '@workflow/constants'

type AuditAction =
  | 'in-progress-declaration'
  | 'new-declaration'
  | 'mark-certified'
  | 'mark-reinstated'

export async function auditEvent(
  action: AuditAction,
  bundle: ValidRecord | SavedBundle,
  authToken: string
) {
  const eventType = getEventType(bundle).toLowerCase()
  const res = await fetch(
    new URL(`/events/${eventType}/${action}`, METRICS_URL).href,
    {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Writing an audit event to metrics failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }
  return res
}

export async function createNewAuditEvent(
  bundle: ValidRecord,
  authToken: string
) {
  const eventType = getEventType(bundle).toLowerCase()

  const res = await fetch(
    new URL(`/events/${eventType}/request-correction`, METRICS_URL).href,
    {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Writing an audit event to metrics failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }

  return res
}
