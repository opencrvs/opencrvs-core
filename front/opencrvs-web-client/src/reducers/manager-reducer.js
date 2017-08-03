/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:14 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 22:09:22
 */
import {
  REQUEST_MAPVIEW_DATA,
  MAPVIEW_DATA_SUCCESS,
  MAPVIEW_MAPDATA_SUCCESS,
} from '../actions/manager-actions';

function managerReducer(
  state = {
    mapLocations: '',
    fetchingMapView: false,
    subLocations: null,
    selectedLocation: null,
    countryMapData: null,
    regionMapData: [],
    selectedLocationMapData: null,
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
      };
    case MAPVIEW_MAPDATA_SUCCESS:
      return {
        ...state,
        countryMapData: action.countryMapData,
        regionMapData: action.regionMapData,
        selectedLocationMapData: action.countryMapData,
      };
    default:
      return state;
  }
}

export default managerReducer;
