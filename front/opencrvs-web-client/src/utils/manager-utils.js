import head from 'lodash/head';
import get from 'lodash/get';
import filter from 'lodash/filter';

export const calculateRagStatus = (data, mapEvent, timePeriod) => {
  let status = null;
  const obj = get(head(filter(data, {type: mapEvent})), 'timePeriod');
  const filteredObj = head(filter(obj, {title: timePeriod}));
  const certs = get(filteredObj, 'certifications');
  const kpi = get(filteredObj, 'certificationsKpi');
  const percentage = Math.round(( certs / kpi ) * 100);

  if ( percentage <= 33) {
    status = '#FF6427';
  } else if (percentage > 33 && percentage <= 66) {
    status = '#FFA327';
  } else if (percentage > 66 ) {
    status = '#179999';
  }

  return status;
};

export const calculateRagStatusOnBar = (min, max) => {
  let status = null;
  let total = min + max;
  let percentage = Math.round(( min / total ) * 100);

  if ( percentage <= 33) {
    status = '#FF6427';
  } else if ( percentage > 33 && percentage <= 66) {
    status = '#FFA327';
  } else if ( percentage > 66 ) {
    status = '#179999';
  }

  return status;
};

export const calculateRagStatusOnMap = (mapData, 
  regionIndex, 
  data, 
  mapEvent, 
  timePeriod, 
  countryLevel, 
  regionLevel) => {
  let mapTitle = null;

  if (countryLevel) {
    mapTitle = mapData[regionIndex].properties.HRname;
  }

  if (regionLevel) {
    mapTitle = mapData[regionIndex].properties.NAME_2;
  }

  const eventData = get(head(filter(data, {title: mapTitle})), 'events');
  let status = null;
  let obj = get(head(filter(eventData, {type: mapEvent})), 'timePeriod');
  let filteredObj = head(filter(obj, {title: timePeriod}));
  let certs = get(filteredObj, 'certifications');
  let kpi = get(filteredObj, 'certificationsKpi');
  let percentage = Math.round(( certs / kpi ) * 100);

  if ( percentage <= 33) {
    status = '#FF6427';
  } else if ( percentage > 33 && percentage <= 66) {
    status = '#FFA327';
  } else if ( percentage > 66 ) {
    status = '#179999';
  }

  return status;
};