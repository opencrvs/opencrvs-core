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
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'

export enum EmailTemplateType {
  ONBOARDING_INVITE = 'onboarding-invite',
  TWO_FACTOR_AUTHENTICATION = '2-factor-authentication',
  CHANGE_PHONE_NUMBER = 'change-phone-number',
  PASSWORD_RESET_BY_SYSTEM_ADMIN = 'password-reset-by-system-admin',
  PASSWORD_RESET = 'password-reset',
  USERNAME_REMINDER = 'username-reminder',
  USERNAME_UPDATED = 'username-updated'
}

export enum SMSTemplateType {
  AUTHENTICATION_CODE_NOTIFICATION = 'authenticationCodeNotification',
  USER_CREDENTIALS_NOTIFICATION = 'userCredentialsNotification',
  RETIEVE_USERNAME_NOTIFICATION = 'retieveUserNameNotification',
  UPDATE_USERNAME_NOTIFICATION = 'updateUserNameNotification',
  RESET_USER_PASSWORD_NOTIFICATION = 'resetUserPasswordNotification'
}

export interface ISendVerifyCodeData {
  userFullName: {
    use: string
    family: string
    given: string[]
  }[]
  templateName: EmailTemplateType | SMSTemplateType
  phoneNumber?: string
  email?: string
}

export interface ISendVerifyCodeResponse {
  userId: string
  nonce: string
  status: string
  mobile?: string
  email?: string
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
    } else {
      // Something else happened while setting up the request
      Sentry.captureException(error)
    }

    throw error
  }

  return client(options).then(onSuccess).catch(onError)
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
