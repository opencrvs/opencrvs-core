import { resolve } from 'url'
import { ILocation } from '@register/offline/reducer'
import { getToken } from '@register/utils/authUtils'
import { ILanguage } from '@register/i18n/reducer'

export interface ILocationDataResponse {
  [locationId: string]: ILocation
}
export interface IFacilitiesDataResponse {
  [facilityId: string]: ILocation
}
export type ILanguagesDataResponse = ILanguage[]

async function loadLanguages(): Promise<ILanguagesDataResponse> {
  const url = resolve(
    window.config.RESOURCES_URL,
    `${window.config.COUNTRY}/languages/register`
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

  const response = await res.json()
  return response.data
}

async function loadLocations(): Promise<ILocationDataResponse> {
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

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response.data
}

async function loadFacilities(): Promise<IFacilitiesDataResponse> {
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

  const response = await res.json()
  return response.data
}

export const referenceApi = {
  loadLocations,
  loadFacilities,
  loadLanguages
}
