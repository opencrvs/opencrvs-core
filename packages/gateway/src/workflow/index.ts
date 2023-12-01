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
import { IAuthHeader } from '@opencrvs/commons'
import { WORKFLOW_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import {
  GQLBirthRegistrationInput,
  GQLCorrectionInput,
  GQLCorrectionRejectionInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput
} from '@gateway/graphql/schema'

const createRequest = async <T = any>(
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  path: string,
  authHeader: IAuthHeader,
  body?: Record<string, any>
): Promise<T> => {
  const response = await fetch(new URL(path, WORKFLOW_URL).href, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    if (response.status === 400) {
      const data = await response.json()
      throw new Error(data.message)
    }

    throw new Error(response.statusText)
  }

  return response.json()
}

export function requestRegistrationCorrection(
  recordId: string,
  correctionDetails: GQLCorrectionInput,
  authHeader: IAuthHeader
) {
  return createRequest(
    'POST',
    `/records/${recordId}/request-correction`,
    authHeader,
    correctionDetails
  )
}

export function approveRegistrationCorrection(
  recordId: string,
  record:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader
) {
  return createRequest<void>(
    'POST',
    `/records/${recordId}/approve-correction`,
    authHeader,
    record
  )
}

export function makeRegistrationCorrection(
  recordId: string,
  record:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader
) {
  return createRequest<void>(
    'POST',
    `/records/${recordId}/make-correction`,
    authHeader,
    record
  )
}

export function rejectRegistrationCorrection(
  recordId: string,
  details: GQLCorrectionRejectionInput,
  authHeader: IAuthHeader
) {
  return createRequest<void>(
    'POST',
    `/records/${recordId}/reject-correction`,
    authHeader,
    details
  )
}
