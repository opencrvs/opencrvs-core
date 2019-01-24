import fetch from 'node-fetch'
import { resolve } from 'url'
import { ILocation } from 'src/offline/reducer'
import { config } from 'src/config'

export interface ILocationDataResponse {
  data: ILocation[]
}

export interface IFacilitiesDataResponse {
  data: ILocation[]
}

async function loadLocations(): Promise<ILocationDataResponse> {
  const url = resolve(config.RESOURCES_URL, 'locations')

  const res = await fetch(url, {
    method: 'GET'
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  const body = await res.json()
  return {
    data: body.data
  }
}

async function loadFacilities(): Promise<ILocationDataResponse> {
  const url = resolve(config.RESOURCES_URL, 'facilities')

  const res = await fetch(url, {
    method: 'GET'
  })

  if (res.status !== 200) {
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
