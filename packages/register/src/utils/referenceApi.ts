import { ILocation } from '@register/offline/reducer'
import { getToken } from '@register/utils/authUtils'
import { ILanguage } from '@register/i18n/reducer'
import { ISerializedForm } from '@register/forms'
import * as ImageDownloader from 'image-to-base64'

export interface ILocationDataResponse {
  [locationId: string]: ILocation
}
export interface IFacilitiesDataResponse {
  [facilityId: string]: ILocation
}
export interface IDefinitionsResponse {
  languages: ILanguage[]
  forms: { registerForm: { birth: ISerializedForm; death: ISerializedForm } }
}
export interface IAssetResponse {
  logo: string
}

async function loadDefinitions(): Promise<IDefinitionsResponse> {
  const url = `${window.config.RESOURCES_URL}/definitions/register`

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
  return response
}

async function loadLocations(): Promise<ILocationDataResponse> {
  const url = `${window.config.RESOURCES_URL}/locations`

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
  const url = `${window.config.RESOURCES_URL}/facilities`
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

async function loadAssets(): Promise<IAssetResponse> {
  const url = `${window.config.RESOURCES_URL}/assets/${window.config.COUNTRY_LOGO_FILE}`
  const base64Logo = await ImageDownloader(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  return {
    logo: `data:image;base64,${base64Logo}`
  }
}

export const referenceApi = {
  loadLocations,
  loadFacilities,
  loadDefinitions,
  loadAssets
}
