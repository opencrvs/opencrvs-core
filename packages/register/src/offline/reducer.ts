import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import * as actions from './actions'
import { storage } from 'src/storage'
import { referenceApi } from 'src/utils/referenceApi'

export interface ILocation {
  id: string
  name: string
  nameBn: string
  physicalType: string
  juristictionType: string
  type: string
  partOf: string
}

export interface IOfflineData {
  locations: ILocation[]
}

export type IOfflineDataState = {
  locations: ILocation[]
  offlineDataLoaded: boolean
  loadingError: boolean
}

export const initialState: IOfflineDataState = {
  locations: [],
  offlineDataLoaded: false,
  loadingError: false
}

export const offlineDataReducer: LoopReducer<
  IOfflineDataState,
  actions.Action
> = (
  state: IOfflineDataState = initialState,
  action: actions.Action
): IOfflineDataState | Loop<IOfflineDataState, actions.Action> => {
  switch (action.type) {
    case actions.STORE_OFFLINE_DATA:
      return {
        ...state,
        locations: action.payload.locations
      }
    case actions.LOAD_OFFLINE_DATA:
      return loop(
        {
          ...state
        },
        Cmd.run<actions.LocationsLoadedAction | actions.LocationsFailedAction>(
          referenceApi.loadLocations,
          {
            successActionCreator: actions.locationsLoaded,
            failActionCreator: actions.locationsFailed
          }
        )
      )
    case actions.LOCATIONS_FAILED:
      return { ...state, loadingError: true }
    case actions.LOCATIONS_LOADED:
      storage.setItem('offline', JSON.stringify({ locations: action.payload }))
      return {
        ...state,
        loadingError: false,
        locations: action.payload,
        offlineDataLoaded: true
      }
    default:
      return state
  }
}
