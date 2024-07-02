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
import { METRICS_URL } from '@gateway/constants'
import { IAuthHeader } from '@opencrvs/commons'
import { IMetricsParam } from './root-resolvers'
import fetch from '@gateway/fetch'

export interface IEventDurationResponse {
  status: string
  durationInSeconds: number
}

export const getEventDurationsFromMetrics = async (
  authHeader: IAuthHeader,
  compositionId: string
): Promise<IEventDurationResponse | IEventDurationResponse[]> => {
  const params = new URLSearchParams({ compositionId })
  return fetch(`${METRICS_URL}/eventDuration?` + params, {
    method: 'GET',
    headers: {
      ...authHeader
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(
          `Event Durations from metrics request failed: ${error.message}`
        )
      )
    })
}

export const getMetrics = (
  prefix: string,
  params: IMetricsParam,
  authHeader: IAuthHeader
) => {
  const paramsWithUndefined = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  )
  return fetch(
    `${METRICS_URL}${prefix}?` +
      new URLSearchParams({ ...paramsWithUndefined }),
    {
      method: 'GET',
      headers: {
        ...authHeader
      }
    }
  )
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Metrics request failed: ${error.message}`)
      )
    })
}

export const postMetrics = (
  prefix: string,
  payload: IMetricsParam,
  authHeader: IAuthHeader
) => {
  return fetch(`${METRICS_URL}${prefix}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Metrics request failed: ${error.message}`)
      )
    })
}
