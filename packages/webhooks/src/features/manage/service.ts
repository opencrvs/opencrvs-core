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
import * as decode from 'jwt-decode'
import { USER_MANAGEMENT_URL } from '@webhooks/constants'
import fetch from 'node-fetch'
import * as crypto from 'crypto'
import { CompositionSectionCode } from '@opencrvs/commons/types'

export interface IAuthHeader {
  Authorization: string
}

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
}

export enum EventType {
  Birth = 'birth',
  Death = 'death'
}

export interface WebHook {
  event: EventType
  permissions: CompositionSectionCode[]
}

export interface ISystem {
  name: string
  createdBy: string
  username: string
  client_id: string
  secretHash: string
  salt: string
  sha_secret: string
  practitionerId: string
  scope: string[]
  status: string
  settings: {
    dailyQuota: number
    webhook: WebHook[]
  }
  creationDate?: number
  type: string
}

export function hasScope(authHeader: IAuthHeader, scope: string) {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return (tokenPayload.scope && tokenPayload.scope.indexOf(scope) > -1) || false
}

export const getTokenPayload = (token: string): ITokenPayload => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    )
  }
  return decoded
}

export async function getSystem(
  body: { [key: string]: string | undefined },
  authHeader: string
) {
  const res = await fetch(`${USER_MANAGEMENT_URL}getSystem`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader
    }
  })
  return await res.json()
}

export function generateChallenge() {
  return crypto.randomBytes(16).toString('base64').toString()
}
