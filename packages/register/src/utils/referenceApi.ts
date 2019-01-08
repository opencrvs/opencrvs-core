import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { resolve } from 'url'
import { ILocation } from 'src/offline/reducer'
import { config } from 'src/config'

export interface ILocationDataResponse {
  data: ILocation[]
}

export const client = axios.create({
  baseURL: config.REGISTER_APP_URL
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
      // TODO: replace with call to Sentry
      console.error('Error Message:', error.message)
    }

    throw error
  }

  return client(options)
    .then(onSuccess)
    .catch(onError)
}

const loadLocations = () => {
  return request<ILocationDataResponse>({
    url: resolve(config.REGISTER_APP_URL, 'assets/locations.json'),
    method: 'GET'
  })
}

export const referenceApi = {
  request,
  loadLocations
}
