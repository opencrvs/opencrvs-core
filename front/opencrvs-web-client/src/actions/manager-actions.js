/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:19:24
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-11 17:29:57
 */
export const REQUEST_MAPVIEW_DATA = 'REQUEST_MAPVIEW_DATA';
export const MAPVIEW_DATA_SUCCESS = 'MAPVIEW_DATA_SUCCESS';
export const MAPVIEW_MAPDATA_SUCCESS = 'MAPVIEW_MAPDATA_SUCCESS';
export const REGION_SELECTED = 'REGION_SELECTED';
export const COUNTRY_SELECTED = 'COUNTRY_SELECTED';
export const EVENT_SELECTED = 'EVENT_SELECTED';
export const PERIOD_SELECTED = 'PERIOD_SELECTED';
export const UPDATE_ORIGIN = 'UPDATE_ORIGIN';
export const SET_TOOLTIP_MAP_DATA = 'SET_TOOLTIP_MAP_DATA';
export const REMOVE_TOOLTIP_MAP_DATA = 'REMOVE_TOOLTIP_MAP_DATA';
export const SET_REGION_MANAGER = 'SET_REGION_MANAGER';
export const SET_DISTRICT_MANAGER = 'SET_DISTRICT_MANAGER';
export const SET_LIST_FILTER = 'SET_LIST_FILTER';
export const SET_LIST_ORDER = 'SET_LIST_ORDER';
export const CASE_TRACKING = 'CASE_TRACKING';
export const CASE_TRACKING_CLEAR = 'CASE_TRACKING_CLEAR';
export const PERFORMANCE_METRICS = 'PERFORMANCE_METRICS';




import { apiMiddleware } from 'utils/api-middleware';
import { BASE_URL } from 'constants/urls';
import { feature } from 'topojson-client';
import { filter, head, map, get } from 'lodash';
const Moment = require('moment');

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
        dispatch(setMapViewMapData(countryMapData, regionMapData, ));
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
  const countryManager = mapLocations.country.staff.manager;
  const totalCerts = updateTotalCerts(mapLocations.country, 'birth', 'This year');
  const performanceData = updatePerformanceMetrics(mapLocations.country, 'birth', 'This year');
  return {
    type: MAPVIEW_DATA_SUCCESS,
    mapLocations,
    selectedLocation,
    subLocations,
    totalCerts,
    countryManager,
    performanceData,
  };
}

function requestMapViewData() {
  return {
    type: REQUEST_MAPVIEW_DATA,
  };
}

function setRegionManager(regionManager) {
  return {
    type: SET_REGION_MANAGER,
    regionManager,
  };
}

function setDistrictManager(districtManager) {
  return {
    type: SET_DISTRICT_MANAGER,
    districtManager,
  };
}

function removeTooltip() {
  return {
    type: REMOVE_TOOLTIP_MAP_DATA,
  };
}



export function selectListFilter(listFilter) {
  return {
    type: SET_LIST_FILTER,
    listFilter,
  };
}


export function selectListOrder(listOrder) {
  return {
    type: SET_LIST_ORDER,
    listOrder,
  };
}


export function disableTooltip() {
  return (dispatch, getState) => {
    const { 
      countryLevel,
      regionLevel,
      mapLocations,
      mapEvent, 
      mapTimePeriod,
      selectedLocation } = getState().managerReducer;
    let performanceData = null;
    if (countryLevel) {
      performanceData = updatePerformanceMetrics(mapLocations.country, mapEvent, mapTimePeriod);
    }
    if (regionLevel) {
      performanceData = updatePerformanceMetrics(selectedLocation, mapEvent, mapTimePeriod);
    }
    dispatch(setPerformanceMetrics(performanceData));
    dispatch(removeTooltip());
  };
}



export function setTooltipData(name) {
  // get data by name
  return (dispatch, getState) => {
    const { mapEvent,
      subLocations,
      mapTimePeriod,
      countryLevel,
      regionLevel,
      selectedRegion } = getState().managerReducer;
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const tooltipObj = {
      title: title,
      certs: null,
      kpi: null,
    };
    let regionManager = null;
    let districtManager = null;
    let obj = {};
    if (countryLevel) {
      obj = head(filter(get(head(filter(subLocations, { title: title })), 'events'), { type: mapEvent }));
      regionManager = get(head(filter(subLocations, { title: title })), 'staff.manager');
    }
    if (regionLevel) {
      const districtsUnfiltered = get(head(filter(subLocations, { title: selectedRegion })), 'subEntries').entries;
      obj = head(filter(get(head(filter(districtsUnfiltered, {title: title })), 'events'), { type: mapEvent }));
      regionManager = get(head(filter(subLocations, { title: selectedRegion })), 'staff.manager');
      districtManager = head(filter(districtsUnfiltered, {title: title })).staff.manager;
    }
    tooltipObj.certs = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'certifications');
    tooltipObj.kpi = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'certificationsKpi');
    // performance graph
    let registrations = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'registrations');
    let registrationsKpi = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'registrationsKpi');
    let validations = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'validations');
    let validationsKpi = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'validationsKpi');
    let declarations = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'declarations');
    let declarationsKpi = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'declarationsKpi');
    let notifications = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'notifications');
    let notificationsKpi = get(head(filter(obj.timePeriod, { title: mapTimePeriod })), 'notificationsKpi');
    let notificationsKpiStacked = (notificationsKpi - notifications);
    let declarationsKpiStacked = (declarationsKpi - declarations);
    let validationsKpiStacked = (validationsKpi - validations);
    let registrationsKpiStacked = (registrationsKpi - registrations);
    let certificationsKpiStacked = (tooltipObj.kpi - tooltipObj.certs);
    let performanceData = [
      {name: 'Notifications', achieved: notifications, kpi: notificationsKpiStacked},
      {name: 'Declarations', achieved: declarations, kpi: declarationsKpiStacked},
      {name: 'Validations', achieved: validations, kpi: validationsKpiStacked},
      {name: 'Registrations', achieved: registrations, kpi: registrationsKpiStacked},
      {name: 'Certifications', achieved: tooltipObj.certs, kpi: certificationsKpiStacked},
    ];
    dispatch(setPerformanceMetrics(performanceData));
    dispatch(tooltipDataReady(tooltipObj));
    dispatch(setDistrictManager(districtManager));
    dispatch(setRegionManager(regionManager));
  };
}

function updateTotalCerts(data, mapEvent, mapTimePeriod) {
  let obj = head(filter(head(filter(data.events, {type: mapEvent})).timePeriod, {title: mapTimePeriod}));
  const totalsObj = {
    certifications: obj.certifications,
    certificationsKpi: obj.certificationsKpi,
    registrations: obj.registrations,
    registrationsKpi: obj.registrationsKpi,
  }
  return totalsObj;
}

function updatePerformanceMetrics(data, mapEvent, mapTimePeriod) {
  let obj = head(filter(head(filter(data.events, {type: mapEvent})).timePeriod, {title: mapTimePeriod}));
  let notificationsKpiStacked = (obj.notificationsKpi - obj.notifications);
  let declarationsKpiStacked = (obj.declarationsKpi - obj.declarations);
  let validationsKpiStacked = (obj.validationsKpi - obj.validations);
  let registrationsKpiStacked = (obj.registrationsKpi - obj.registrations);
  let certificationsKpiStacked = (obj.certificationsKpi - obj.certifications);
  let performanceData = [
    {name: 'Notifications', achieved: obj.notifications, kpi: notificationsKpiStacked},
    {name: 'Declarations', achieved: obj.declarations, kpi: declarationsKpiStacked},
    {name: 'Validations', achieved: obj.validations, kpi: validationsKpiStacked},
    {name: 'Registrations', achieved: obj.registrations, kpi: registrationsKpiStacked},
    {name: 'Certifications', achieved: obj.certifications, kpi: certificationsKpiStacked},
  ];
  return performanceData;
}

function tooltipDataReady(rolloverMapData) {
  return {
    type: SET_TOOLTIP_MAP_DATA,
    rolloverMapData,
  };
}

export function selectCountry() {
  return (dispatch, getState) => {
    const { mapLocations,
      mapEvent,
      mapTimePeriod } = getState().managerReducer;
    let obj = {};
    obj = mapLocations.country;
    let certs = updateTotalCerts(obj, mapEvent, mapTimePeriod);
    let performanceData = updatePerformanceMetrics(obj, mapEvent, mapTimePeriod);
    dispatch(setPerformanceMetrics(performanceData));
    dispatch(setCountry(certs));
    dispatch(setDistrictManager(null));
    dispatch(setRegionManager(null));
  };
}


function setPerformanceMetrics(performanceData) {
  return {
    type: PERFORMANCE_METRICS,
    performanceData,
  };
}

function setCountry(totalCerts) {
  return {
    type: COUNTRY_SELECTED,
    totalCerts,
  };
}

export function selectPeriod(period) {
  return (dispatch, getState) => {
    const { mapLocations,
      mapEvent,
      selectedRegion,
      countryLevel,
      regionLevel } = getState().managerReducer;
    let obj = {};
    if (countryLevel) {
      obj = mapLocations.country;
    }
    if (regionLevel) {
      obj = head(filter(mapLocations.country.subEntries.entries, {title: selectedRegion}));
    }

    let certs = updateTotalCerts(obj, mapEvent, period);
    let performanceData = updatePerformanceMetrics(obj, mapEvent, period);
    dispatch(setPerformanceMetrics(performanceData));
    dispatch(setPeriod(period, certs));
  };
}

function setPeriod(period, totalCerts) {
  return {
    type: PERIOD_SELECTED,
    mapTimePeriod: period,
    totalCerts,
  };
}


export function selectEvent(event) {
  return (dispatch, getState) => {
    const { mapLocations,
      mapTimePeriod,
      selectedRegion,
      countryLevel,
      regionLevel } = getState().managerReducer;
    let obj = {};
    if (countryLevel) {
      obj = mapLocations.country;
    }
    if (regionLevel) {
      obj = head(filter(mapLocations.country.subEntries.entries, {title: selectedRegion}));
    }

    let certs = updateTotalCerts(obj, event, mapTimePeriod);
    let performanceData = updatePerformanceMetrics(obj, event, mapTimePeriod);
    dispatch(setPerformanceMetrics(performanceData));
    dispatch(setEvent(event, certs));
  };
}

function setEvent(event, totalCerts) {
  return {
    type: EVENT_SELECTED,
    mapEvent: event,
    totalCerts,
  };
}

export function caseTracking() {
  return {
    type: CASE_TRACKING,
    caseData: {
      firstName: 'Bashirah',
      middleName: 'Awo',
      family: 'Nkrumah',
      personalIDNummber: 'GH99856325',
      phone: '024 965 1365',
      addressLine1: 'P.O. Box 7986',
      addressLine2: '',
      addressLine3: '',
      county: 'Hohoe',
      state: 'Volta',
    },
    caseNotes: [
      {
        id: 1,
        title: 'NOTIFICATION', 
        note: 'Swedru village polio immunisation', 
        createdAt: Moment().subtract(29, 'days').format('MMMM Do YYYY, h:mm:ss'),
        icon: 'notifications',
        iconAlt: 'notifications',
        kpiData: [
          {value: 1, minValue: 1, maxValue: 5},
        ],
      },
      {
        id: 2,
        title: 'DECLARATION', 
        note: 'Field officer John Adarkwa. Declaration performed in Swedru village', 
        createdAt: Moment().subtract(23, 'days').format('MMMM Do YYYY, h:mm:ss'),
        icon: 'input',
        iconAlt: 'input',
        kpiData: [
          {value: 6, minValue: 1, maxValue: 10},
        ],
        caseManager: {
          given: 'John',
          family: 'Adarkwa',
          title: 'Field Officer',
          email: 'john@acme.com',
          phone: '555-165-111',
          avatar: 'male',
        },
      },
      {
        id: 3,
        title: 'VALIDATION', 
        note: 'Agona West Municipal registration office', 
        createdAt: Moment().subtract(20, 'days').format('MMMM Do YYYY, h:mm:ss'),
        icon: 'check',
        iconAlt: 'check',
        kpiData: [
          {value: 3, minValue: 1, maxValue: 5},
        ],
        caseManager: {
          given: 'Cameron',
          family: 'Addo',
          title: 'District Operations Manager',
          email: 'cameron@acme.com',
          phone: '555-165-111',
          avatar: 'male',
        },
      },
      {
        id: 4,
        title: 'REGISTRATION', 
        note: 'Mother contacted via SMS', 
        createdAt: Moment().subtract(20, 'days').format('MMMM Do YYYY, h:mm:ss'),
        icon: 'check',
        iconAlt: 'check',
        kpiData: [
          {value: 1, minValue: 1, maxValue: 5},
        ],
        caseManager: {
          given: 'Sylvia',
          family: 'Miller',
          title: 'District Operations Manager',
          email: 'sylvia@acme.com',
          phone: '555-165-111',
          avatar: 'female',
        },
      },
      {
        id: 5,
        title: 'PAYMENT', 
        note: 'Payment received by Airtel.  Reference: 108736986', 
        createdAt: Moment().subtract(11, 'days').format('MMMM Do YYYY, h:mm:ss'),
        icon: 'payment',
        iconAlt: 'payment',
        kpiData: [
          {value: 9, minValue: 1, maxValue: 30},
        ],
      },
      {
        id: 6,
        title: 'CERTIFICATION', 
        note: 'Certificate no: 0879887, printed and accepted by informant: Mary Mensua', 
        createdAt: Moment().subtract(10, 'days').format('MMMM Do YYYY, h:mm:ss'),
        icon: 'print',
        iconAlt: 'print',
        kpiData: [
          {value: 1, minValue: 1, maxValue: 30},
        ],
        caseManager: {
          given: 'James',
          family: 'Francis',
          title: 'Certification Clerk',
          email: 'james@acme.com',
          phone: '555-165-111',
          avatar: 'male',
        },
      },
    ],
    caseGraphData: [
      {name: Moment().subtract(30, 'days').format('Do MMM'), kpi: 0, actual: 0, amt: 2400},
      {name: Moment().subtract(23, 'days').format('Do MMM'), kpi: 5, actual: 7, amt: 2210},
      {name: Moment().subtract(17, 'days').format('Do MMM'), kpi: 3, actual: 6, amt: 2290},
      {name: Moment().subtract(14, 'days').format('Do MMM'), kpi: 3, actual: 3, amt: 2000},
      {name: Moment().subtract(13, 'days').format('Do MMM'), kpi: 1, actual: 1, amt: 2181},
      {name: Moment().subtract(11, 'days').format('Do MMM'), kpi: 7, actual: 2, amt: 2500},
      {name: Moment().subtract(8, 'days').format('Do MMM'), kpi: 2, actual: 3, amt: 2100},
    ],
  };

}

export function caseTrackingClear() {
  return {
    type: CASE_TRACKING_CLEAR,
  };
}

export function selectRegion(name) {
  return (dispatch, getState) => {
    const { mapLocations, regionMapData, mapEvent, mapTimePeriod } = getState().managerReducer;
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const obj = head(filter(mapLocations.country.subEntries.entries, {title: title}));
    let newMap;
    map(regionMapData, (mapData, index ) => {
      if (get(head(mapData), 'properties.NAME_1') == title) {
        newMap = mapData;
      }
    });
    let certs = updateTotalCerts(obj, mapEvent, mapTimePeriod);
    let performanceData = updatePerformanceMetrics(obj, mapEvent, mapTimePeriod);
    dispatch(setPerformanceMetrics(performanceData));
    dispatch(regionSelected(obj, title, newMap, certs));
  };
}

function regionSelected(obj, title, newMap, totalCerts) {
  return {
    type: REGION_SELECTED,
    selectedLocation: obj,
    selectedRegion: title,
    selectedLocationMapData: newMap,
    totalCerts,
  };
}