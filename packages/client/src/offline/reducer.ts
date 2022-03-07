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
  loop,
  Cmd,
  Loop,
  liftState,
  getModel,
  getCmd,
  RunCmd
} from 'redux-loop'
import * as actions from '@client/offline/actions'
import * as profileActions from '@client/profile/profileActions'
import { storage } from '@client/storage'
import {
  IDeclarationConfig,
  referenceApi,
  ICertificateTemplateData
} from '@client/utils/referenceApi'
import { ILanguage } from '@client/i18n/reducer'
import { filterLocations, getLocation } from '@client/utils/locationUtils'
import { IFormConfig, ISerializedForm } from '@client/forms'
import { isOfflineDataLoaded, isNationalSystemAdmin } from './selectors'
import { IUserDetails } from '@client/utils/userUtils'
import {
  IPDFTemplate,
  ISVGTemplate
} from '@client/pdfRenderer/transformer/types'
import _ from 'lodash'
import { registerForms } from '@client/forms/register/fieldDefinitions/register'
import { createUserForm } from '@client/forms/user/fieldDefinitions/createUser'

export const OFFLINE_LOCATIONS_KEY = 'locations'
export const OFFLINE_FACILITIES_KEY = 'facilities'

export enum LocationType {
  HEALTH_FACILITY = 'HEALTH_FACILITY',
  CRVS_OFFICE = 'CRVS_OFFICE',
  ADMIN_STRUCTURE = 'ADMIN_STRUCTURE'
}

interface IParsedCertificates {
  birth: {
    svgCode: string
  }
  death: {
    svgCode: string
  }
}
export interface ILocation {
  id: string
  name: string
  alias: string
  address?: string
  physicalType: string
  jurisdictionType?: string
  type: string
  partOf: string
}

interface IForm {
  registerForm: {
    birth: ISerializedForm
    death: ISerializedForm
  }
  userForm: ISerializedForm
}

export interface IOfflineData {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
  pilotLocations: { [key: string]: ILocation }
  languages: ILanguage[]
  forms: IForm
  templates: {
    receipt?: IPDFTemplate
    certificates: {
      birth: ISVGTemplate
      death: ISVGTemplate
    }
  }
  assets: {
    logo: string
  }
  config: IDeclarationConfig
  formConfig: IFormConfig
}

export type IOfflineDataState = {
  offlineData: Partial<IOfflineData>
  offlineDataLoaded: boolean
  loadingError: boolean
  userDetails?: IUserDetails
}

export const initialState: IOfflineDataState = {
  offlineData: {},
  offlineDataLoaded: false,
  loadingError: false
}

async function saveOfflineData(offlineData: IOfflineData) {
  return storage.setItem('offline', JSON.stringify(offlineData))
}

function checkIfDone(
  oldState: IOfflineDataState,
  loopOrState: IOfflineDataState | Loop<IOfflineDataState, actions.Action>
) {
  const loopWithState = liftState(loopOrState)
  const newState = getModel(loopWithState)
  const cmd = getCmd(loopWithState)
  if (
    isOfflineDataLoaded(newState.offlineData) &&
    !oldState.offlineDataLoaded
  ) {
    return loop(
      { ...newState, offlineDataLoaded: true },
      Cmd.list([
        ...(cmd ? [cmd] : []),
        Cmd.run(saveOfflineData, { args: [newState.offlineData] }),
        Cmd.action(actions.offlineDataReady(newState.offlineData))
      ])
    )
  }

  if (
    /*
     * Data was updated with a fresh version from offlineCountryConfig
     */
    isOfflineDataLoaded(oldState.offlineData) &&
    isOfflineDataLoaded(newState.offlineData) &&
    oldState.offlineData !== newState.offlineData
  ) {
    return loop(
      newState,
      Cmd.list([
        ...(cmd ? [cmd] : []),
        Cmd.run(saveOfflineData, { args: [newState.offlineData] }),
        Cmd.action(actions.offlineDataUpdated(newState.offlineData))
      ])
    )
  }

  return loopWithState
}

const FACILITIES_CMD = Cmd.run(() => referenceApi.loadFacilities(), {
  successActionCreator: actions.facilitiesLoaded,
  failActionCreator: actions.facilitiesFailed
})

const LOCATIONS_CMD = Cmd.run(() => referenceApi.loadLocations(), {
  successActionCreator: actions.locationsLoaded,
  failActionCreator: actions.locationsFailed
})

const PILOT_LOCATIONS_CMD = Cmd.run(() => referenceApi.loadPilotLocations(), {
  successActionCreator: actions.pilotLocationsLoaded,
  failActionCreator: actions.pilotLocationsFailed
})

const ASSETS_CMD = Cmd.run(() => referenceApi.loadAssets(), {
  successActionCreator: actions.assetsLoaded,
  failActionCreator: actions.assetsFailed
})

const CONFIG_CMD = Cmd.run(() => referenceApi.loadConfig(), {
  successActionCreator: actions.configLoaded,
  failActionCreator: actions.configFailed
})

const RETRY_TIMEOUT = 5000

function delay(cmd: RunCmd<any>, time: number) {
  return Cmd.list(
    [Cmd.run(() => new Promise((resolve) => setTimeout(resolve, time))), cmd],
    { sequence: true }
  )
}

function getContentCmd(state: IOfflineDataState) {
  // formConfig needs to be passed from the offline reducer to the form reducer and so this is the only way
  return Cmd.run(() => referenceApi.loadContent, {
    successActionCreator: actions.contentLoaded,
    failActionCreator: actions.contentFailed,
    args: [state.offlineData.formConfig]
  })
}

function getDataLoadingCommands(state: IOfflineDataState) {
  return Cmd.list<actions.Action>([
    FACILITIES_CMD,
    LOCATIONS_CMD,
    PILOT_LOCATIONS_CMD,
    getContentCmd(state),
    ASSETS_CMD
  ])
}

function updateGlobalConfig() {
  return Cmd.run(() => {
    // Replaces the script tag in site head with a fresh one
    const currentConfigElement = Array.from(
      document.querySelectorAll('script')
    ).find(({ src }) => src.indexOf('config.js'))!
    const head = document.getElementsByTagName('head')[0]
    const newConfigElement = document.createElement('script')
    newConfigElement.src = currentConfigElement.src.replace(
      /\?.*/,
      '?cachebuster=' + Date.now()
    )
    head.appendChild(newConfigElement)
    head.removeChild(currentConfigElement)
  })
}

/*
 * If offline data is already stored, but we're just not able to update it
 * we retry, but do not show the user an error
 */
function errorIfDataNotLoaded(state: IOfflineDataState) {
  return !isOfflineDataLoaded(state.offlineData)
}

function reducer(
  state: IOfflineDataState,
  action: actions.Action | profileActions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  switch (action.type) {
    // ENTRYPOINT - called from profile reducer
    case profileActions.USER_DETAILS_AVAILABLE: {
      return loop(
        { ...state, userDetails: action.payload },
        Cmd.run(storage.getItem, {
          args: ['offline'],
          successActionCreator: actions.getOfflineDataSuccess,
          // @todo this action isn't handled
          failActionCreator: actions.getOfflineDataFailed
        })
      )
    }
    case actions.REFRESH_OFFLINE_DATA: {
      return loop(
        state,
        Cmd.list([getDataLoadingCommands(state), updateGlobalConfig()])
      )
    }
    case actions.GET_OFFLINE_DATA_SUCCESS: {
      const offlineDataString = action.payload
      const offlineData: IOfflineData = JSON.parse(
        offlineDataString ? offlineDataString : '{}'
      )

      const dataLoadingCmds = getDataLoadingCommands(state)
      const offlineDataLoaded = isOfflineDataLoaded(offlineData)
      if (offlineDataLoaded) {
        return loop(
          {
            ...state,
            offlineData,
            offlineDataLoaded
          },
          Cmd.list([
            // Try loading data regardless as it might have been updated.
            navigator.onLine ? dataLoadingCmds : Cmd.none
          ])
        )
      }
      return loop(state, dataLoadingCmds)
    }

    /*
     * Configurations
     */
    case actions.DECLARATION_CONFIG_LOAD: {
      return loop(state, CONFIG_CMD)
    }
    case actions.DECLARATION_CONFIG_LOADED: {
      _.merge(window.config, action.payload.config)
      const birthCertificateTemplate = _.find(action.payload.certificates, {
        event: 'birth',
        status: 'ACTIVE'
      }) as ICertificateTemplateData

      const deathCertificateTemplate = _.find(action.payload.certificates, {
        event: 'death',
        status: 'ACTIVE'
      }) as ICertificateTemplateData

      const certificatesTemplates = {
        birth: { svgCode: birthCertificateTemplate.svgCode },
        death: { svgCode: deathCertificateTemplate.svgCode }
      } as IParsedCertificates

      const newOfflineData = {
        ...state.offlineData,
        config: action.payload.config,
        templates: {
          certificates: {
            birth: {
              definition: certificatesTemplates.birth.svgCode
            },
            death: {
              definition: certificatesTemplates.birth.svgCode
            }
          }
        }
      }

      return {
        ...state,
        offlineDataLoaded: isOfflineDataLoaded(newOfflineData),
        offlineData: newOfflineData
      }
    }

    case actions.DECLARATION_CONFIG_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(CONFIG_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Definitions
     */

    case actions.CONTENT_LOADED: {
      const defaultFormsConfig = {
        registerForm: registerForms,
        userForm: createUserForm
      }
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          languages: action.payload.languages,
          forms: defaultFormsConfig as IForm
        }
      }
    }
    case actions.CONTENT_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(getContentCmd(state), RETRY_TIMEOUT)
      )
    }

    /*
     * Locations
     */

    case actions.LOCATIONS_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          locations: action.payload
        }
      }
    }
    case actions.LOCATIONS_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(LOCATIONS_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Facilities && Offices
     */

    case actions.FACILITIES_LOADED: {
      const facilities = filterLocations(
        action.payload,
        LocationType.HEALTH_FACILITY
      )

      const offices = filterLocations(
        action.payload,
        LocationType.CRVS_OFFICE,
        {
          locationLevel: 'id',
          locationId: isNationalSystemAdmin(state.userDetails)
            ? undefined
            : state.userDetails &&
              state.userDetails.primaryOffice &&
              state.userDetails.primaryOffice.id
        }
      )
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          facilities,
          offices
        }
      }
    }
    case actions.FACILITIES_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(FACILITIES_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Pilot Locations
     */

    case actions.PILOT_LOCATIONS_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          pilotLocations: action.payload
        }
      }
    }
    case actions.PILOT_LOCATIONS_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(PILOT_LOCATIONS_CMD, RETRY_TIMEOUT)
      )
    }

    /*
     * Assets
     */

    case actions.ASSETS_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          assets: {
            logo: action.payload.logo
          }
        }
      }
    }
    case actions.ASSETS_FAILED: {
      return loop(
        {
          ...state,
          loadingError: errorIfDataNotLoaded(state)
        },
        delay(ASSETS_CMD, RETRY_TIMEOUT)
      )
    }

    case actions.READY: {
      const offlineDataLoaded = isOfflineDataLoaded(action.payload)
      return {
        ...state,
        loadingError: false,
        offlineData: action.payload,
        offlineDataLoaded
      }
    }

    default:
      return state
  }
}

export function offlineDataReducer(
  state: IOfflineDataState | undefined = initialState,
  action: actions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  const newState = reducer(state, action)
  if (action.type !== actions.READY) {
    return checkIfDone(state, newState)
  }
  return newState
}
