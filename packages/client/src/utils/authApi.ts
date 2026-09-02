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
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: window.config.AUTH_URL
})

function request<T>(options: AxiosRequestConfig) {
  const onSuccess = (response: AxiosResponse<T>) => {
    return response.data
  }

  return client(options).then(onSuccess)
}

const invalidateToken = (token: string): Promise<void> => {
  return request({
    url: new URL('invalidateToken', window.config.AUTH_URL).toString(),
    method: 'POST',
    data: { token }
  })
}

export const authApi = {
  invalidateToken
}
