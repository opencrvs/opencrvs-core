import { resolve } from 'url'
import { ILocation } from '@register/offline/reducer'
import { getToken } from '@register/utils/authUtils'

export interface ILocationDataResponse {
  data: { [key: string]: ILocation }
}

export interface IFacilitiesDataResponse {
  data: { [key: string]: ILocation }
}

async function loadLocations(): Promise<any> {
  const url = resolve(
    window.config.RESOURCES_URL,
    `${window.config.COUNTRY}/locations`
  )

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  if (!res) {
    console.log(fetch.toString())
  }
  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const body = await res.json()
  return {
    data: body.data
  }
}

async function loadFacilities(): Promise<any> {
  const url = resolve(
    window.config.RESOURCES_URL,
    `${window.config.COUNTRY}/facilities`
  )

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const body = await res.json()
  return {
    data: body.data
  }
}

export const referenceApi = {
  loadLocations,
  loadFacilities
}
