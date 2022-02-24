/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { ILocation, IOfflineData } from '@client/offline/reducer'
import { ILanguageState } from '@client/i18n/reducer'
import {
  ILocationDataResponse,
  IFacilitiesDataResponse,
  IDefinitionsResponse,
  IAssetResponse,
  IApplicationConfigResponse
} from '@client/utils/referenceApi'
import { IUserDetails } from '@client/utils/userUtils'

export const GET_LOCATIONS = 'OFFLINE/GET_LOCATIONS'
type GetLocations = {
  type: typeof GET_LOCATIONS
  payload: string
}

export const DEFINITIONS_LOADED = 'OFFLINE/DEFINITIONS_LOADED'
export type DefinitionsLoadedAction = {
  type: typeof DEFINITIONS_LOADED
  payload: IDefinitionsResponse
}

export const DEFINITIONS_FAILED = 'OFFLINE/DEFINITIONS_FAILED'
export type DefinitionsFailedAction = {
  type: typeof DEFINITIONS_FAILED
  payload: Error
}

export const LOCATIONS_LOADED = 'OFFLINE/LOCATIONS_LOADED'
export type LocationsLoadedAction = {
  type: typeof LOCATIONS_LOADED
  payload: { [key: string]: ILocation }
}

export const LOCATIONS_FAILED = 'OFFLINE/LOCATIONS_FAILED'
export type LocationsFailedAction = {
  type: typeof LOCATIONS_FAILED
  payload: Error
}

export const FACILITIES_LOADED = 'OFFLINE/FACILITIES_LOADED'
export type FacilitiesLoadedAction = {
  type: typeof FACILITIES_LOADED
  payload: { [key: string]: ILocation }
}

export const FACILITIES_FAILED = 'OFFLINE/FACILITIES_FAILED'
export type FacilitiesFailedAction = {
  type: typeof FACILITIES_FAILED
  payload: Error
}

export const PILOT_LOCATIONS_LOADED = 'OFFLINE/PILOT_LOCATIONS_LOADED'
export type PilotLocationsLoadedAction = {
  type: typeof PILOT_LOCATIONS_LOADED
  payload: { [key: string]: ILocation }
}

export const PILOT_LOCATIONS_FAILED = 'OFFLINE/PILOT_LOCATIONS_FAILED'
export type PilotLocationsFailedAction = {
  type: typeof PILOT_LOCATIONS_FAILED
  payload: Error
}

export const ASSETS_LOADED = 'OFFLINE/ASSETS_LOADED'
export type AssetsLoadedAction = {
  type: typeof ASSETS_LOADED
  payload: IAssetResponse
}

export const ASSETS_FAILED = 'OFFLINE/ASSETS_FAILED'
export type AssetsFailedAction = {
  type: typeof ASSETS_FAILED
  payload: Error
}

export const APPLICATION_CONFIG_LOAD = 'OFFLINE/APPLICATION_CONFIG_LOAD'
export type ApplicationConfigLoadAction = {
  type: typeof APPLICATION_CONFIG_LOAD
}

export const APPLICATION_CONFIG_LOADED = 'OFFLINE/APPLICATION_CONFIG_LOADED'
export type ApplicationConfigLoadedAction = {
  type: typeof APPLICATION_CONFIG_LOADED
  payload: IApplicationConfigResponse
}

export const APPLICATION_CONFIG_FAILED = 'OFFLINE/APPLICATION_CONFIG_FAILED'
export type ApplicationConfigFailedAction = {
  type: typeof APPLICATION_CONFIG_FAILED
  payload: Error
}

export const GET_EXISTING_OFFLINE_DATA = 'OFFLINE/SET_OFFLINE_DATA'
type SetOfflineData = {
  type: typeof GET_EXISTING_OFFLINE_DATA
  payload: IUserDetails
}
export const GET_OFFLINE_DATA_SUCCESS = 'OFFLINE/GET_OFFLINE_DATA_SUCCESS'
export type IGetOfflineDataSuccessAction = {
  type: typeof GET_OFFLINE_DATA_SUCCESS
  payload: string
}
export const GET_OFFLINE_DATA_FAILED = 'OFFLINE/GET_OFFLINE_DATA_FAILED'
export type IGetOfflineDataFailedAction = {
  type: typeof GET_OFFLINE_DATA_FAILED
}
export const FORMAT_LOCATIONS = 'OFFLINE/FORMAT_LOCATIONS'
export type IFilterLocationsAction = {
  type: typeof FORMAT_LOCATIONS
  payload: ILanguageState
}
export const READY = 'OFFLINE/READY' as const
export const UPDATED = 'OFFLINE/UPDATED' as const

export const locationsLoaded = (
  payload: ILocationDataResponse
): LocationsLoadedAction => ({
  type: LOCATIONS_LOADED,
  payload: payload
})

export const facilitiesFailed = (error: Error): FacilitiesFailedAction => ({
  type: FACILITIES_FAILED,
  payload: error
})

export const facilitiesLoaded = (
  payload: IFacilitiesDataResponse
): FacilitiesLoadedAction => ({
  type: FACILITIES_LOADED,
  payload: payload
})

export const locationsFailed = (error: Error): LocationsFailedAction => ({
  type: LOCATIONS_FAILED,
  payload: error
})

export const pilotLocationsLoaded = (
  payload: ILocationDataResponse
): PilotLocationsLoadedAction => ({
  type: PILOT_LOCATIONS_LOADED,
  payload: payload
})

export const pilotLocationsFailed = (
  error: Error
): PilotLocationsFailedAction => ({
  type: PILOT_LOCATIONS_FAILED,
  payload: error
})

/*
 * Only called from tests atm
 */
export const setOfflineData = (userDetails: IUserDetails): SetOfflineData => ({
  type: GET_EXISTING_OFFLINE_DATA,
  payload: userDetails
})

export const getOfflineDataSuccess = (
  response: string
): IGetOfflineDataSuccessAction => ({
  type: GET_OFFLINE_DATA_SUCCESS,
  payload: response
})

export const getOfflineDataFailed = (): IGetOfflineDataFailedAction => ({
  type: GET_OFFLINE_DATA_FAILED
})

export const definitionsLoaded = (
  payload: IDefinitionsResponse
): DefinitionsLoadedAction => ({
  type: DEFINITIONS_LOADED,
  payload: payload
})

export const definitionsFailed = (error: Error): DefinitionsFailedAction => ({
  type: DEFINITIONS_FAILED,
  payload: error
})

export const assetsLoaded = (payload: IAssetResponse): AssetsLoadedAction => ({
  type: ASSETS_LOADED,
  payload: payload
})

export const assetsFailed = (error: Error): AssetsFailedAction => ({
  type: ASSETS_FAILED,
  payload: error
})

export const offlineDataReady = (state: IOfflineData) => ({
  type: READY,
  payload: state
})

export const offlineDataUpdated = (state: IOfflineData) => ({
  type: UPDATED,
  payload: state
})

export const configLoad = (): ApplicationConfigLoadAction => ({
  type: APPLICATION_CONFIG_LOAD
})

export const configLoaded = (
  payload: IApplicationConfigResponse
): ApplicationConfigLoadedAction => ({
  type: APPLICATION_CONFIG_LOADED,
  payload: payload
})

export const configFailed = (error: Error): ApplicationConfigFailedAction => ({
  type: APPLICATION_CONFIG_FAILED,
  payload: error
})

export const REFRESH_OFFLINE_DATA = 'OFFLINE/REFRESH_OFFLINE_DATA' as const
export const refreshOfflineData = () => ({
  type: REFRESH_OFFLINE_DATA
})

export type Action =
  | GetLocations
  | LocationsFailedAction
  | LocationsLoadedAction
  | SetOfflineData
  | IGetOfflineDataSuccessAction
  | IGetOfflineDataFailedAction
  | FacilitiesLoadedAction
  | FacilitiesFailedAction
  | PilotLocationsLoadedAction
  | PilotLocationsFailedAction
  | DefinitionsFailedAction
  | DefinitionsLoadedAction
  | AssetsLoadedAction
  | AssetsFailedAction
  | ApplicationConfigLoadAction
  | ApplicationConfigLoadedAction
  | ApplicationConfigFailedAction
  | IFilterLocationsAction
  | ReturnType<typeof offlineDataReady>
  | ReturnType<typeof offlineDataUpdated>
  | ReturnType<typeof refreshOfflineData>
