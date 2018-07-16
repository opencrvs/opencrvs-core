import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { config } from '../config'
import { resolve } from 'url'
import { IStepOneData } from '../login/StepOneForm'

export const client = axios.create({
  baseURL: config.AUTH_API_URL
})

export interface IAuthenticateResponse {
  nonce: string
}

const request = (options: AxiosRequestConfig) => {
  // tslint:disable-next-line no-any
  const onSuccess = (response: any) => {
    return response.data
  }

  const onError = (error: AxiosError) => {
    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
    } else {
      // Something else happened while setting up the request
      // TODO: replace with call to Sentry
      console.error('Error Message:', error.message)
    }

    throw error
  }

  return client(options)
    .then(onSuccess)
    .catch(onError)
}

const submitStepOne = (data: IStepOneData): Promise<IAuthenticateResponse> => {
  return request({
    url: resolve(config.AUTH_API_URL, 'authenticate'),
    method: 'POST',
    data
  })
}
const resendSMS = (nonce: string) => {
  return request({
    url: resolve(config.AUTH_API_URL, '/resend-sms'),
    method: 'POST',
    data: { nonce }
  })
}

export const authApi = {
  request,
  submitStepOne,
  resendSMS
}
