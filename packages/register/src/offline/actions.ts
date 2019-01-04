import { IOfflineData, ILocation } from './reducer'
import { AxiosError } from 'axios'
import { ILocationDataResponse } from 'src/utils/referenceApi'

export const GET_LOCATIONS = 'OFFLINE/GET_LOCATIONS'
type GetLocations = {
  type: typeof GET_LOCATIONS
  payload: string
}
export const LOAD_OFFLINE_DATA = 'OFFLINE/LOAD_OFFLINE_DATA'
type LoadOfflineData = {
  type: typeof LOAD_OFFLINE_DATA
}
export const STORE_OFFLINE_DATA = 'OFFLINE/STORE_OFFLINE_DATA'
type StoreOfflineData = {
  type: typeof STORE_OFFLINE_DATA
  payload: IOfflineData
}

export const LOCATIONS_LOADED = 'OFFLINE/LOCATIONS_LOADED'
export type LocationsLoadedAction = {
  type: typeof LOCATIONS_LOADED
  payload: ILocation[]
}

export const LOCATIONS_FAILED = 'OFFLINE/LOCATIONS_FAILED'
export type LocationsFailedAction = {
  type: typeof LOCATIONS_FAILED
  payload: Error
}
export type Action =
  | GetLocations
  | LoadOfflineData
  | StoreOfflineData
  | LocationsFailedAction
  | LocationsLoadedAction

export const loadOfflineData = (): LoadOfflineData => ({
  type: LOAD_OFFLINE_DATA
})

export const storeOfflineData = (payload: IOfflineData): StoreOfflineData => ({
  type: STORE_OFFLINE_DATA,
  payload
})

export const locationsLoaded = (
  payload: ILocationDataResponse
): LocationsLoadedAction => ({
  type: LOCATIONS_LOADED,
  payload: payload.data
})

export const locationsFailed = (error: AxiosError): LocationsFailedAction => ({
  type: LOCATIONS_FAILED,
  payload: error
})
