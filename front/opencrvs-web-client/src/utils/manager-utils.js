import { head, get, filter } from 'lodash';


export const calculateRagStatus = function(data, mapEvent, timePeriod) {
  let status = null;
  let obj = get(head(filter(data, {type: mapEvent})), 'timePeriod');
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

export const calculateRagStatusOnMap = function(mapData, 
  regionIndex, 
  data, 
  mapEvent, 
  timePeriod, 
  countryLevel, 
  regionLevel) {

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