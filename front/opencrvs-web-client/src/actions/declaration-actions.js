/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:19:30
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-14 18:39:42
 */
import { BASE_URL, OPEN_HIM_URL, SMS_API_URL, CORS_API_URL } from 'constants/urls';
import { apiMiddleware } from 'utils/api-middleware';
import { logoutUser } from 'actions/user-actions';
import { submitCollector } from 'actions/certification-actions';
import { selectWorkView } from 'actions/global-actions';
import { launchSnack } from 'actions/global-actions';
import { resetPatients } from 'actions/patient-actions';
import { clearTempImages } from 'actions/image-actions';
import { get, head, map, filter } from 'lodash';
const Moment = require('moment');
const Fuzzysearch = require('fuzzysearch');
import { fetchPatients } from 'actions/patient-actions';
export const DECLARATION_REQUEST = 'DECLARATION_REQUEST';
export const DECLARATION_SUCCESS = 'DECLARATION_SUCCESS';
export const DECLARATION_FAILURE = 'DECLARATION_FAILURE';
export const DECLARATION_SELECTED = 'DECLARATION_SELECTED';
export const NEW_DECL_MODAL_OPENED = 'NEW_DECL_MODAL_OPENED';
export const NEW_DECL_MODAL_CLOSED = 'NEW_DECL_MODAL_CLOSED';
export const NEW_DECL_EDIT = 'NEW_DECL_EDIT';
export const SUBMIT_MODAL_TOGGLE = 'SUBMIT_MODAL_TOGGLE';
export const DECLARATION_SUBMIT_REQUEST = 'DECLARATION_SUBMIT_REQUEST';
export const DECLARATION_SUBMIT_SUCCESS = 'DECLARATION_SUBMIT_SUCCESS';
export const DECLARATION_SUBMIT_FAILURE = 'DECLARATION_SUBMIT_FAILURE';
export const TRACKING_MODAL_TOGGLE = 'TRACKING_MODAL_TOGGLE';
export const REQD_MODAL_TOGGLE = 'REQD_MODAL_TOGGLE';
export const SMS_MODAL_TOGGLE = 'SMS_MODAL_TOGGLE';
export const DECLARATION_SEARCH = 'DECLARATION_SEARCH';
export const OLD_DOCUMENT_DELETED = 'OLD_DOCUMENT_DELETED';
export const DECLARATION_READY_TO_CONFIRM = 'DECLARATION_READY_TO_CONFIRM';
export const NOTIFICATION_SELECTED = 'NOTIFICATION_SELECTED';
export const CERTIFICATION_SELECTED = 'CERTIFICATION_SELECTED';
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
export const CHECK_CERTIFICATION = 'CHECK_CERTIFICATION';
export const CLOSE_CERTIFICATION_MODAL = 'CLOSE_CERTIFICATION_MODAL';
export const STORE_NOTIFICATIONS = 'STORE_NOTIFICATIONS';
export const STORE_SAVED_DECLARATIONS = 'STORE_SAVED_DECLARATIONS';
export const BEGIN_SAVING = 'BEGIN_SAVING';
export const SAVING_COMPLETED = 'SAVING_COMPLETED';


const uuidv4 = require('uuid/v4');

// const requestDeclaration = () => ({
//   type: DECLARATION_REQUEST,
//   isFetching: true,
//   authenticated: true,
// });

function requestDeclaration() {
  return {
    type: DECLARATION_REQUEST,
    isFetching: true,
    authenticated: true,
  };
}

function submitDeclarationProcessed(trackingID, newBirthRegistrationNumber, newChildPersonalID) {
  return {
    type: DECLARATION_SUBMIT_SUCCESS,
    isSubmitting: false,
    trackingID,
    newBirthRegistrationNumber,
    newChildPersonalID,
  };

}

function removeNotification(index) {
  return {
    type: REMOVE_NOTIFICATION,
    index,
  };
}

function submitDeclarationSuccess(trackingID, newBirthRegistrationNumber, newChildPersonalID) {
  //  remove the notification from the list
  // prototype approach only

  const prefix = trackingID.substring(0, 1);
  const suffix = trackingID.substring(3, 8);
  const oldTrackID = prefix + 'n-' + suffix;
  return (dispatch, getState) => {
    const {declarations} = getState().declarationsReducer;
    const {role} = getState().userReducer;
    if (role == 'certification clerk') {
      map(declarations.declaration, (declaration, index ) => {
        const myID = declaration.tracking.toUpperCase();
        if (oldTrackID == myID) {
          dispatch(removeNotification(index));
        }
      });
    }
    dispatch(submitDeclarationProcessed(trackingID, newBirthRegistrationNumber, newChildPersonalID));
  };

}

export function newDeclarationEdit(category) {
  return {
    type: NEW_DECL_EDIT,
    newDeclaration: true,
    category: category,
  };
}

export function newDeclarationModalOpened() {
  return {
    type: NEW_DECL_MODAL_OPENED,
    newDeclarationModal: true,
  };
}

export function setSaving() {
  return {
    type: BEGIN_SAVING,
  };
}

function setFormSubmitValues(values) {
  return {
    type: DECLARATION_READY_TO_CONFIRM,
    values,
  };
}

export function submitModalOpen(values) {
  return (dispatch, getState) => {
    dispatch(setFormSubmitValues(values));
    const {beginSaving} = getState().declarationsReducer;
    if (beginSaving) {
      dispatch(submitDeclaration(true));
    } else {
      dispatch(submitModalOpened());
    }
  };
}

function setSearchValues(searchTerm, declarationsList) {
  return {
    type: DECLARATION_SEARCH,
    searchTerm,
    declarationsList,
  };
}

export function searchDeclarations(value) {

  return (dispatch, getState) => {

    let declarationsList = [];
    const {declarations} = getState().declarationsReducer;
    const {patients} = getState().patientsReducer;

    map(declarations.declaration, (declaration, index ) => {
      let addToList = false;
      const given = get(head(filter(patients, function(patient) {
        return patient.patient.id == declaration.childDetails;
      })), 'patient.given');
      const family = get(head(filter(patients, function(patient) {
        return patient.patient.id == declaration.childDetails;
      })), 'patient.family');

      const dob = get(head(filter(patients, function(patient) {
        return patient.patient.id == declaration.childDetails;
      })), 'patient.birthDate');

      const address = get(head(filter(patients, function(patient) {
        return patient.patient.id == declaration.childDetails;
      })), 'patient.address');
      const county = get(head(address), 'county');
      const state = get(head(address), 'state');
      const city = get(head(address), 'city');

      const dobFormat = Moment(dob).format('MMM Do YY');
      const tests = [];
      tests.push(Fuzzysearch(value.toUpperCase(), given.toUpperCase()));
      tests.push(Fuzzysearch(value.toUpperCase(), family.toUpperCase()));
      tests.push(Fuzzysearch(value.toUpperCase(), county.toUpperCase()));
      tests.push(Fuzzysearch(value.toUpperCase(), state.toUpperCase()));
      tests.push(Fuzzysearch(value.toUpperCase(), city.toUpperCase()));
      tests.push(Fuzzysearch(value.toUpperCase(), declaration.tracking.toUpperCase()));
      tests.push(Fuzzysearch(value, dobFormat));

      tests.forEach((test) => {
        if (test == true) {
          addToList = true;
        }
      });
      if (addToList) {
        declarationsList.push(declaration);
      }
    });
    dispatch(setSearchValues(value, declarationsList));
  };
}

export function submitModalOpened() {
  return {
    type: SUBMIT_MODAL_TOGGLE,
  };
}

export function trackingModalOpened() {
  return {
    type: TRACKING_MODAL_TOGGLE,
  };
}

export function reqModalToggle() {
  return {
    type: REQD_MODAL_TOGGLE,
  };
}

export function smsModalToggle() {
  return {
    type: SMS_MODAL_TOGGLE,
  };
}

export function newDeclarationModalClosed() {
  return {
    type: NEW_DECL_MODAL_CLOSED,
    newDeclarationModal: false,
  };
}

function loadDeclaration(declaration) {
  return {
    type: DECLARATION_SELECTED,
    selectedDeclaration: declaration,
    newDeclaration: false,
  };
}

function loadCertification(declaration) {
  return {
    type: CERTIFICATION_SELECTED,
    selectedCertification: declaration,
  };
}

function loadNotification(declaration) {
  return {
    type: NOTIFICATION_SELECTED,
    selectedDeclaration: declaration,
    newDeclaration: true,
    newNotification: true,
  };
}

function loadCertCheck(declaration) {
  return {
    type: CHECK_CERTIFICATION,
    declarationToCheckAgainst: declaration,
  };
}

export function proceedToPrintView() {
  return (dispatch, getState) => {
    const {declarationToCheckAgainst} = getState().declarationsReducer;
    dispatch(loadCertification(declarationToCheckAgainst));
    dispatch(submitCollector());
  };
}

export function certCheckModalClosed() {
  return {
    type: CLOSE_CERTIFICATION_MODAL,
  };
}

export function selectDeclaration(declaration) {

  return (dispatch, getState) => {
    const {role} = getState().userReducer;
    const code = declaration.code;
    if ((code == 'birth-declaration' || code == 'birth-notification') && role == 'registrar') {
      dispatch(loadDeclaration(declaration));
    } else if (code == 'birth-declaration' && role == 'certification clerk') {
      // instead of loading a cert into print
      //I want to open a modal overlay
      //dispatch(loadCertification(declaration));
      dispatch(loadCertCheck(declaration));

    } else if (role == 'field officer') {
      if (code == 'birth-declaration') {
        dispatch(loadDeclaration(declaration));
      } else {
        dispatch(loadNotification(declaration));
      }
    } else {
      console.error(`Inconsitent state, could not select declaration: declaration code ${code}, user role ${role}`);
    }
  };

}

export function oldImageDeleted(index) {
  return {
    type: OLD_DOCUMENT_DELETED,
    reference: 'documents',
    index,
  };
}

function receiveDeclaration(data) {
  let declarationsList = [];
  map(data.declaration, (declaration, index ) => {
    declarationsList.push(declaration);
  });
  return {
    type: DECLARATION_SUCCESS,
    isFetching: false,
    authenticated: true,
    declarations: data,
    declarationsList,
  };
}

function declarationError(message) {
  return {
    type: DECLARATION_FAILURE,
    isFetching: false,
    authenticated: true,
    message,
  };
}

function fetchDeclarationsFromAPI(dispatch, roleType, config, token) {
  config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const data = {roleType:roleType};

  return fetch(BASE_URL + `declarations/${data.roleType}/context/`, config)
    .then(response =>
      response.json().then(payload => ({ payload, response }))
    )
    .then(({ payload, response }) => {
      if (!response.ok) {
        dispatch(declarationError(payload.message));
        return Promise.reject(payload);
      }

      dispatch(receiveDeclaration(payload));
      payload.declaration.forEach((declaration) => {
        dispatch(fetchPatients(declaration.childDetails, false));
        dispatch(fetchPatients(declaration.motherDetails, false));
        dispatch(fetchPatients(declaration.fatherDetails, false));
      });
      if (roleType == 'registrar') {

        dispatch(checkSavedDeclarations(roleType));
      } else if (roleType == 'certification clerk') {
        dispatch(selectWorkView('work'));
      }


      return true;
    })
    .catch(err => {
      if (err.message == 'Invalid token') {
        dispatch(logoutUser());
      } else {
        console.log(err);
      }
    });
}

function fetchNotificationsFromHearth(dispatch, roleType) {
  return fetch(OPEN_HIM_URL + 'Composition?status=preliminary&type=birth-notification&entry=Location/ae150380-8329-11e7-82fe-a5724c7e1e43&_count=999')
    .then(response =>
      response.json().then(payload => ({ payload, response }))
    )
    .then(({ payload, response }) => {
      if (!response.ok) {
        dispatch(declarationError(payload.message));
        return Promise.reject(payload);
      }
      dispatch(storeAllNotifications(payload));
      dispatch(checkSavedDeclarations(roleType));

      return true;
    })
    .catch(err => {
      console.log(err);
    });
}

function storeAllNotifications(payload) {
  return {
    type: STORE_NOTIFICATIONS,
    notificationData: payload,
  };
}

function storeSavedDeclarations(payload) {
  
  return {
    type: STORE_SAVED_DECLARATIONS,
    savedDeclarations: payload,
  };
}

export function fetchDeclarations(roleType) {
  let token = localStorage.getItem('token') || null;
  let config = {};
  return dispatch => {
    dispatch(requestDeclaration());
    if (roleType != 'field officer') {
      fetchDeclarationsFromAPI(dispatch, roleType, config, token);
    } else {
      fetchNotificationsFromHearth(dispatch, roleType);
    }
  };
}

export function checkSavedDeclarations(roleType) {
  let token = localStorage.getItem('token') || null;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  return (dispatch, getState) => {
    
    
    return fetch(BASE_URL + `declarations/${roleType}/context/saved`, config)
    .then(response =>
      response.json().then(payload => ({ payload, response }))
    )
    .then(({ payload, response }) => {
      if (!response.ok) {
        dispatch(declarationError(payload.message));
        return Promise.reject(payload);
      }
      if (roleType == 'field officer') {
        dispatch(storeSavedDeclarations(payload));
        dispatch(fetchAndCompareProcessedNotifications());
      } else if (roleType == 'registrar') {
        const {declarations} = getState().declarationsReducer;
        map(payload.declaration, (savedDeclaration, index ) => {
          dispatch(fetchPatients(savedDeclaration.childDetails, false));
          dispatch(fetchPatients(savedDeclaration.motherDetails, false));
          dispatch(fetchPatients(savedDeclaration.fatherDetails, false));
          declarations.declaration.push(savedDeclaration);
        });
        dispatch(receiveDeclaration(declarations));
        dispatch(selectWorkView('work'));
      }
      return true;
    })
    .catch(err => {
      if (err.message == 'Invalid token') {
        dispatch(logoutUser());
      } else {
        console.log(err);
      }
    });
    
  };
}

export function fetchAndCompareProcessedNotifications() {
  let token = localStorage.getItem('token') || null;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  return (dispatch, getState) => {
    
    return fetch(BASE_URL + 'notifications', config)
    .then(response =>
      response.json().then(payload => ({ payload, response }))
    )
    .then(({ payload, response }) => {
      if (!response.ok) {
        dispatch(declarationError(payload.message));
        return Promise.reject(payload);
      }
      let newPayload = {
        message: 'Unprocessed notifications success',
        declaration: [],
      };
      // Todo compare uuids and remove any that are already processed
      // merge remaining with any that are saved
      const {notificationData, savedDeclarations} = getState().declarationsReducer;
      if (payload.notification.length > 0) {
        map(get(notificationData, 'entry'), (notification, index ) => {
          const notificationID = notification.resource.id;
          let insert = true;
          payload.notification.forEach((processedNotification) => {
            if (notificationID == processedNotification.uuid) {
              insert = false;
            }
          });
          if (insert) {
            const childIDArray = notification.resource.subject.reference.split('/');
            const childID = childIDArray[1];
            const mother = notification.resource.section.entry
              .find((entry) => entry.text === 'Mother\'s Details' )
              .reference;
            let newDeclaration = {
              id: index,
              code: 'birth-notification',
              uuid: notification.resource.id,
              created_at: notification.resource.meta.lastUpdated,
              updated_at: notification.resource.meta.lastUpdated,
              motherDetails: mother.split('/')[1],
              childDetails: childID,
              tracking: 'BN-' + notification.resource.id.substring(0, 12),
              documents:[],
            };
            const child = notification.resource.subject.reference;
            dispatch(fetchPatients(child, true));
            dispatch(fetchPatients(mother, true));
            console.log('PUSHING: ' + JSON.stringify(newDeclaration));
            newPayload.declaration.push(newDeclaration);
          }
        });
      } else {
        map(get(notificationData, 'entry'), (notification, index ) => {
          const childIDArray = notification.resource.subject.reference.split('/');
          const childID = childIDArray[1];
  
          const mother = notification.resource.section.entry
            .find((entry) => entry.text === 'Mother\'s Details' )
            .reference;
          let newDeclaration = {
            id: index,
            code: 'birth-notification',
            uuid: notification.resource.id,
            created_at: notification.resource.meta.lastUpdated,
            updated_at: notification.resource.meta.lastUpdated,
            motherDetails: mother.split('/')[1],
            childDetails: childID,
            tracking: 'BN-' + notification.resource.id.substring(0, 12),
            documents:[],
          };
          const child = notification.resource.subject.reference;
  
  
          dispatch(fetchPatients(child, true));
          dispatch(fetchPatients(mother, true));
          newPayload.declaration.push(newDeclaration);
        }); 
      }
      
      map(savedDeclarations.declaration, (declaration, index ) => {
        console.log('SAVED DECLARATIONS:' + JSON.stringify(declaration));
        dispatch(fetchPatients(declaration.childDetails, false));
        dispatch(fetchPatients(declaration.motherDetails, false));
        dispatch(fetchPatients(declaration.fatherDetails, false));
        newPayload.declaration.push(declaration);
      });
      console.log(JSON.stringify(newPayload));
      dispatch(receiveDeclaration(newPayload));
      dispatch(selectWorkView('work'));
      
      return true;
    })
    .catch(err => {
      if (err.message == 'Invalid token') {
        dispatch(logoutUser());
      } else {
        console.log(err);
      }
    });
    
  };
}

export function sendSMS(phoneNumber, smsMessage) {
  doCORSRequest({
    method: 'GET',
    url: SMS_API_URL + 'to=' + phoneNumber + '&concat=4&text=' + smsMessage,
  }, function printResult(result) {
    console.log(result);
  });
}

function savingCompleted() {
  return {
    type: SAVING_COMPLETED,
  };
}

function doCORSRequest(options, printResult) {
  // TODO:  Error: Actions must be plain objects. Use custom middleware for async
  var x = new XMLHttpRequest();
  x.open(options.method, CORS_API_URL + options.url);
  x.onload = x.onerror = function() {
    printResult(
      options.method + ' ' + options.url + '\n' +
      x.status + ' ' + x.statusText + '\n\n' +
      (x.responseText || '')
    );
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  x.send(options.data);
}



export function submitDeclaration(saving) {

  let token = localStorage.getItem('token') || null;
  let childPatientURL = BASE_URL + 'patient';
  let motherPatientURL = BASE_URL + 'patient';
  let fatherPatientURL = BASE_URL + 'patient';

  let childAddressURL = BASE_URL + 'address';
  let childTelecomURL = BASE_URL + 'telecom';
  let childExtraURL = BASE_URL + 'extra';

  let motherAddressURL = BASE_URL + 'address';
  let motherTelecomURL = BASE_URL + 'telecom';
  let motherExtraURL = BASE_URL + 'extra';

  let fatherAddressURL = BASE_URL + 'address';
  let fatherTelecomURL = BASE_URL + 'telecom';
  let fatherExtraURL = BASE_URL + 'extra';

  let declarationsURL = BASE_URL + 'declarations';
  let locationsURL = BASE_URL + 'locations';
  let informantsURL = BASE_URL + 'informant';

  let notificationsURL = BASE_URL + 'notifications';

  return (dispatch, getState) => {
    const {selectedDeclaration, newDeclaration, submitValues, newNotification} = getState().declarationsReducer;
    const {role} = getState().userReducer;
    // check that this is not a confirmation from the delete image modal
    const {imageToDelete} = getState().imageReducer;
    if (imageToDelete == 0) {
      const {tempImages} = getState().imageReducer;

      let childConfig = {};

      const childData = new FormData();
      const motherData = new FormData();
      const fatherData = new FormData();

      const childAddressData = new FormData();
      const motherAddressData = new FormData();
      const fatherAddressData = new FormData();

      const childTelecomData = new FormData();
      const motherTelecomData = new FormData();
      const fatherTelecomData = new FormData();

      const childExtraData = new FormData();
      const motherExtraData = new FormData();
      const fatherExtraData = new FormData();

      const declarationsData = new FormData();
      const locationsData = new FormData();
      const informantsData = new FormData();

      const notificationsData = new FormData();

      if (newDeclaration || newNotification) {
        childConfig = {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        };
      } else {
        childConfig = {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        };

        childData.append('id', get(submitValues, 'child_id'));
        motherData.append('id', get(submitValues, 'mother_id'));
        fatherData.append('id', get(submitValues, 'father_id'));
      }

      let motherConfig = Object.assign({}, childConfig);
      let fatherConfig = Object.assign({}, childConfig);
      let notificationsConfig = Object.assign({}, childConfig);

      let childAddressConfig = Object.assign({}, childConfig);
      let motherAddressConfig = Object.assign({}, childConfig);
      let fatherAddressConfig = Object.assign({}, childConfig);

      let childTelecomConfig = Object.assign({}, childConfig);
      let motherTelecomConfig = Object.assign({}, childConfig);
      let fatherTelecomConfig = Object.assign({}, childConfig);

      let childExtraConfig = Object.assign({}, childConfig);
      let motherExtraConfig = Object.assign({}, childConfig);
      let fatherExtraConfig = Object.assign({}, childConfig);

      let declarationsConfig = Object.assign({}, childConfig);
      let locationsConfig = Object.assign({}, childConfig);
      let informantsConfig = Object.assign({}, childConfig);

      if (get(submitValues, 'child_id')) {
        childPatientURL += '/' + get(submitValues, 'child_id');
      } else {
        childData.append('uuid', uuidv4());
        childData.append('prefix', 'ch');
      }

      childData.append('given', get(submitValues, 'firstName') + ', ' +  get(submitValues, 'middleName'));
      childData.append('family', get(submitValues, 'family'));
      if (get(submitValues, 'birthDate')) {
        childData.append('birthDate', get(submitValues, 'birthDate').toDateString());
      }
      childData.append('gender', get(submitValues, 'gender'));
      childData.append('maritalStatus', 'single');
      childData.append('nationality', 'Ghana');
      childConfig.body = childData;

      if (get(submitValues, 'mother_id')) {
        motherPatientURL += '/' + get(submitValues, 'mother_id');
      } else {
        motherData.append('uuid', uuidv4());
        motherData.append('prefix', 'Mrs');
      }
      motherData.append('given', get(submitValues, 'mother_firstName')
       + ', ' +  get(submitValues, 'mother_middleName'));
      motherData.append('family', get(submitValues, 'mother_family'));
      if (get(submitValues, 'mother_birthDate')) {
        motherData.append('birthDate', get(submitValues, 'mother_birthDate').toDateString());
      }
      motherData.append('gender', get(submitValues, 'mother_gender'));
      motherData.append('maritalStatus', get(submitValues, 'mother_maritalStatus'));
      motherData.append('nationality', get(submitValues, 'mother_nationality'));
      motherConfig.body = motherData;

      if (get(submitValues, 'father_id')) {
        fatherPatientURL += '/' + get(submitValues, 'father_id');
      } else {
        fatherData.append('uuid', uuidv4());
        fatherData.append('prefix', 'Mr');
      }
      fatherData.append('given', get(submitValues, 'father_firstName')
       + ', ' +  get(submitValues, 'father_middleName'));
      fatherData.append('family', get(submitValues, 'father_family'));
      if (get(submitValues, 'father_birthDate')) {
        fatherData.append('birthDate', get(submitValues, 'father_birthDate').toDateString());
      }
      fatherData.append('gender', get(submitValues, 'father_gender'));
      fatherData.append('maritalStatus', get(submitValues, 'father_maritalStatus'));
      fatherData.append('nationality', get(submitValues, 'father_nationality'));
      fatherConfig.body = fatherData;

      const patientPromises = [];
      patientPromises.push(apiMiddleware(childConfig, childPatientURL, dispatch));
      patientPromises.push(apiMiddleware(motherConfig, motherPatientURL, dispatch));
      patientPromises.push(apiMiddleware(fatherConfig, fatherPatientURL, dispatch));

      Promise.all(patientPromises).then(updatedPatient => {

        const subPromises = [];

        const childID = get(updatedPatient[0], 'updated.id');
        const motherID = get(updatedPatient[1], 'updated.id');
        const fatherID = get(updatedPatient[2], 'updated.id');

        // set up addresses

        if (get(submitValues, 'child_address_id')) {
          childAddressURL += '/' + get(submitValues, 'child_address_id');
        }
        childAddressData.append('addressLine1', get(submitValues, 'mother_addressLine1'));
        childAddressData.append('addressLine2', get(submitValues, 'mother_addressLine2'));
        childAddressData.append('addressLine3', get(submitValues, 'mother_addressLine3'));
        childAddressData.append('city', get(submitValues, 'mother_city'));
        childAddressData.append('county', get(submitValues, 'mother_county'));
        childAddressData.append('state', get(submitValues, 'mother_state'));
        childAddressData.append('postalCode', get(submitValues, 'mother_postalCode'));

        childAddressData.append('patient_id', childID);

        childAddressConfig.body = childAddressData;

        if (get(submitValues, 'mother_address_id')) {
          motherAddressURL += '/' + get(submitValues, 'mother_address_id');
        }
        motherAddressData.append('addressLine1', get(submitValues, 'mother_addressLine1'));
        motherAddressData.append('addressLine2', get(submitValues, 'mother_addressLine2'));
        motherAddressData.append('addressLine3', get(submitValues, 'mother_addressLine3'));
        motherAddressData.append('city', get(submitValues, 'mother_city'));
        motherAddressData.append('county', get(submitValues, 'mother_county'));
        motherAddressData.append('state', get(submitValues, 'mother_state'));
        motherAddressData.append('postalCode', get(submitValues, 'mother_postalCode'));

        motherAddressData.append('patient_id', motherID);

        motherAddressConfig.body = motherAddressData;

        if (get(submitValues, 'father_address_id')) {
          fatherAddressURL += '/' + get(submitValues, 'father_address_id');
        }
        fatherAddressData.append('addressLine1', get(submitValues, 'father_addressLine1'));
        fatherAddressData.append('addressLine2', get(submitValues, 'father_addressLine2'));
        fatherAddressData.append('addressLine3', get(submitValues, 'father_addressLine3'));
        fatherAddressData.append('city', get(submitValues, 'father_city'));
        fatherAddressData.append('county', get(submitValues, 'father_county'));
        fatherAddressData.append('state', get(submitValues, 'father_state'));
        fatherAddressData.append('postalCode', get(submitValues, 'father_postalCode'));

        fatherAddressData.append('patient_id', fatherID);

        fatherAddressConfig.body = fatherAddressData;

        subPromises.push(apiMiddleware(childAddressConfig, childAddressURL, dispatch));
        subPromises.push(apiMiddleware(motherAddressConfig, motherAddressURL, dispatch));
        subPromises.push(apiMiddleware(fatherAddressConfig, fatherAddressURL, dispatch));
        //set up telecom
        if (get(submitValues, 'child_telecom_id')) {
          childTelecomURL += '/' + get(submitValues, 'child_telecom_id');
        }
        childTelecomData.append('email', get(submitValues, 'mother_email'));
        childTelecomData.append('phone', get(submitValues, 'mother_phone'));
        childTelecomData.append('use', get(submitValues, 'mother_use'));

        childTelecomData.append('patient_id', childID);

        childTelecomConfig.body = childTelecomData;

        if (get(submitValues, 'mother_telecom_id')) {
          motherTelecomURL += '/' + get(submitValues, 'mother_telecom_id');
        }
        motherTelecomData.append('email', get(submitValues, 'mother_email'));
        motherTelecomData.append('phone', get(submitValues, 'mother_phone'));
        motherTelecomData.append('use', get(submitValues, 'mother_use'));
        const motherPhone = get(submitValues, 'mother_phone');
        motherTelecomData.append('patient_id', motherID);

        motherTelecomConfig.body = motherTelecomData;

        if (get(submitValues, 'father_telecom_id')) {
          fatherTelecomURL += '/' + get(submitValues, 'father_telecom_id');
        }
        fatherTelecomData.append('email', get(submitValues, 'father_email'));
        fatherTelecomData.append('phone', get(submitValues, 'father_phone'));
        fatherTelecomData.append('use', get(submitValues, 'father_use'));

        fatherTelecomData.append('patient_id', fatherID);

        fatherTelecomConfig.body = fatherTelecomData;

        subPromises.push(apiMiddleware(childTelecomConfig, childTelecomURL, dispatch));
        subPromises.push(apiMiddleware(motherTelecomConfig, motherTelecomURL, dispatch));
        subPromises.push(apiMiddleware(fatherTelecomConfig, fatherTelecomURL, dispatch));

        //set up extra
        if (get(submitValues, 'child_extra_id')) {
          childExtraURL += '/' + get(submitValues, 'child_extra_id');
        }
        let newChildPersonalID = null;
        // temporarily create a dummy personal ID number.  Should be generated in the backend
        newChildPersonalID = 'G' + uuidv4().substring(0, 6).toUpperCase();
        childExtraData.append('personalIDNummber', newChildPersonalID);
        childExtraData.append('patient_id', childID);
        childExtraData.append('typeOfBirth', get(submitValues, 'typeOfBirth'));
        childExtraConfig.body = childExtraData;

        if (get(submitValues, 'mother_extra_id')) {
          motherExtraURL += '/' + get(submitValues, 'mother_extra_id');
        }
        motherExtraData.append('childrenBornAlive', get(submitValues, 'childrenBornAlive'));
        motherExtraData.append('childrenBornLiving', get(submitValues, 'childrenBornLiving'));
        motherExtraData.append('foetalDeaths', get(submitValues, 'foetalDeaths'));
        motherExtraData.append('birthDateLast', get(submitValues, 'birthDateLast'));
        motherExtraData.append('formalEducation', get(submitValues, 'mother_formalEducation'));
        motherExtraData.append('occupation', get(submitValues, 'mother_occupation'));
        motherExtraData.append('religion', get(submitValues, 'mother_religion'));
        motherExtraData.append('employment', get(submitValues, 'mother_employment'));
        motherExtraData.append('personalIDNummber', get(submitValues, 'mother_personalIDNummber'));
        motherExtraData.append('maidenName', get(submitValues, 'mother_maidenName'));
        motherExtraData.append('marriageDate', get(submitValues, 'mother_marriageDate'));
        

        motherExtraData.append('patient_id', motherID);

        motherExtraConfig.body = motherExtraData;

        if (get(submitValues, 'father_extra_id')) {
          fatherExtraURL += '/' + get(submitValues, 'father_extra_id');
        }

        
        fatherExtraData.append('formalEducation', get(submitValues, 'father_formalEducation'));
        fatherExtraData.append('occupation', get(submitValues, 'father_occupation'));
        fatherExtraData.append('religion', get(submitValues, 'father_religion'));
        fatherExtraData.append('employment', get(submitValues, 'father_employment'));
        fatherExtraData.append('personalIDNummber', get(submitValues, 'father_personalIDNummber'));
        fatherExtraData.append('maidenName', get(submitValues, 'father_maidenName'));
        fatherExtraData.append('marriageDate', get(submitValues, 'father_marriageDate'));

        fatherExtraData.append('patient_id', fatherID);

        fatherExtraConfig.body = fatherExtraData;

        subPromises.push(apiMiddleware(motherExtraConfig, motherExtraURL, dispatch));
        subPromises.push(apiMiddleware(fatherExtraConfig, fatherExtraURL, dispatch));
        subPromises.push(apiMiddleware(childExtraConfig, childExtraURL, dispatch));

        Promise.all(subPromises).then(updatedItems => {

          const declarationPromises = [];
          let newBirthRegistrationNumber = null;

          if (newDeclaration) {
            const newUuid = uuidv4();
            const prefix = get(submitValues, 'code').substring(0, 1);
            const suffix1 = get(submitValues, 'tracking').substring(3, 8);
            const suffix2 = get(submitValues, 'firstName').substring(0, 1);
            const suffix3 = get(submitValues, 'family').substring(0, 1);
            const newTrackID = prefix + 'd-' + suffix1 + suffix2 + suffix3;
            if (get(submitValues, 'uuid')) {
              declarationsData.append('uuid', get(submitValues, 'uuid'));
            } else {
              declarationsData.append('uuid', newUuid);
            }
            declarationsData.append('tracking', newTrackID.toUpperCase());
            declarationsData.append('motherDetails', motherID);
            declarationsData.append('fatherDetails', fatherID);
            declarationsData.append('childDetails', childID);
            declarationsData.append('code', get(submitValues, 'code'));
            if (saving) {
              if (role == 'registrar') {
                declarationsData.append('status', 'declared-saved');
                console.log('declared-saved');
              } else if (role == 'field officer') {
                declarationsData.append('status', 'notified-saved');
                console.log('notified-saved');
              }
            } else {
              if (role == 'field officer') {
                declarationsData.append('status', 'declared');
                console.log('declared');
              } else if (role == 'registrar') {
                declarationsData.append('status', 'validated');
                console.log('validated');
              }
            }
          } else if (newNotification) {
            const newUuid = uuidv4();
            const prefix = get(submitValues, 'tracking').substring(0, 1);
            const suffix1 = get(submitValues, 'firstName').substring(0, 1);
            const suffix2 = get(submitValues, 'family').substring(0, 1);
            const newTrackID = prefix + 'd-' + newUuid.substring(0, 8) + suffix1 + suffix2;

            declarationsData.append('uuid', get(submitValues, 'uuid'));
            declarationsData.append('tracking', newTrackID);
            declarationsData.append('motherDetails', motherID);
            declarationsData.append('fatherDetails', fatherID);
            declarationsData.append('childDetails', childID);
            declarationsData.append('code', 'birth-declaration');
            if (saving) {
              console.log('notified-saved');
              declarationsData.append('status', 'notified-saved');
            } else {
              console.log('declared');
              declarationsData.append('status', 'declared');
            }
          } else {
            declarationsURL += '/' + selectedDeclaration.id;
            if (saving) {
              if (role == 'registrar') {
                declarationsData.append('status', 'declared-saved');
                console.log('declared-saved');
              } else if (role == 'field officer') {
                declarationsData.append('status', 'notified-saved');
                console.log('notified-saved');
              }
            } else {
              if (role == 'field officer') {
                declarationsData.append('status', 'declared');
                console.log('declared');
              } else if (role == 'registrar') {
                declarationsData.append('status', 'validated');
                newBirthRegistrationNumber = uuidv4().substring(0, 6).toUpperCase();
                // temporarily create a dummy birth registration number
                childData.append('birthRegistrationNumber', newBirthRegistrationNumber);
                console.log('validated');
              }
            }
          }

          declarationsConfig.body = declarationsData;

          declarationPromises.push(apiMiddleware(declarationsConfig, declarationsURL, dispatch));
          Promise.all(declarationPromises).then(updatedDeclaration => {

            const declarationID = updatedDeclaration[0].updated.id;
            const trackingID = updatedDeclaration[0].updated.tracking;
            const declarationExtraPromises = [];
            if (get(submitValues, 'location_id')) {
              locationsURL += '/' + get(submitValues, 'location_id');
            }
            locationsData.append('placeOfDelivery', get(submitValues, 'placeOfDelivery'));
            locationsData.append('attendantAtBirth', get(submitValues, 'attendantAtBirth'));
            locationsData.append('hospitalName', get(submitValues, 'hospitalName'));
            locationsData.append('addressLine1', get(submitValues, 'addressLine1'));
            locationsData.append('addressLine2', get(submitValues, 'addressLine2'));
            locationsData.append('addressLine3', get(submitValues, 'addressLine3'));
            locationsData.append('city', get(submitValues, 'city'));
            locationsData.append('county', get(submitValues, 'county'));
            locationsData.append('state', get(submitValues, 'state'));
            locationsData.append('postalCode', get(submitValues, 'postalCode'));
            locationsData.append('declaration_id', declarationID);
            locationsConfig.body = locationsData;


            if (get(submitValues, 'informant_id')) {
              informantsURL += '/' + get(submitValues, 'informant_id');
            } else {
              informantsData.append('uuid', uuidv4());
            }
            informantsData.append('given', get(submitValues, 'informant_firstName')
               + ', ' +  get(submitValues, 'informant_middleName'));
            informantsData.append('family', get(submitValues, 'informant_family'));
            informantsData.append('relationship', get(submitValues, 'informant_relationship'));
            informantsData.append('phone', get(submitValues, 'informant_phone'));
            informantsData.append('email', get(submitValues, 'informant_email'));
            informantsData.append('personalIDNummber', get(submitValues, 'informant_personalIDNummber'));
            informantsData.append('addressLine1', get(submitValues, 'addressLine1'));
            informantsData.append('addressLine2', get(submitValues, 'addressLine2'));
            informantsData.append('addressLine3', get(submitValues, 'addressLine3'));
            informantsData.append('city', get(submitValues, 'city'));
            informantsData.append('county', get(submitValues, 'county'));
            informantsData.append('state', get(submitValues, 'state'));
            informantsData.append('postalCode', get(submitValues, 'postalCode'));
            informantsData.append('declaration_id', declarationID);
            informantsConfig.body = informantsData;

            if (newNotification) {
              notificationsData.append('uuid', get(submitValues, 'uuid'));
              notificationsConfig.body = notificationsData;
            }

            declarationExtraPromises.push(apiMiddleware(locationsConfig, locationsURL, dispatch));
            declarationExtraPromises.push(apiMiddleware(informantsConfig, informantsURL, dispatch));
            if (newNotification) {
              declarationExtraPromises.push(apiMiddleware(notificationsConfig, notificationsURL, dispatch));
            }

            Promise.all(declarationExtraPromises).then(updatedDeclaration => {
              const imagePromises = [];
              if (newDeclaration || newNotification) {
                if (tempImages.length > 0) {
                  tempImages.forEach((image) => {
                    let newDocURL = BASE_URL + 'documents/' + image.id;
                    let documentsData = new FormData();
                    documentsData.append('declaration_id', declarationID);
                    let documentsConfig = {
                      method: 'PUT',
                      headers: { Authorization: `Bearer ${token}` },
                    };
                    documentsConfig.body = documentsData;
                    imagePromises.push(apiMiddleware(documentsConfig, newDocURL, dispatch));
                  });

                  Promise.all(imagePromises).then(updatedImage => {
                    if (saving == true) {
                      dispatch(savingCompleted());
                      dispatch(launchSnack('Your progress has been saved'));
                    } else {
                      dispatch(trackingModalOpened());
                    }
                    dispatch(resetPatients());
                    dispatch(clearTempImages());
                    dispatch(submitDeclarationSuccess(trackingID, newBirthRegistrationNumber, newChildPersonalID));
                    dispatch(fetchDeclarations(role));
                  });
                } else {
                  if (saving == true) {
                    dispatch(resetPatients());
                    dispatch(savingCompleted());
                    dispatch(submitDeclarationSuccess(trackingID, newBirthRegistrationNumber, newChildPersonalID));
                    dispatch(fetchDeclarations(role));
                    dispatch(launchSnack('Your progress has been saved'));
                  }
                }
              } else {
                dispatch(clearTempImages());
                if (saving == true) {
                  dispatch(savingCompleted());
                  dispatch(resetPatients());
                  dispatch(submitDeclarationSuccess(trackingID, newBirthRegistrationNumber, newChildPersonalID));
                  dispatch(fetchDeclarations(role));
                  dispatch(launchSnack('Your progress has been saved'));
                } else if (role == 'registrar' && saving == false) {
                  dispatch(submitDeclarationSuccess(trackingID, newBirthRegistrationNumber, newChildPersonalID));
                  const smsMessage = 'The registration process for tracking number ' + trackingID.toUpperCase() 
                    + ' is now complete. The birth is now registered with birth registration number '
                    + newBirthRegistrationNumber + '. Please now pay 10 GH₵ for the birth certificate by mobile money,'
                    + ' using transfer agents Airtel or Mpesa. Payee reference:'
                    + ' 98766 Your reference: ' + trackingID.toUpperCase()
                    + ' Once payment is received, the birth certificate will be available after 3 working days'
                    + ' from Agona West Civil Registration Centre, High Street, Agona West, Central Region.';
                  dispatch(resetPatients());
                  dispatch(fetchDeclarations(role));
                  dispatch(trackingModalOpened());
                  dispatch(sendSMS(motherPhone, smsMessage));
                } else {
                  dispatch(resetPatients());
                  dispatch(submitDeclarationSuccess(trackingID));
                  dispatch(fetchDeclarations(role));
                  dispatch(trackingModalOpened());
                }
              }
            });
          });
        });
      });
    }  
  
  };
}
