import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import * as actions from '@register/offline/actions'
import { storage } from '@register/storage'
import { referenceApi } from '@register/utils/referenceApi'
import * as i18nActions from '@register/i18n/actions'
import { ILanguage, ILanguageState, IntlMessages } from '@register/i18n/reducer'
import { filterLocations, getLocation } from '@register/utils/locationUtils'
import { tempData } from '@register/offline/temp/tempLocations'

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
export const formatLocationLanguageState = (
  locations: ILocation[],
  languages: ILanguageState
): ILanguageState => {
  const primaryLocationMessages: IntlMessages = {}
  const secondaryLocationMessages: IntlMessages = {}
  locations.forEach((location: ILocation) => {
    primaryLocationMessages[`location.${location.id}`] = location.name
    if (Object.keys(languages).length === 2) {
      secondaryLocationMessages[`location.${location.id}`] = location.alias
    }
  })
  Object.keys(languages).forEach((key, index) => {
    if (index === 1) {
      languages[Object.keys(languages)[index]].messages = {
        ...languages[Object.keys(languages)[index]].messages,
        ...secondaryLocationMessages
      }
    } else {
      languages[Object.keys(languages)[index]].messages = {
        ...languages[Object.keys(languages)[index]].messages,
        ...primaryLocationMessages
      }
    }
  })
  return languages
}

export interface IOfflineData {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  languages: ILanguage[]
}

export type IOfflineDataState = {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  healthFacilityFilterLocation: string
  offlineDataLoaded: boolean
  loadingError: boolean
  languages: ILanguage[]
  languageState: ILanguageState
}

export const initialState: IOfflineDataState = {
  locations: {},
  facilities: {},
  languages: [],
  languageState: {},
  // rejected: [],
  // records: [],
  offlineDataLoaded: false,
  loadingError: false,
  healthFacilityFilterLocation: ''
}
// TODO: Union type actions.Action | i18nActions.Action stopped working after upgrade.  Temp replacement of any
export const offlineDataReducer: LoopReducer<IOfflineDataState, any> = (
  state: IOfflineDataState = initialState,
  action: actions.Action
):
  | IOfflineDataState
  | Loop<IOfflineDataState, actions.Action | i18nActions.Action> => {
  let locationLanguageState: ILanguageState
  let facilitesLanguageState: ILanguageState
  switch (action.type) {
    case actions.LANGUAGES_LOADED:
      return loop(
        {
          ...state,
          loadingError: false,
          language: action.payload
        },
        Cmd.list([Cmd.action(i18nActions.storeLanguages(action.payload))])
      )
    case actions.LOAD_LOCATIONS:
      return loop(
        {
          ...state,
          languageState: action.payload
        },
        Cmd.run<actions.LocationsFailedAction, actions.LocationsLoadedAction>(
          referenceApi.loadLocations,
          {
            successActionCreator: actions.locationsLoaded,
            failActionCreator: actions.locationsFailed
          }
        )
      )
    case actions.LANGUAGES_FAILED:
      return loop(
        {
          ...state,
          loadingError: true
        },
        Cmd.run<actions.LocationsFailedAction, actions.LocationsLoadedAction>(
          referenceApi.loadLocations,
          {
            successActionCreator: actions.locationsLoaded,
            failActionCreator: actions.locationsFailed
          }
        )
      )
    case actions.LOCATIONS_LOADED:
      return loop(
        {
          ...state,
          loadingError: false,
          locations: action.payload
        },
        Cmd.run<actions.FacilitiesFailedAction, actions.FacilitiesLoadedAction>(
          referenceApi.loadFacilities,
          {
            successActionCreator: actions.facilitiesLoaded,
            failActionCreator: actions.facilitiesFailed
          }
        )
      )
    case actions.LOCATIONS_FAILED:
      return loop(
        {
          ...state,
          loadingError: true,
          locations: tempData.locations
        },
        Cmd.run<actions.FacilitiesFailedAction, actions.FacilitiesLoadedAction>(
          referenceApi.loadFacilities,
          {
            successActionCreator: actions.facilitiesLoaded,
            failActionCreator: actions.facilitiesFailed
          }
        )
      )
    case actions.FACILITIES_FAILED:
      locationLanguageState = formatLocationLanguageState(
        Object.values(state.locations),
        state.languageState
      )
      facilitesLanguageState = formatLocationLanguageState(
        Object.values(tempData.facilities),
        state.languageState
      )
      return loop(
        {
          ...state,
          loadingError: true,
          offlineDataLoaded: true,
          facilities: tempData.facilities
        },
        Cmd.list([
          Cmd.action(i18nActions.addOfflineData(locationLanguageState)),
          Cmd.action(i18nActions.addOfflineData(facilitesLanguageState))
        ])
      )
    case actions.FACILITIES_LOADED:
      const facilities = filterLocations(
        action.payload,
        state.healthFacilityFilterLocation
      )
      storage.setItem(
        'offline',
        JSON.stringify({
          locations: state.locations,
          languages: state.languages,
          facilities
        })
      )

      locationLanguageState = formatLocationLanguageState(
        Object.values(state.locations),
        state.languageState
      )
      facilitesLanguageState = formatLocationLanguageState(
        Object.values(action.payload),
        state.languageState
      )

      return loop(
        {
          ...state,
          loadingError: false,
          facilities,
          offlineDataLoaded: true
        },
        Cmd.list([
          Cmd.action(i18nActions.addOfflineData(locationLanguageState)),
          Cmd.action(i18nActions.addOfflineData(facilitesLanguageState))
        ])
      )
    case actions.SET_OFFLINE_DATA:
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
          successActionCreator: actions.getOfflineDataSuccess,
          failActionCreator: actions.getOfflineDataFailed,
          args: ['offline']
        })
      )
    case actions.GET_OFFLINE_DATA_SUCCESS:
      const offlineDataString = action.payload
      const offlineData: IOfflineData = JSON.parse(
        offlineDataString ? offlineDataString : '{}'
      )

      if (
        offlineData.locations &&
        offlineData.facilities &&
        offlineData.languages
      ) {
        return loop(
          {
            ...state,
            locations: offlineData.locations,
            facilities: offlineData.facilities,
            languages: offlineData.languages,
            offlineDataLoaded: true
          },
          Cmd.list([
            Cmd.action(i18nActions.storeOfflineLanguages(offlineData.languages))
          ])
        )
      } else {
        return loop(
          {
            ...state
          },
          Cmd.run<actions.LanguagesFailedAction, actions.LanguagesLoadedAction>(
            referenceApi.loadLanguages,
            {
              successActionCreator: actions.languagesLoaded,
              failActionCreator: actions.languagesFailed
            }
          )
        )
      }

    case actions.FORMAT_LOCATIONS:
      locationLanguageState = formatLocationLanguageState(
        Object.values(state.locations),
        action.payload
      )
      facilitesLanguageState = formatLocationLanguageState(
        Object.values(state.facilities),
        action.payload
      )
      return loop(
        {
          ...state,
          languageState: action.payload
        },
        Cmd.list([
          Cmd.action(i18nActions.addOfflineData(locationLanguageState)),
          Cmd.action(i18nActions.addOfflineData(facilitesLanguageState))
        ])
      )
    default:
      return state
  }
}
