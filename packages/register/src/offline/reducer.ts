import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import * as actions from '@register/offline/actions'
import { storage } from '@register/storage'
import { referenceApi } from '@register/utils/referenceApi'
import * as i18nActions from '@register/i18n/actions'
import { ILanguageState, languages, IntlMessages } from '@register/i18n/reducer'
import { getUserLocation } from '@register/utils/userUtils'
import { filterLocations } from '@register/utils/locationUtils'
import { tempData } from '@register/offline/temp/tempLocations'

export const OFFLINE_LOCATIONS_KEY = 'locations'
export const OFFLINE_FACILITIES_KEY = 'facilities'

export interface ILocation {
  id: string
  name: string
  nameBn: string
  physicalType: string
  jurisdictionType?: string
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

export const formatFacilitiesLanguageState = (
  facilities: ILocation[]
): ILanguageState => {
  const enMessages: IntlMessages = {}
  const bnMessages: IntlMessages = {}
  facilities.forEach((facility: ILocation) => {
    enMessages[`facility.${facility.id}`] = facility.name
    bnMessages[`facility.${facility.id}`] = facility.nameBn
  })
  languages.en.messages = { ...languages.en.messages, ...enMessages }
  languages.bn.messages = { ...languages.bn.messages, ...bnMessages }
  return languages
}

export interface IOfflineData {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
}

export type IOfflineDataState = {
  locations: { [key: string]: ILocation }
  facilities: { [key: string]: ILocation }
  healthFacilityFilterLocation: string
  offlineDataLoaded: boolean
  loadingError: boolean
}

export const initialState: IOfflineDataState = {
  locations: {},
  facilities: {},
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
        Object.values(state.locations)
      )
      facilitesLanguageState = formatFacilitiesLanguageState(
        Object.values(tempData.facilities)
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
    case actions.FACILITIES_LOADED:
      const facilities = filterLocations(
        action.payload,
        state.healthFacilityFilterLocation
      )
      storage.setItem(
        'offline',
        JSON.stringify({
          locations: state.locations,
          facilities
        })
      )

      locationLanguageState = formatLocationLanguageState(
        Object.values(state.locations)
      )
      facilitesLanguageState = formatFacilitiesLanguageState(
        Object.values(action.payload)
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
          healthFacilityFilterLocation: getUserLocation(
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

      if (offlineData.locations && offlineData.facilities) {
        locationLanguageState = formatLocationLanguageState(
          Object.values(offlineData.locations)
        )
        facilitesLanguageState = formatFacilitiesLanguageState(
          Object.values(offlineData.facilities)
        )
        return loop(
          {
            ...state,
            locations: offlineData.locations,
            facilities: offlineData.facilities,
            offlineDataLoaded: true
          },
          Cmd.list([
            Cmd.action(i18nActions.addOfflineData(locationLanguageState)),
            Cmd.action(i18nActions.addOfflineData(facilitesLanguageState))
          ])
        )
      } else {
        return loop(
          {
            ...state
          },
          Cmd.run<actions.LocationsFailedAction, actions.LocationsLoadedAction>(
            referenceApi.loadLocations,
            {
              successActionCreator: actions.locationsLoaded,
              failActionCreator: actions.locationsFailed
            }
          )
        )
      }

    default:
      return state
  }
}
