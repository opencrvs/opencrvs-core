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
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import * as Sentry from '@sentry/react'

interface ICodeVerifyData {
  nonce: string
  code: string
}
export interface ICountryLogo {
  fileName: string
  file: string
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
  SENTRY: string
  USER_NOTIFICATION_DELIVERY_METHOD: string
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: string
}

export interface IApplicationConfigResponse {
  config: IApplicationConfig
}

export interface IAuthenticationData {
  username: string
  password: string
}

export const client = axios.create({})

export interface IAuthenticateResponse {
  nonce: string
  token?: string
  refreshToken?: string
  mobile?: string
  email?: string
}

export enum QUESTION_KEYS {
  BIRTH_TOWN = 'BIRTH_TOWN',
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  MOTHER_NAME = 'MOTHER_NAME',
  FAVORITE_TEACHER = 'FAVORITE_TEACHER',
  FAVORITE_MOVIE = 'FAVORITE_MOVIE',
  FAVORITE_SONG = 'FAVORITE_SONG',
  FAVORITE_FOOD = 'FAVORITE_FOOD',
  FIRST_CHILD_NAME = 'FIRST_CHILD_NAME'
}

export enum NotificationEvent {
  TWO_FACTOR_AUTHENTICATION = 'TWO_FACTOR_AUTHENTICATION',
  PASSWORD_RESET = 'PASSWORD_RESET'
}
export interface ITokenResponse {
  token: string
  refreshToken: string
}

const loginClientVersion = APP_VERSION

export function request<T>(options: AxiosRequestConfig) {
  const onSuccess = (response: AxiosResponse<T>) => {
    const gatewayVersion = response.headers['x-version']

    if (gatewayVersion && gatewayVersion !== loginClientVersion) {
      // eslint-disable-next-line no-console
      console.log(
        `Version Mismatch: Frontend is running on ${loginClientVersion}, whereas backend is running on ${gatewayVersion}. Please Reload to get the latest client`
      )
      throw new AxiosError('VERSION_MISMATCH')
    }
    return response.data
  }

  const onError = (error: AxiosError) => {
    const gatewayVersion = error.response?.headers['x-version']
    if (gatewayVersion && gatewayVersion !== loginClientVersion) {
      // eslint-disable-next-line no-console
      console.log(
        `Version Mismatch: Frontend is running on ${loginClientVersion}, whereas backend is running on ${gatewayVersion}. Please Reload to get the latest client`
      )
      throw new AxiosError('VERSION_MISMATCH')
    }
    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
    } else {
      // Something else happened while setting up the request
      // eslint-disable-next-line no-console
      console.error('Error Message:', error.message)
      Sentry.captureException(error)
    }

    throw error
  }

  return client(options).then(onSuccess).catch(onError)
}

const getApplicationConfig = () => {
  return request<IApplicationConfigResponse>({
    url: '/api/publicConfig',
    method: 'GET'
  })
}

const authenticate = (data: IAuthenticationData) => {
  return request<IAuthenticateResponse>({
    url: '/api/auth/authenticate',
    method: 'POST',
    data
  })
}

const resendAuthenticationCode = (
  nonce: string,
  notificationEvent: NotificationEvent
) => {
  return request({
    url: '/api/auth/resendAuthenticationCode',
    method: 'POST',
    data: { nonce, notificationEvent }
  })
}

const verifyCode = (data: ICodeVerifyData): Promise<IAuthenticateResponse> => {
  return request({
    url: '/api/auth/verifyCode',
    method: 'POST',
    data
  })
}

interface IUserVerificationDetails {
  mobile?: string
  email?: string
  retrieveFlow: string
}

/*
 * Always resolves with an empty body, account or not — the enumeration fix.
 * The server emails a single-use link only if it found one; the client cannot
 * tell, and must not try to.
 */
const verifyUser = (
  verificationDetails: IUserVerificationDetails
): Promise<void> => {
  return request({
    url: '/api/auth/verifyUser',
    method: 'POST',
    data: verificationDetails
  })
}

interface IVerifyRecoveryTokenResponse {
  nonce: string
  securityQuestionKey: string
  retrieveFlow: string
}

/*
 * Exchanges the recovery link's single-use token for a nonce and the next
 * security question. The server rotates the nonce, killing the emailed link.
 */
const verifyRecoveryToken = (
  token: string
): Promise<IVerifyRecoveryTokenResponse> => {
  return request({
    url: '/api/auth/verifyRecoveryToken',
    method: 'POST',
    data: { token }
  })
}

export type IVerifySecurityAnswerResponse = { nonce: string } & (
  | {
      matched: false
      securityQuestionKey: QUESTION_KEYS
    }
  | { matched: true }
)

const verifySecurityAnswer = (
  nonce: string,
  answer: string
): Promise<IVerifySecurityAnswerResponse> => {
  return request({
    url: '/api/auth/verifySecurityAnswer',
    method: 'POST',
    data: { nonce, answer }
  })
}

const changePassword = (nonce: string, newPassword: string): Promise<void> => {
  return request({
    url: '/api/auth/changePassword',
    method: 'POST',
    data: { nonce, newPassword }
  })
}

const sendUserName = (nonce: string): Promise<void> => {
  return request({
    url: '/api/auth/sendUserName',
    method: 'POST',
    data: { nonce }
  })
}

export const authApi = {
  request,
  authenticate,
  verifyCode,
  resendAuthenticationCode,
  verifyUser,
  verifyRecoveryToken,
  verifySecurityAnswer,
  changePassword,
  sendUserName,
  getApplicationConfig
}
