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
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'

export interface IVerifySecurityAnswerResponse {
  matched: boolean
  questionKey: string
}

export async function verifySecurityAnswer(
  userId: string,
  questionKey: string,
  answer: string
): Promise<IVerifySecurityAnswerResponse> {
  const url = resolve(USER_MANAGEMENT_URL, '/verifySecurityAnswer')

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ userId, questionKey, answer }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }
  const body = await res.json()
  return {
    matched: body.matched,
    questionKey: body.questionKey
  }
}
