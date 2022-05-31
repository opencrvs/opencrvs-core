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
  IContentResponse,
  IAssetResponse,
  IApplicationConfigResponse,
  IApplicationConfig,
  ICertificateTemplateData
} from '@client/utils/referenceApi'
import { IUserDetails } from '@client/utils/userUtils'
import { IFormDraft } from '@client/forms/configuration/formDrafts/utils'
import { IQuestionConfig, IFormConfig } from '@client/forms'

export const GET_LOCATIONS = 'OFFLINE/GET_LOCATIONS'
type GetLocations = {
  type: typeof GET_LOCATIONS
  payload: string
}

export const CONTENT_LOADED = 'OFFLINE/CONTENT_LOADED'
export type ContentLoadedAction = {
  type: typeof CONTENT_LOADED
  payload: IContentResponse
}

export const CONTENT_FAILED = 'OFFLINE/CONTENT_FAILED'
export type ContentFailedAction = {
  type: typeof CONTENT_FAILED
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

export const APPLICATION_CONFIG_LOADED = 'OFFLINE/APPLICATION_CONFIG_LOADED'
export type ApplicationConfigLoadedAction = {
  type: typeof APPLICATION_CONFIG_LOADED
  payload: IApplicationConfigResponse
}

export const UPDATE_OFFLINE_CONFIG = 'OFFLINE/UPDATE_OFFLINE_CONFIG' as const
export type ApplicationConfigUpdatedAction = {
  type: typeof UPDATE_OFFLINE_CONFIG
  payload: { config: IApplicationConfig }
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

export const contentLoaded = (
  payload: IContentResponse
): ContentLoadedAction => ({
  type: CONTENT_LOADED,
  payload: payload
})

export const contentFailed = (error: Error): ContentFailedAction => ({
  type: CONTENT_FAILED,
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

export const updateOfflineConfigData = (payload: {
  config: IApplicationConfig
}): ApplicationConfigUpdatedAction => ({
  type: UPDATE_OFFLINE_CONFIG,
  payload: payload
})

export const REFRESH_OFFLINE_DATA = 'OFFLINE/REFRESH_OFFLINE_DATA' as const
export const refreshOfflineData = () => ({
  type: REFRESH_OFFLINE_DATA
})

export const UPDATE_OFFLINE_FORM_CONFIG = 'OFFLINE/UPDATE_FORM_CONFIG'
export type UpdateOfflineFormConfigAction = {
  type: typeof UPDATE_OFFLINE_FORM_CONFIG
  payload: {
    formDrafts: IFormDraft[]
    questionConfig?: IQuestionConfig[]
  }
}

export const UPDATE_OFFLINE_CERTIFICATE = 'OFFLINE/UPDATE_CERTIFICATE'
export type UpdateOfflineCertificateAction = {
  type: typeof UPDATE_OFFLINE_CERTIFICATE
  payload: {
    certificate: ICertificateTemplateData
  }
}

export const updateOfflineFormConfig = (
  formDrafts: IFormDraft[],
  questionConfig?: IQuestionConfig[]
): UpdateOfflineFormConfigAction => ({
  type: UPDATE_OFFLINE_FORM_CONFIG,
  payload: {
    formDrafts,
    questionConfig
  }
})

export const updateOfflineCertificate = (
  certificate: ICertificateTemplateData
): UpdateOfflineCertificateAction => ({
  type: UPDATE_OFFLINE_CERTIFICATE,
  payload: {
    certificate
  }
})

export const OFFLINE_FORM_CONFIG_UPDATED = 'OFFLINE/FORM_CONFIG_UPDATED'
export type OfflineFormConfigUpdatedAction = {
  type: typeof OFFLINE_FORM_CONFIG_UPDATED
  payload: {
    formConfig: IFormConfig
  }
}

export const offlineFormConfigUpdated = (
  formConfig: IFormConfig
): OfflineFormConfigUpdatedAction => ({
  type: OFFLINE_FORM_CONFIG_UPDATED,
  payload: {
    formConfig
  }
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
  | ContentFailedAction
  | ContentLoadedAction
  | AssetsLoadedAction
  | AssetsFailedAction
  | ApplicationConfigLoadedAction
  | ApplicationConfigFailedAction
  | ApplicationConfigUpdatedAction
  | UpdateOfflineFormConfigAction
  | UpdateOfflineCertificateAction
  | OfflineFormConfigUpdatedAction
  | IFilterLocationsAction
  | ReturnType<typeof offlineDataReady>
  | ReturnType<typeof offlineDataUpdated>
  | ReturnType<typeof refreshOfflineData>
