/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-03 13:25:38
 */
export const REQUEST_MAPVIEW_DATA = 'REQUEST_MAPVIEW_DATA';
export const MAPVIEW_DATA_SUCCESS = 'MAPVIEW_DATA_SUCCESS';
export const MAPVIEW_MAPDATA_SUCCESS = 'MAPVIEW_MAPDATA_SUCCESS';
export const REGION_SELECTED = 'REGION_SELECTED';

import { apiMiddleware } from 'utils/api-middleware';
import { selectWorkView } from 'actions/global-actions';
import { BASE_URL } from 'constants/urls';
import { feature } from 'topojson-client';
import { filter, head } from 'lodash';

export function fetchMapViewData() {
  
  return dispatch => {
    dispatch(requestMapViewData());
    const config = {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };
    
    apiMiddleware(config, BASE_URL + 'manager', dispatch).then(items => {
      dispatch(mapViewDataSuccess(items));
      dispatch(getMapData());
      dispatch(selectWorkView('manager'));
    });
  };
}

export function getMapData() {
  
  return (dispatch, getState) => {
    const {country, regions } = getState().globalReducer;
    const config = {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };
    apiMiddleware(config, BASE_URL + 'maps/' + country, null).then(response => {
      const countryMapData = feature(response, response.objects.country).features;
      const subPromises = [];
      subPromises.push();
      regions.forEach((region) => {
        subPromises.push(apiMiddleware(config, BASE_URL + 'maps/' + country + '/' + region, null));
      });
      const regionMapData = [];
      Promise.all(subPromises).then(regionMaps => {
        regionMaps.forEach((regionMap) => {
          regionMapData.push(feature(regionMap, regionMap.objects.region).features);
        });
        dispatch(setMapViewMapData(countryMapData, regionMapData));
      });
    });
    
  };
}

function setMapViewMapData(countryMapData, regionMapData) {
  return {
    type: MAPVIEW_MAPDATA_SUCCESS,
    countryMapData,
    regionMapData,
  };
}

function mapViewDataSuccess(mapLocations) {
  const selectedLocation = mapLocations.country;
  const subLocations = mapLocations.country.subEntries.entries;
  return {
    type: MAPVIEW_DATA_SUCCESS,
    mapLocations,
    selectedLocation,
    subLocations,
  };
}

function requestMapViewData() {
  return {
    type: REQUEST_MAPVIEW_DATA,
  };
}

export function selectRegion(name) {
  return (dispatch, getState) => {
    const { mapLocations } = getState().managerReducer;
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const obj = head(filter(mapLocations.country.subEntries.entries, {title: title}));
    dispatch(regionSelected(obj));
  }
}

function regionSelected(obj) {
  return {
    type: REGION_SELECTED,
    selectedLocation: obj,
  };
}

