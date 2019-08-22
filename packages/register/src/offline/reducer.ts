import { loop, Cmd, Loop, liftState, getModel, getCmd } from 'redux-loop'
import * as actions from '@register/offline/actions'
import { storage } from '@register/storage'
import { referenceApi } from '@register/utils/referenceApi'
import { ILanguage } from '@register/i18n/reducer'
import { filterLocations, getLocation } from '@register/utils/locationUtils'
import { tempData } from '@register/offline/temp/tempLocations'
import { ISerializedForm } from '@register/forms'
import { isOfflineDataLoaded } from './selectors'

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
    registerForm: {
      birth: ISerializedForm
      death: ISerializedForm
    }
  }
}

export type IOfflineDataState = {
  offlineData: Partial<IOfflineData>
  healthFacilityFilterLocation: string
  offlineDataLoaded: boolean
  loadingError: boolean
}

export const initialState: IOfflineDataState = {
  offlineData: {},
  offlineDataLoaded: false,
  loadingError: false,
  healthFacilityFilterLocation: ''
}

function checkIfDone(
  loopOrState: IOfflineDataState | Loop<IOfflineDataState, actions.Action>
) {
  const loopWithState = liftState(loopOrState)
  const newState = getModel(loopWithState)
  const cmd = getCmd(loopWithState)

  if (
    isOfflineDataLoaded(newState.offlineData) &&
    !newState.offlineDataLoaded
  ) {
    return loop(
      { ...newState, offlineDataLoaded: true },
      Cmd.list([
        ...(cmd ? [cmd] : []),
        Cmd.action(actions.offlineDataReady(newState.offlineData))
      ])
    )
  }
  return loopWithState
}

function reducer(
  state: IOfflineDataState = initialState,
  action: actions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  switch (action.type) {
    // entrypoint - called from profile reducer
    // @todo, remove profile reducers dependency to this reducer
    case actions.SET_OFFLINE_DATA: {
      return loop(
        {
          ...state,
          healthFacilityFilterLocation: getLocation(
            action.payload,
            window.config.HEALTH_FACILITY_FILTER
          )
        },
        Cmd.run<
          actions.IGetOfflineDataFailedAction,
          actions.IGetOfflineDataSuccessAction
        >(storage.getItem, {
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

      if (isOfflineDataLoaded(offlineData)) {
        const newState = {
          ...state,
          offlineData,
          offlineDataLoaded: true
        }
        return loop(
          newState,
          Cmd.action(actions.offlineDataReady(newState.offlineData))
        )
      } else {
        return loop(
          state,
          Cmd.list<actions.Action>([
            Cmd.run(referenceApi.loadLanguages, {
              successActionCreator: actions.languagesLoaded,
              failActionCreator: actions.languagesFailed
            }),
            Cmd.run(referenceApi.loadFacilities, {
              successActionCreator: actions.facilitiesLoaded,
              failActionCreator: actions.facilitiesFailed
            }),
            Cmd.run(referenceApi.loadLocations, {
              successActionCreator: actions.locationsLoaded,
              failActionCreator: actions.locationsFailed
            }),
            Cmd.run(referenceApi.loadForms, {
              successActionCreator: actions.formsLoaded,
              failActionCreator: actions.formsFailed
            })
          ])
        )
      }
    }

    /*
     * Languages
     */

    case actions.LANGUAGES_LOADED: {
      return {
        ...state,
        loadingError: false,
        offlineData: {
          ...state.offlineData,
          languages: action.payload
        }
      }
    }
    case actions.LANGUAGES_FAILED: {
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
     * Forms
     */

    case actions.FORMS_LOADED: {
      return {
        ...state,
        offlineData: {
          ...state.offlineData,
          forms: {
            registerForm: action.payload
          }
        }
      }
    }
    case actions.FORMS_FAILED: {
      return {
        ...state,
        loadingError: true
      }
    }

    /*
     * Facilities
     */

    case actions.FACILITIES_LOADED: {
      const facilities = filterLocations(
        action.payload,
        state.healthFacilityFilterLocation
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
    default:
      return state
  }
}

export function offlineDataReducer(
  state: IOfflineDataState | undefined,
  action: actions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> {
  return checkIfDone(reducer(state, action))
}
