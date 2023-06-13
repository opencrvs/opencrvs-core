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
import {
  CertificatePayload,
  ILocation,
  IOfflineData
} from '@client/offline/reducer'
import { ILanguageState } from '@client/i18n/reducer'
import {
  ILocationDataResponse,
  IFacilitiesDataResponse,
  IContentResponse,
  IApplicationConfigResponse,
  IApplicationConfig,
  ICertificateTemplateData,
  IApplicationConfigAnonymous,
  LoadValidatorsResponse,
  LoadFormsAndValidatorsResponse
} from '@client/utils/referenceApi'
import { System } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'

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

export const FORMS_LOADED = 'OFFLINE/FORMS_LOADED'
export type FormsLoadedAction = {
  type: typeof FORMS_LOADED
  payload: LoadFormsAndValidatorsResponse
}

export const FORMS_FAILED = 'OFFLINE/FORMS_FAILED'
export type FormsFailedAction = {
  type: typeof FORMS_FAILED
  payload: Error
}

export const VALIDATORS_LOADED = 'OFFLINE/VALIDATORS_LOADED'
export type ValidatorsLoadedAction = {
  type: typeof VALIDATORS_LOADED
  payload: LoadValidatorsResponse
}

export const VALIDATORS_FAILED = 'OFFLINE/VALIDATORS_FAILED'
export type ValidatorsFailedAction = {
  type: typeof VALIDATORS_FAILED
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

export const APPLICATION_CONFIG_LOADED = 'OFFLINE/APPLICATION_CONFIG_LOADED'
export type ApplicationConfigLoadedAction = {
  type: typeof APPLICATION_CONFIG_LOADED
  payload: IApplicationConfigResponse
}

export const CERTIFICATE_LOADED = 'OFFLINE/CERTIFICATE_LOADED'
export type CertificateLoadedAction = {
  type: typeof CERTIFICATE_LOADED
  payload: CertificatePayload
}

export const CERTIFICATE_LOAD_FAILED = 'OFFLINE/CERTIFICATE_LOAD_FAILED'
export type CertificateLoadFailedAction = {
  type: typeof CERTIFICATE_LOAD_FAILED
  payload: Error
}

export const CERTIFICATES_LOADED = 'OFFLINE/CERTIFICATES_LOADED'
export type CertificatesLoadedAction = {
  type: typeof CERTIFICATES_LOADED
  payload: CertificatePayload[]
}

export const CERTIFICATES_LOAD_FAILED = 'OFFLINE/CERTIFICATES_LOAD_FAILED'
export type CertificatesLoadFailedAction = {
  type: typeof CERTIFICATES_LOAD_FAILED
  payload: Error
}
export const UPDATE_OFFLINE_CONFIG = 'OFFLINE/UPDATE_OFFLINE_CONFIG' as const
export type ApplicationConfigUpdatedAction = {
  type: typeof UPDATE_OFFLINE_CONFIG
  payload: { config: IApplicationConfig }
}

export const ANONYMOUS_USER_OFFLINE_CONFIG =
  'OFFLINE/ANONYMOUS_USER_OFFLINE_CONFIG' as const
export type ApplicationConfigAnonymousUserAction = {
  type: typeof ANONYMOUS_USER_OFFLINE_CONFIG
  payload: { anonymousConfig: IApplicationConfigAnonymous }
}

export const UPDATE_OFFLINE_SYSTEMS = 'OFFLINE/UPDATE_OFFLINE_SYSTEMS' as const
export type UpdateOfflineSystemsAction = {
  type: typeof UPDATE_OFFLINE_SYSTEMS
  payload: { systems: System[] }
}

export const APPLICATION_CONFIG_FAILED = 'OFFLINE/APPLICATION_CONFIG_FAILED'
export type ApplicationConfigFailedAction = {
  type: typeof APPLICATION_CONFIG_FAILED
  payload: Error
}

export const GET_EXISTING_OFFLINE_DATA = 'OFFLINE/SET_OFFLINE_DATA'
type SetOfflineData = {
  type: typeof GET_EXISTING_OFFLINE_DATA
  payload: UserDetails
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

export const locationsFailed = (error: Error): LocationsFailedAction => ({
  type: LOCATIONS_FAILED,
  payload: error
})

export const formsLoaded = (
  payload: LoadFormsAndValidatorsResponse
): FormsLoadedAction => ({
  type: FORMS_LOADED,
  payload: payload
})

export const formsFailed = (error: Error): FormsFailedAction => ({
  type: FORMS_FAILED,
  payload: error
})

export const validatorsLoaded = (
  payload: LoadValidatorsResponse
): ValidatorsLoadedAction => ({
  type: VALIDATORS_LOADED,
  payload
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

/*
 * Only called from tests atm
 */
export const setOfflineData = (userDetails: UserDetails): SetOfflineData => ({
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

export const certificateLoaded = (
  payload: CertificatePayload
): CertificateLoadedAction => ({
  type: CERTIFICATE_LOADED,
  payload
})

export const certificateLoadFailed = (
  payload: CertificateLoadFailedAction['payload']
): CertificateLoadFailedAction => ({
  type: CERTIFICATE_LOAD_FAILED,
  payload
})

export const certificatesLoaded = (
  payload: CertificatePayload[]
): CertificatesLoadedAction => ({
  type: CERTIFICATES_LOADED,
  payload
})

export const certificatesLoadFailed = (
  payload: CertificatesLoadFailedAction['payload']
): CertificatesLoadFailedAction => ({
  type: CERTIFICATES_LOAD_FAILED,
  payload
})

export const configAnonymousUserLoaded = (payload: {
  anonymousConfig: IApplicationConfig
}): ApplicationConfigAnonymousUserAction => ({
  type: ANONYMOUS_USER_OFFLINE_CONFIG,
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
export const updateOfflineSystems = (payload: {
  systems: System[]
}): UpdateOfflineSystemsAction => ({
  type: UPDATE_OFFLINE_SYSTEMS,
  payload: payload
})

export const REFRESH_OFFLINE_DATA = 'OFFLINE/REFRESH_OFFLINE_DATA' as const
export const refreshOfflineData = () => ({
  type: REFRESH_OFFLINE_DATA
})

export const UPDATE_OFFLINE_CERTIFICATE = 'OFFLINE/UPDATE_CERTIFICATE'
export type UpdateOfflineCertificateAction = {
  type: typeof UPDATE_OFFLINE_CERTIFICATE
  payload: {
    certificate: ICertificateTemplateData
  }
}

export const updateOfflineCertificate = (
  certificate: ICertificateTemplateData
): UpdateOfflineCertificateAction => ({
  type: UPDATE_OFFLINE_CERTIFICATE,
  payload: {
    certificate
  }
})

export type Action =
  | GetLocations
  | LocationsFailedAction
  | LocationsLoadedAction
  | FormsFailedAction
  | FormsLoadedAction
  | SetOfflineData
  | IGetOfflineDataSuccessAction
  | IGetOfflineDataFailedAction
  | FacilitiesLoadedAction
  | FacilitiesFailedAction
  | PilotLocationsLoadedAction
  | PilotLocationsFailedAction
  | ContentFailedAction
  | ContentLoadedAction
  | ApplicationConfigLoadedAction
  | ApplicationConfigAnonymousUserAction
  | ApplicationConfigFailedAction
  | ApplicationConfigUpdatedAction
  | CertificateLoadedAction
  | CertificateLoadFailedAction
  | CertificatesLoadedAction
  | CertificatesLoadFailedAction
  | UpdateOfflineSystemsAction
  | UpdateOfflineCertificateAction
  | IFilterLocationsAction
  | ReturnType<typeof offlineDataReady>
  | ReturnType<typeof offlineDataUpdated>
  | ReturnType<typeof refreshOfflineData>
