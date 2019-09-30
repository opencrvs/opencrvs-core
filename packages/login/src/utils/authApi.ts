import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { resolve } from 'url'
import * as Sentry from '@sentry/browser'

export interface ICodeVerifyData {
  nonce: string
  code: string
}

export interface IAuthenticationData {
  username: string
  password: string
}

export const client = axios.create({
  baseURL: window.config.AUTH_API_URL
})

export interface IAuthenticateResponse {
  nonce: string
  token?: string
  mobile: string
}

export interface ITokenResponse {
  token: string
}

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
      console.error('Error Message:', error.message)
      Sentry.captureException(error)
    }

    throw error
  }

  return client(options)
    .then(onSuccess)
    .catch(onError)
}

const authenticate = (data: IAuthenticationData) => {
  return request<IAuthenticateResponse>({
    url: resolve(window.config.AUTH_API_URL, 'authenticate'),
    method: 'POST',
    data
  })
}

const resendSMS = (nonce: string) => {
  return request({
    url: resolve(window.config.AUTH_API_URL, '/resendSms'),
    method: 'POST',
    data: { nonce }
  })
}

const verifyCode = (data: ICodeVerifyData): Promise<IAuthenticateResponse> => {
  return request({
    url: resolve(window.config.AUTH_API_URL, 'verifyCode'),
    method: 'POST',
    data
  })
}

interface IUserVerifyResponse {
  nonce: string
}

const verifyUser = (mobile: string): Promise<IUserVerifyResponse> => {
  return request({
    url: resolve(window.config.AUTH_API_URL, 'verifyUser'),
    method: 'POST',
    data: { mobile }
  })
}

interface IVerifyNumberResponse {
  nonce: string
  securityQuestionKey: string
}

const verifyNumber = (
  nonce: string,
  code: string
): Promise<IVerifyNumberResponse> => {
  return request({
    url: resolve(window.config.AUTH_API_URL, 'verifyNumber'),
    method: 'POST',
    data: { nonce, code }
  })
}

export type IVerifySecurityAnswerResponse =
  | {
      matched: false
      securityQuestionKey: string
    }
  | { matched: true }

const verifySecurityAnswer = (
  nonce: string,
  answer: string
): Promise<IVerifySecurityAnswerResponse> => {
  return request({
    url: resolve(window.config.AUTH_API_URL, 'verifySecurityAnswer'),
    method: 'POST',
    data: { nonce, answer }
  })
}

export const authApi = {
  request,
  authenticate,
  verifyCode,
  resendSMS,
  verifyNumber,
  verifyUser,
  verifySecurityAnswer
}
