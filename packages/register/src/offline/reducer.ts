import { loop, Cmd, Loop, liftState, getModel, getCmd } from 'redux-loop'
import * as actions from '@register/offline/actions'
import * as profileActions from '@register/profile/profileActions'
import { storage } from '@register/storage'
import { referenceApi } from '@register/utils/referenceApi'
import { ILanguage } from '@register/i18n/reducer'
import { filterLocations, getLocation } from '@register/utils/locationUtils'
import { tempData } from '@register/offline/temp/tempLocations'
import { ISerializedForm } from '@register/forms'
import { isOfflineDataLoaded } from './selectors'
import { IUserDetails } from '@register/utils/userUtils'

export const OFFLINE_LOCATIONS_KEY = 'locations'
export const OFFLINE_FACILITIES_KEY = 'facilities'

export interface ILocation {
  id: string
  name: string
  alias: string
  physicalType: string
  jurisdictionType?: string
  type: string
  partOf: string
}

export interface IOfflineData {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  languages: ILanguage[]
  forms: {
    // @todo this is also used in review, so it could be named just form
    registerForm: {
      birth: ISerializedForm
      death: ISerializedForm
    }
  }
  assets: {
    logo: string
  }
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
    (!oldState.offlineDataLoaded ||
      oldState.offlineData !== newState.offlineData)
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
  return loopWithState
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
    case actions.GET_OFFLINE_DATA_SUCCESS: {
      const offlineDataString = action.payload
      const offlineData: IOfflineData = JSON.parse(
        offlineDataString ? offlineDataString : '{}'
      )

      const dataLoadingCmds = Cmd.list<actions.Action>([
        Cmd.run(referenceApi.loadFacilities, {
          successActionCreator: actions.facilitiesLoaded,
          failActionCreator: actions.facilitiesFailed
        }),
        Cmd.run(referenceApi.loadLocations, {
          successActionCreator: actions.locationsLoaded,
          failActionCreator: actions.locationsFailed
        }),
        Cmd.run(referenceApi.loadDefinitions, {
          successActionCreator: actions.definitionsLoaded,
          failActionCreator: actions.definitionsFailed
        }),
        Cmd.run(referenceApi.loadAssets, {
          successActionCreator: actions.assetsLoaded,
          failActionCreator: actions.assetsFailed
        })
      ])

      if (isOfflineDataLoaded(offlineData)) {
        return loop(
          {
            ...state,
            offlineData
          },
          Cmd.list([
            // Try loading data regardless as it might have been updated.
            !state.offlineDataLoaded ? dataLoadingCmds : Cmd.none
          ])
        )
      }
      return loop(state, dataLoadingCmds)
    }

    /*
     * Definitions
     */

    case actions.DEFINITIONS_LOADED: {
      return {
        ...state,
        loadingError: false,
        offlineData: {
          ...state.offlineData,
          languages: action.payload.languages,
          forms: action.payload.forms
        }
      }
    }
    case actions.DEFINITIONS_FAILED: {
      return {
        ...state,
        loadingError: true
      }
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
      return {
        ...state,
        loadingError: true,
        offlineData: {
          ...state.offlineData,
          locations: tempData.locations
        }
      }
    }

    /*
     * Facilities
     */

    case actions.FACILITIES_LOADED: {
      const facilities = filterLocations(
        action.payload,
        getLocation(state.userDetails!, window.config.HEALTH_FACILITY_FILTER)
      )

      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          facilities
        }
      }
    }
    case actions.FACILITIES_FAILED: {
      return {
        ...state,
        loadingError: true,
        offlineData: {
          ...state.offlineData,
          facilities: tempData.facilities
        }
      }
    }

    /*
     * Assets
     */

    case actions.ASSETS_LOADED: {
      return {
        ...state,
        loadingError: false,
        offlineData: {
          ...state.offlineData,
          assets: {
            logo: action.payload.logo
          }
        }
      }
    }
    case actions.ASSETS_FAILED: {
      return {
        ...state,
        loadingError: true
      }
    }

    case actions.READY: {
      return {
        ...state,
        offlineData: action.payload
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
