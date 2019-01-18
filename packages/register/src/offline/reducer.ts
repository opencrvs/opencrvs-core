import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import * as actions from './actions'
import { storage } from 'src/storage'
import { referenceApi } from 'src/utils/referenceApi'
import * as i18nActions from 'src/i18n/actions'
import { ILanguageState, languages, IntlMessages } from 'src/i18n/reducer'

export const OFFLINE_LOCATIONS_KEY = 'locations'

export interface ILocation {
  id: string
  name: string
  nameBn: string
  physicalType: string
  jurisdictionType: string
  type: string
  partOf: string
}

export const formatLocationLanguageState = (
  locations: ILocation[]
): ILanguageState => {
  const enMessages: IntlMessages = {}
  const bnMessages: IntlMessages = {}
  locations.forEach((location: ILocation) => {
    enMessages[`location.${location.id}`] = location.name
    bnMessages[`location.${location.id}`] = location.nameBn
  })
  languages.en.messages = { ...languages.en.messages, ...enMessages }
  languages.bn.messages = { ...languages.bn.messages, ...bnMessages }
  return languages
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
  actions.Action | i18nActions.Action
> = (
  state: IOfflineDataState = initialState,
  action: actions.Action
):
  | IOfflineDataState
  | Loop<IOfflineDataState, actions.Action | i18nActions.Action> => {
  let locationLanguageState: ILanguageState
  switch (action.type) {
    case actions.STORE_OFFLINE_DATA:
      locationLanguageState = formatLocationLanguageState(
        action.payload.locations
      )
      return loop(
        {
          ...state,
          locations: action.payload.locations
        },
        Cmd.action(i18nActions.addOfflineData(locationLanguageState))
      )
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
      locationLanguageState = formatLocationLanguageState(action.payload)
      return loop(
        {
          ...state,
          loadingError: false,
          locations: action.payload,
          offlineDataLoaded: true
        },
        Cmd.action(i18nActions.addOfflineData(locationLanguageState))
      )
    default:
      return state
  }
}
