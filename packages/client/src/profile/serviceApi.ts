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
import { getToken } from '@client/utils/authUtils'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { resolve } from 'url'
export interface ISendVerifyCodeData {
  userId: string
  phoneNumber: string
  scope: string[]
}

export interface ISendVerifyCodeResponse {
  userId: string
  nonce: string
  mobile: string
  status: string
}

export const client = axios.create({
  baseURL: window.config.API_GATEWAY_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
})

function request<T>(options: AxiosRequestConfig) {
  const onSuccess = (response: AxiosResponse<T>) => {
    return response.data
  }

  const onError = (error: AxiosError) => {
    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
      console.log('response.data', error)
    } else {
      // Something else happened while setting up the request
      console.error('Error Message:', error.message)
    }

    throw error
  }

  return client(options)
    .then(onSuccess)
    .catch(onError)
}

const sendVerifyCode = (data: ISendVerifyCodeData) => {
  return request<ISendVerifyCodeResponse>({
    url: resolve(window.config.API_GATEWAY_URL, 'sendVerifyCode'),
    method: 'POST',
    data
  })
}

export const serviceApi = {
  sendVerifyCode
}
