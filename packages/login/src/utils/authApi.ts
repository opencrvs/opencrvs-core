import axios, { AxiosError } from 'axios'
import { IAPIOptions } from '../type/API'
import { config } from '../config'
import { IStepOneData } from '../type/Login'
import { resolve } from 'url'

export const client = axios.create({
  baseURL: config.AUTH_API_URL
})

const request = (options: IAPIOptions) => {
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

const submitStepOne = (data: IStepOneData) => {
  return request({
    url: resolve(config.AUTH_API_URL, 'authenticate'),
    method: 'POST',
    data
  } as IAPIOptions)
}

export const authApi = {
  request,
  submitStepOne
}
