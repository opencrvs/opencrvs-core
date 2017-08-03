/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 22:40:39
 */
export const REQUEST_MAPVIEW_DATA = 'REQUEST_MAPVIEW_DATA';
export const MAPVIEW_DATA_SUCCESS = 'MAPVIEW_DATA_SUCCESS';
export const MAPVIEW_MAPDATA_SUCCESS = 'MAPVIEW_MAPDATA_SUCCESS';
import { apiMiddleware } from 'utils/api-middleware';
import { selectWorkView } from 'actions/global-actions';
import { BASE_URL } from 'constants/urls';
import { feature } from 'topojson-client';

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
  return dispatch => {
    const config = {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };

    const subPromises = [];
    subPromises.push(apiMiddleware(config, BASE_URL + 'maps/ghana', null));
    subPromises.push(apiMiddleware(config, BASE_URL + 'maps/ghana/volta', null));
    Promise.all(subPromises).then(maps => {
      console.log(maps[0].objects);
      const countryMapData = feature(maps[0], maps[0].objects.ghana).features;
      const regionMapData = [];
      const voltaData = feature(maps[1], maps[1].objects.volta).features;
      regionMapData.push(voltaData);
      dispatch(setMapViewMapData(countryMapData, regionMapData));
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