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
import { getToken } from '@client/utils/authUtils'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { TriggerEvent } from '@opencrvs/commons/client'

interface ISendVerifyCodeData {
  userFullName: {
    use: string
    family: string
    given: string[]
  }[]
  notificationEvent:
    | typeof TriggerEvent.CHANGE_PHONE_NUMBER
    | typeof TriggerEvent.CHANGE_EMAIL_ADDRESS
  phoneNumber?: string
  email?: string
}

interface ISendVerifyCodeResponse {
  userId: string
  nonce: string
  status: string
  mobile?: string
  email?: string
}

const client = axios.create({
  baseURL: window.config.API_GATEWAY_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
})

function request<T>(options: AxiosRequestConfig) {
  const onSuccess = (response: AxiosResponse<T>) => {
    return response.data
  }

  return client(options).then(onSuccess)
}

const sendVerifyCode = (data: ISendVerifyCodeData) => {
  return request<ISendVerifyCodeResponse>({
    url: new URL('sendVerifyCode', window.config.API_GATEWAY_URL).toString(),
    method: 'POST',
    data
  })
}

export const serviceApi = {
  sendVerifyCode
}
