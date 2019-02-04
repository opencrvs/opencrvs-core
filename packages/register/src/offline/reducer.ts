import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import * as actions from './actions'
import { storage } from 'src/storage'
import { referenceApi } from 'src/utils/referenceApi'
import * as i18nActions from 'src/i18n/actions'
import { ILanguageState, languages, IntlMessages } from 'src/i18n/reducer'
import { getUserLocation } from 'src/utils/userUtils'
import { filterLocations } from 'src/utils/locationUtils'
import { tempData } from 'src/offline/temp/tempLocations'

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
  locations: ILocation[]
  facilities: ILocation[]
}

export type IOfflineDataState = {
  locations: ILocation[]
  facilities: ILocation[]
  healthFacilityFilterLocation: string
  offlineDataLoaded: boolean
  loadingError: boolean
}

export const initialState: IOfflineDataState = {
  locations: [],
  facilities: [],
  // rejected: [],
  // records: [],
  offlineDataLoaded: false,
  loadingError: false,
  healthFacilityFilterLocation: ''
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
  let facilitesLanguageState: ILanguageState
  switch (action.type) {
    case actions.LOCATIONS_FAILED:
      return loop(
        {
          ...state,
          loadingError: true,
          locations: tempData.locations
        },
        Cmd.run<
          actions.FacilitiesLoadedAction | actions.FacilitiesFailedAction
        >(referenceApi.loadFacilities, {
          successActionCreator: actions.facilitiesLoaded,
          failActionCreator: actions.facilitiesFailed
        })
      )
    case actions.FACILITIES_FAILED:
      locationLanguageState = formatLocationLanguageState(state.locations)
      facilitesLanguageState = formatFacilitiesLanguageState(
        tempData.facilities
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
        Cmd.run<
          actions.FacilitiesLoadedAction | actions.FacilitiesFailedAction
        >(referenceApi.loadFacilities, {
          successActionCreator: actions.facilitiesLoaded,
          failActionCreator: actions.facilitiesFailed
        })
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
      locationLanguageState = formatLocationLanguageState(state.locations)

      facilitesLanguageState = formatFacilitiesLanguageState(action.payload)
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
          | actions.IGetOfflineDataSuccessAction
          | actions.IGetOfflineDataFailedAction
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
          offlineData.locations
        )
        facilitesLanguageState = formatFacilitiesLanguageState(
          offlineData.facilities
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
          Cmd.run<
            actions.LocationsLoadedAction | actions.LocationsFailedAction
          >(referenceApi.loadLocations, {
            successActionCreator: actions.locationsLoaded,
            failActionCreator: actions.locationsFailed
          })
        )
      }

    default:
      return state
  }
}
