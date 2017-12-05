/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:17:14
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-11 17:30:13
 */
import {
  REQUEST_MAPVIEW_DATA,
  MAPVIEW_DATA_SUCCESS,
  MAPVIEW_MAPDATA_SUCCESS,
  REGION_SELECTED,
  COUNTRY_SELECTED,
  EVENT_SELECTED,
  PERIOD_SELECTED,
  SET_TOOLTIP_MAP_DATA,
  REMOVE_TOOLTIP_MAP_DATA,
  SET_REGION_MANAGER,
  SET_DISTRICT_MANAGER,
  SET_LIST_FILTER,
  SET_LIST_ORDER,
  CASE_TRACKING,
  CASE_TRACKING_CLEAR,
  PERFORMANCE_METRICS,
  RATES_MODAL_TOGGLE,
} from '../actions/manager-actions';

function managerReducer(
  state = {
    mapEvent: 'birth',
    mapTimePeriod: 'This year',
    mapLocations: '',
    fetchingMapView: false,
    subLocations: null,
    selectedLocation: null,
    selectedRegion: null,
    countryMapData: null,
    countryLocation: null,
    regionMapData: [],
    selectedLocationMapData: null,
    countryLevel: true,
    regionLevel: false,
    districtLevel:false,
    rolloverMapData: null,
    totalCerts: null,
    regionManager: null,
    districtManager: null,
    countryManager: null,
    listFilter: 'none',
    listOrder: 'asc',
    caseData: null,
    caseNotes: null,
    caseGraphData: null,
    performanceData: null,
    ratesOverTimeModal: 0,
    registrationRateData: [
      {name: 'January', percentage: 45},
      {name: 'February', percentage: 56},
      {name: 'March', percentage: 50},
      {name: 'April', percentage: 67},
      {name: 'May', percentage: 63},
      {name: 'June', percentage: 67},
      {name: 'July', percentage: 56},
      {name: 'August', percentage: 64},
      {name: 'September', percentage: 67},
      {name: 'October', percentage: 65},
      {name: 'November', percentage: 69},
      {name: 'December', percentage: 70},
    ],
  },
  action
) {
  switch (action.type) {
    case REQUEST_MAPVIEW_DATA:
      return {
        ...state,
        fetchingMapView: true,
      };
    case MAPVIEW_DATA_SUCCESS:
      return {
        ...state,
        fetchingMapView: false,
        mapLocations: action.mapLocations,
        subLocations: action.subLocations,
        selectedLocation: action.selectedLocation,
        countryLocation: action.selectedLocation,
        totalCerts: action.totalCerts,
        countryManager: action.countryManager,
        performanceData: action.performanceData,
      };
    case MAPVIEW_MAPDATA_SUCCESS:
      return {
        ...state,
        countryMapData: action.countryMapData,
        regionMapData: action.regionMapData,
        selectedLocationMapData: action.countryMapData,
      };
    case REGION_SELECTED:
      return {
        ...state,
        selectedLocation: action.selectedLocation,
        selectedRegion: action.selectedRegion,
        countryLevel: false,
        regionLevel: true,
        districtLevel:false,
        selectedLocationMapData: action.selectedLocationMapData,
        totalCerts: action.totalCerts,
      };
    case COUNTRY_SELECTED:
      return {
        ...state,
        selectedLocation: state.countryLocation,
        selectedRegion: null,
        countryLevel: true,
        regionLevel: false,
        districtLevel:false,
        selectedLocationMapData: state.countryMapData,
        totalCerts: action.totalCerts,
      };
    case EVENT_SELECTED:
      return {
        ...state,
        mapEvent: action.mapEvent,
        totalCerts: action.totalCerts,
      };
    case PERIOD_SELECTED:
      return {
        ...state,
        mapTimePeriod: action.mapTimePeriod,
        totalCerts: action.totalCerts,
      };
    case SET_TOOLTIP_MAP_DATA:
      return {
        ...state,
        rolloverMapData: action.rolloverMapData,
      };
    case REMOVE_TOOLTIP_MAP_DATA:
      return {
        ...state,
        rolloverMapData: null,
      };
    case SET_REGION_MANAGER:
      return {
        ...state,
        regionManager: action.regionManager,
      };
    case SET_DISTRICT_MANAGER:
      return {
        ...state,
        districtManager: action.districtManager,
      };
    case SET_LIST_FILTER:
      return {
        ...state,
        listFilter: action.listFilter,
      };
    case SET_LIST_ORDER:
      return {
        ...state,
        listOrder: action.listOrder,
      };
    case CASE_TRACKING:
      return {
        ...state,
        caseData: action.caseData,
        caseNotes: action.caseNotes,
        caseGraphData: action.caseGraphData,
      };
    case CASE_TRACKING_CLEAR:
      return {
        ...state,
        caseData: null,
        caseNotes: null,
        caseGraphData: null,
      };
    case PERFORMANCE_METRICS:
      return {
        ...state,
        performanceData: action.performanceData,
      };
    case RATES_MODAL_TOGGLE:
      return { ...state, ratesOverTimeModal: state.ratesOverTimeModal == 0 ? 1 : 0 };
    default:
      return state;
  }
}

export default managerReducer;
