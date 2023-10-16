import { METRICS_URL } from '@gateway/constants'
import { IAuthHeader } from '@opencrvs/commons'
import { IMetricsParam } from './root-resolvers'
import fetch from '@gateway/fetch'

export interface IEventDurationResponse {
  status: string
  durationInSeconds: number
}

export const getEventDurationsFromMetrics = async (
  authHeader: IAuthHeader,
  compositionId: string
): Promise<IEventDurationResponse | IEventDurationResponse[]> => {
  const params = new URLSearchParams({ compositionId })
  return fetch(`${METRICS_URL}/eventDuration?` + params, {
    method: 'GET',
    headers: {
      ...authHeader
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(
          `Event Durations from metrics request failed: ${error.message}`
        )
      )
    })
}

export const getMetrics = (
  prefix: string,
  params: IMetricsParam,
  authHeader: IAuthHeader
) => {
  const paramsWithUndefined = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  )
  return fetch(
    `${METRICS_URL}${prefix}?` +
      new URLSearchParams({ ...paramsWithUndefined }),
    {
      method: 'GET',
      headers: {
        ...authHeader
      }
    }
  )
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Metrics request failed: ${error.message}`)
      )
    })
}

export const postMetrics = (
  prefix: string,
  payload: IMetricsParam,
  authHeader: IAuthHeader
) => {
  return fetch(`${METRICS_URL}${prefix}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Metrics request failed: ${error.message}`)
      )
    })
}
