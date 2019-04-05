import fetch from 'node-fetch'
import { resolve } from 'url'
import { ILocation } from 'src/offline/reducer'

export interface ILocationDataResponse {
  data: { [key: string]: ILocation }
}

export interface IFacilitiesDataResponse {
  data: { [key: string]: ILocation }
}

async function loadLocations(): Promise<any> {
  const url = resolve(window.config.RESOURCES_URL, 'locations')

  const res = await fetch(url, {
    method: 'GET'
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const body = await res.json()
  return {
    data: body.data
  }
}

async function loadFacilities(): Promise<any> {
  const url = resolve(window.config.RESOURCES_URL, 'facilities')

  const res = await fetch(url, {
    method: 'GET'
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
