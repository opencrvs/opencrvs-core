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
  IApplicationConfigAnonymous
} from '@client/utils/referenceApi'
import { System } from '@client/utils/gateway'
import { IFormDraft } from '@client/forms/configuration/formDrafts/utils'
import { IFormConfig, IFormDataSet } from '@client/forms'
import { IQuestionConfig } from '@client/forms/questionConfig'
import { UserDetails } from '@client/utils/userUtils'

const GET_LOCATIONS = 'OFFLINE/GET_LOCATIONS'
type GetLocations = {
  type: typeof GET_LOCATIONS
  payload: string
}

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
  payload: { [key: string]: ILocation }
}

export const LOCATIONS_FAILED = 'OFFLINE/LOCATIONS_FAILED'
type LocationsFailedAction = {
  type: typeof LOCATIONS_FAILED
  payload: Error
}

export const FACILITIES_LOADED = 'OFFLINE/FACILITIES_LOADED'
type FacilitiesLoadedAction = {
  type: typeof FACILITIES_LOADED
  payload: { [key: string]: ILocation }
}

export const FACILITIES_FAILED = 'OFFLINE/FACILITIES_FAILED'
type FacilitiesFailedAction = {
  type: typeof FACILITIES_FAILED
  payload: Error
}

const PILOT_LOCATIONS_LOADED = 'OFFLINE/PILOT_LOCATIONS_LOADED'
type PilotLocationsLoadedAction = {
  type: typeof PILOT_LOCATIONS_LOADED
  payload: { [key: string]: ILocation }
}

const PILOT_LOCATIONS_FAILED = 'OFFLINE/PILOT_LOCATIONS_FAILED'
type PilotLocationsFailedAction = {
  type: typeof PILOT_LOCATIONS_FAILED
  payload: Error
}

export const APPLICATION_CONFIG_LOADED = 'OFFLINE/APPLICATION_CONFIG_LOADED'
type ApplicationConfigLoadedAction = {
  type: typeof APPLICATION_CONFIG_LOADED
  payload: IApplicationConfigResponse
}

export const CERTIFICATE_LOADED = 'OFFLINE/CERTIFICATE_LOADED'
type CertificateLoadedAction = {
  type: typeof CERTIFICATE_LOADED
  payload: CertificatePayload
}

const CERTIFICATE_LOAD_FAILED = 'OFFLINE/CERTIFICATE_LOAD_FAILED'
type CertificateLoadFailedAction = {
  type: typeof CERTIFICATE_LOAD_FAILED
  payload: Error
}

export const CERTIFICATES_LOADED = 'OFFLINE/CERTIFICATES_LOADED'
type CertificatesLoadedAction = {
  type: typeof CERTIFICATES_LOADED
  payload: CertificatePayload[]
}

export const CERTIFICATES_LOAD_FAILED = 'OFFLINE/CERTIFICATES_LOAD_FAILED'
type CertificatesLoadFailedAction = {
  type: typeof CERTIFICATES_LOAD_FAILED
  payload: Error
}
export const UPDATE_OFFLINE_CONFIG = 'OFFLINE/UPDATE_OFFLINE_CONFIG' as const
type ApplicationConfigUpdatedAction = {
  type: typeof UPDATE_OFFLINE_CONFIG
  payload: { config: IApplicationConfig }
}

export const ANONYMOUS_USER_OFFLINE_CONFIG =
  'OFFLINE/ANONYMOUS_USER_OFFLINE_CONFIG' as const
type ApplicationConfigAnonymousUserAction = {
  type: typeof ANONYMOUS_USER_OFFLINE_CONFIG
  payload: { anonymousConfig: IApplicationConfigAnonymous }
}

export const UPDATE_OFFLINE_SYSTEMS = 'OFFLINE/UPDATE_OFFLINE_SYSTEMS' as const
type UpdateOfflineSystemsAction = {
  type: typeof UPDATE_OFFLINE_SYSTEMS
  payload: { systems: System[] }
}

export const APPLICATION_CONFIG_FAILED = 'OFFLINE/APPLICATION_CONFIG_FAILED'
type ApplicationConfigFailedAction = {
  type: typeof APPLICATION_CONFIG_FAILED
  payload: Error
}

const GET_EXISTING_OFFLINE_DATA = 'OFFLINE/SET_OFFLINE_DATA'
type SetOfflineData = {
  type: typeof GET_EXISTING_OFFLINE_DATA
  payload: UserDetails
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
const FORMAT_LOCATIONS = 'OFFLINE/FORMAT_LOCATIONS'
type IFilterLocationsAction = {
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

export const UPDATE_OFFLINE_FORM_CONFIG = 'OFFLINE/UPDATE_FORM_CONFIG'
type UpdateOfflineFormConfigAction = {
  type: typeof UPDATE_OFFLINE_FORM_CONFIG
  payload: {
    formDrafts: IFormDraft[]
    questionConfig?: IQuestionConfig[]
    formDataset?: IFormDataSet[]
  }
}

export const UPDATE_OFFLINE_CERTIFICATE = 'OFFLINE/UPDATE_CERTIFICATE'
type UpdateOfflineCertificateAction = {
  type: typeof UPDATE_OFFLINE_CERTIFICATE
  payload: {
    certificate: ICertificateTemplateData
  }
}

export const updateOfflineFormConfig = (
  formDrafts: IFormDraft[],
  questionConfig?: IQuestionConfig[],
  formDataset?: IFormDataSet[]
): UpdateOfflineFormConfigAction => ({
  type: UPDATE_OFFLINE_FORM_CONFIG,
  payload: {
    formDrafts,
    questionConfig,
    formDataset
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
type OfflineFormConfigUpdatedAction = {
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

export const OFFLINE_FORM_CONFIG_ADD_FORM_DATASET =
  'OFFLINE/FORM_CONFIG_ADD_FORM_DATASET'
type OfflineFormConfigAddFormDatasetAction = {
  type: typeof OFFLINE_FORM_CONFIG_ADD_FORM_DATASET
  payload: {
    formDatasetItem: IFormDataSet
  }
}
export const offlineFormConfigAddFormDataset = (
  formDatasetItem: IFormDataSet
): OfflineFormConfigAddFormDatasetAction => ({
  type: OFFLINE_FORM_CONFIG_ADD_FORM_DATASET,
  payload: {
    formDatasetItem
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
  | ApplicationConfigLoadedAction
  | ApplicationConfigAnonymousUserAction
  | ApplicationConfigFailedAction
  | ApplicationConfigUpdatedAction
  | CertificateLoadedAction
  | CertificateLoadFailedAction
  | CertificatesLoadedAction
  | CertificatesLoadFailedAction
  | UpdateOfflineSystemsAction
  | UpdateOfflineFormConfigAction
  | UpdateOfflineCertificateAction
  | OfflineFormConfigUpdatedAction
  | OfflineFormConfigAddFormDatasetAction
  | IFilterLocationsAction
  | ReturnType<typeof offlineDataReady>
  | ReturnType<typeof offlineDataUpdated>
  | ReturnType<typeof refreshOfflineData>
