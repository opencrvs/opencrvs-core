/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:14 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-10 16:43:53
 */
import {
  REQUEST_MAPVIEW_DATA,
  MAPVIEW_DATA_SUCCESS,
  MAPVIEW_MAPDATA_SUCCESS,
  REGION_SELECTED,
  COUNTRY_SELECTED,
  EVENT_SELECTED,
  PERIOD_SELECTED,
  UPDATE_ORIGIN,
  SET_TOOLTIP_MAP_DATA,
  REMOVE_TOOLTIP_MAP_DATA,
  SET_REGION_MANAGER,
  SET_DISTRICT_MANAGER,
  SET_LIST_FILTER,
  SET_LIST_ORDER,
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
    originX: null,
    originY: null,
    rolloverMapData: null,
    totalCerts: null,
    regionManager: null,
    districtManager: null,
    countryManager: null,
    listFilter: 'none',
    listOrder: 'asc',
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
    case UPDATE_ORIGIN:
      return {
        ...state,
        originX: action.originX,
        originY: action.originY,
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
    default:
      return state;
  }
}

export default managerReducer;
