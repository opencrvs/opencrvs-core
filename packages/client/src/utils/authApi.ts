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
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { resolve } from 'url'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'

export const client = axios.create({
  baseURL: window.config.AUTH_URL
})

function request<T>(options: AxiosRequestConfig) {
  const onSuccess = (response: AxiosResponse<T>) => {
    return response.data
  }

  const onError = (error: AxiosError) => {
    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
    } else {
      // Something else happened while setting up the request
      Sentry.captureException(error)
    }

    throw error
  }

  return client(options).then(onSuccess).catch(onError)
}

const invalidateToken = (token: string): Promise<void> => {
  return request({
    url: resolve(window.config.AUTH_URL, 'invalidateToken'),
    method: 'POST',
    data: { token }
  })
}

export const authApi = {
  invalidateToken
}
