/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  AdminStructure,
  CRVSOffice,
  Facility,
  IOfflineData
} from '@client/offline/reducer'
import {
  IApplicationConfigAnonymous,
  IApplicationConfigResponse,
  IContentResponse,
  IFacilitiesDataResponse,
  ILocationDataResponse,
  LoadHandlebarHelpersResponse,
  ICertificateData
} from '@client/utils/referenceApi'
import { ApplicationConfig } from '@opencrvs/commons/client'

export const CONTENT_LOADED = 'OFFLINE/CONTENT_LOADED'
type ContentLoadedAction = {
  type: typeof CONTENT_LOADED
  payload: IContentResponse
}

export const CONTENT_FAILED = 'OFFLINE/CONTENT_FAILED'
type ContentFailedAction = {
  type: typeof CONTENT_FAILED
  payload: Error
}

export const LOCATIONS_LOADED = 'OFFLINE/LOCATIONS_LOADED'
type LocationsLoadedAction = {
  type: typeof LOCATIONS_LOADED
  payload: { [key: string]: AdminStructure }
}

export const LOCATIONS_FAILED = 'OFFLINE/LOCATIONS_FAILED'
type LocationsFailedAction = {
  type: typeof LOCATIONS_FAILED
  payload: Error
}

export const FACILITIES_LOADED = 'OFFLINE/FACILITIES_LOADED'
type FacilitiesLoadedAction = {
  type: typeof FACILITIES_LOADED
  payload: { [key: string]: Facility | CRVSOffice }
}

export const FACILITIES_FAILED = 'OFFLINE/FACILITIES_FAILED'
type FacilitiesFailedAction = {
  type: typeof FACILITIES_FAILED
  payload: Error
}

export const APPLICATION_CONFIG_LOADED = 'OFFLINE/APPLICATION_CONFIG_LOADED'
type ApplicationConfigLoadedAction = {
  type: typeof APPLICATION_CONFIG_LOADED
  payload: IApplicationConfigResponse
}

export const CERTIFICATES_LOADED = 'OFFLINE/CERTIFICATES_LOADED'
type CertificatesLoadedAction = {
  type: typeof CERTIFICATES_LOADED
  payload: ICertificateData[]
}

export const UPDATE_OFFLINE_CONFIG = 'OFFLINE/UPDATE_OFFLINE_CONFIG' as const
type ApplicationConfigUpdatedAction = {
  type: typeof UPDATE_OFFLINE_CONFIG
  payload: { config: ApplicationConfig }
}

export const ANONYMOUS_USER_OFFLINE_CONFIG =
  'OFFLINE/ANONYMOUS_USER_OFFLINE_CONFIG' as const
type ApplicationConfigAnonymousUserAction = {
  type: typeof ANONYMOUS_USER_OFFLINE_CONFIG
  payload: { anonymousConfig: IApplicationConfigAnonymous }
}

export const APPLICATION_CONFIG_FAILED = 'OFFLINE/APPLICATION_CONFIG_FAILED'
type ApplicationConfigFailedAction = {
  type: typeof APPLICATION_CONFIG_FAILED
  payload: Error
}

export const GET_OFFLINE_DATA_SUCCESS = 'OFFLINE/GET_OFFLINE_DATA_SUCCESS'
type IGetOfflineDataSuccessAction = {
  type: typeof GET_OFFLINE_DATA_SUCCESS
  payload: string
}
const GET_OFFLINE_DATA_FAILED = 'OFFLINE/GET_OFFLINE_DATA_FAILED'
type IGetOfflineDataFailedAction = {
  type: typeof GET_OFFLINE_DATA_FAILED
}

export const READY = 'OFFLINE/READY' as const
export const UPDATED = 'OFFLINE/UPDATED' as const

export const locationsLoaded = (
  payload: ILocationDataResponse
): LocationsLoadedAction => ({
  type: LOCATIONS_LOADED,
  payload: payload
})

export const locationsFailed = (error: Error): LocationsFailedAction => ({
  type: LOCATIONS_FAILED,
  payload: error
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

export const certificatesLoaded = (
  payload: ICertificateData[]
): CertificatesLoadedAction => ({
  type: CERTIFICATES_LOADED,
  payload
})

export const configFailed = (error: Error): ApplicationConfigFailedAction => ({
  type: APPLICATION_CONFIG_FAILED,
  payload: error
})

export const REFRESH_OFFLINE_DATA = 'OFFLINE/REFRESH_OFFLINE_DATA' as const
export const refreshOfflineData = () => ({
  type: REFRESH_OFFLINE_DATA
})

export const handlebarsLoaded = (payload: LoadHandlebarHelpersResponse) => ({
  type: 'OFFLINE/HANDLEBARS_LOADED' as const,
  payload: payload
})

export const handlebarsFailed = (error: Error) => ({
  type: 'OFFLINE/HANDLEBARS_FAILED' as const,
  payload: error
})

export type Action =
  | LocationsFailedAction
  | LocationsLoadedAction
  | IGetOfflineDataSuccessAction
  | IGetOfflineDataFailedAction
  | FacilitiesLoadedAction
  | FacilitiesFailedAction
  | ContentFailedAction
  | ContentLoadedAction
  | ApplicationConfigLoadedAction
  | CertificatesLoadedAction
  | ApplicationConfigAnonymousUserAction
  | ApplicationConfigFailedAction
  | ApplicationConfigUpdatedAction
  | ReturnType<typeof offlineDataReady>
  | ReturnType<typeof offlineDataUpdated>
  | ReturnType<typeof refreshOfflineData>
  | ReturnType<typeof handlebarsLoaded>
  | ReturnType<typeof handlebarsFailed>
