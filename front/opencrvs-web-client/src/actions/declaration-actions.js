/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 12:28:31
 */
import { BASE_URL } from 'constants/urls';
import { logoutUser, updateUserDetails } from 'actions/user-actions';
import { clearTempImages } from 'actions/image-actions';
import { get, head } from 'lodash';
import { fetchPatients } from 'actions/patient-actions';
export const DECLARATION_REQUEST = 'DECLARATION_REQUEST';
export const DECLARATION_SUCCESS = 'DECLARATION_SUCCESS';
export const DECLARATION_FAILURE = 'DECLARATION_FAILURE';
export const DECLARATION_SELECTED = 'DECLARATION_SELECTED';
export const DECLARATION_CLOSED = 'DECLARATION_CLOSED';
export const NEW_DECL_MODAL_OPENED = 'NEW_DECL_MODAL_OPENED';
export const NEW_DECL_MODAL_CLOSED = 'NEW_DECL_MODAL_CLOSED';
export const NEW_DECL_EDIT = 'NEW_DECL_EDIT';
export const SUBMIT_MODAL_TOGGLE = 'SUBMIT_MODAL_TOGGLE';
export const DECLARATION_SUBMIT_REQUEST = 'DECLARATION_SUBMIT_REQUEST';
export const DECLARATION_SUBMIT_SUCCESS = 'DECLARATION_SUBMIT_SUCCESS';
export const DECLARATION_SUBMIT_FAILURE = 'DECLARATION_SUBMIT_FAILURE';
export const TRACKING_MODAL_TOGGLE = 'TRACKING_MODAL_TOGGLE';
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
    workView: true,
    authenticated: true,
  };
}

function requestSubmit() {
  return {
    type: DECLARATION_SUBMIT_REQUEST,
    isSubmitting: true,
  };
}

function submitDeclarationSuccess(trackingID) {
  return {
    type: DECLARATION_SUBMIT_SUCCESS,
    isSubmitting: false,
    trackingID,
  };
}

function submitDeclarationFailure(message) {
  return {
    type: DECLARATION_SUBMIT_FAILURE,
    isSubmitting: false,
    message,
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

export function newDeclarationModalClosed() {
  return {
    type: NEW_DECL_MODAL_CLOSED,
    newDeclarationModal: false,
  };
}

export function selectDeclaration(declaration) {
  return {
    type: DECLARATION_SELECTED,
    selectedDeclaration: declaration,
    newDeclaration: false,
  };
}

function receiveDeclaration(data) {
  return {
    type: DECLARATION_SUCCESS,
    isFetching: false,
    authenticated: true,
    declarations: data,
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

function workViewClosed() {
  return {
    type: DECLARATION_CLOSED,
    isFetching: false,
    workView: false,
  };
}

export function deselctWorkView() {
  return dispatch => {
    dispatch(workViewClosed());
  };
}

export function fetchDeclarations() {
  let token = localStorage.getItem('token') || null;
  let config = {};
  return dispatch => {
    dispatch(requestDeclaration());
    if (token) {
      dispatch(updateUserDetails(token));
      config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      return fetch(BASE_URL + 'declarations', config)
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
            dispatch(fetchPatients(declaration.childDetails));
            dispatch(fetchPatients(declaration.motherDetails));
            dispatch(fetchPatients(declaration.fatherDetails));
          });
          return true;
        })
        .catch(err => {
          if (err.message == 'Invalid token') {
            dispatch(logoutUser());
          } else {
            console.log(err);
          }
        });
    } else {
      dispatch(declarationError('No token saved!'));
      return false;
    }
  };
}

const apiMiddleware = function(config, url, dispatch) {

  return fetch(url, config)
    .then(response =>
      response.json().then(payload => ({ payload, response }))
    )
    .then(({ payload, response }) => {
      if (!response.ok) {
        return Promise.reject(payload);
      } else {
        return payload;
      }
    })
    .catch(err => {
      if (err.message == 'Invalid token') {
        dispatch(logoutUser());
      } else {
        console.log(err);
      }
    });
};

export function submitDeclaration(values) {

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
  let documentsURL = BASE_URL + 'documents';

  return (dispatch, getState) => {
    const {selectedDeclaration, newDeclaration} = getState().declarationsReducer;
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

    //const childExtraData = new FormData();
    const motherExtraData = new FormData();
    const fatherExtraData = new FormData();

    const declarationsData = new FormData();
    const locationsData = new FormData();
    const documentsData = new FormData();

    if (newDeclaration){
      childConfig = {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      };
    } else {
      childConfig = {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      };
      childData.append('id', get(values, 'child_id'));
      motherData.append('id', get(values, 'mother_id'));
      fatherData.append('id', get(values, 'father_id'));
      
    }


    let motherConfig = Object.assign({}, childConfig);
    let fatherConfig = Object.assign({}, childConfig);

    let childAddressConfig = Object.assign({}, childConfig);
    let motherAddressConfig = Object.assign({}, childConfig);
    let fatherAddressConfig = Object.assign({}, childConfig);

    let childTelecomConfig = Object.assign({}, childConfig);
    let motherTelecomConfig = Object.assign({}, childConfig);
    let fatherTelecomConfig = Object.assign({}, childConfig);

    //let childExtraConfig = Object.assign({}, childConfig);
    let motherExtraConfig = Object.assign({}, childConfig);
    let fatherExtraConfig = Object.assign({}, childConfig);

    let declarationsConfig = Object.assign({}, childConfig);
    let locationsConfig = Object.assign({}, childConfig);
    let documentsConfig = Object.assign({}, childConfig);

    if (get(values, 'child_id')) { 
      childPatientURL += '/' + get(values, 'child_id');
    }
    childData.append('given', get(values, 'firstName') + ', ' +  get(values, 'middleName'));
    childData.append('family', get(values, 'family'));
    childData.append('birthDate', get(values, 'birthDate').toDateString());
    childData.append('gender', get(values, 'gender'));
    childData.append('maritalStatus', 'single');
    childData.append('nationality', 'Ghana');
    childConfig.body = childData;

    if (get(values, 'mother_id')) { 
      motherPatientURL += '/' + get(values, 'mother_id');
    }
    motherData.append('given', get(values, 'mother_firstName') + ', ' +  get(values, 'mother_middleName'));
    motherData.append('family', get(values, 'mother_family'));
    motherData.append('birthDate', get(values, 'mother_birthDate').toDateString());
    motherData.append('gender', get(values, 'mother_gender'));
    motherData.append('maritalStatus', get(values, 'mother_maritalStatus'));
    motherData.append('nationality', get(values, 'mother_nationality'));
    motherConfig.body = motherData;

    if (get(values, 'father_id')) { 
      fatherPatientURL += '/' + get(values, 'father_id');
    }
    fatherData.append('given', get(values, 'father_firstName') + ', ' +  get(values, 'father_middleName'));
    fatherData.append('family', get(values, 'father_family'));
    fatherData.append('birthDate', get(values, 'father_birthDate').toDateString());
    fatherData.append('gender', get(values, 'father_gender'));
    fatherData.append('maritalStatus', get(values, 'father_maritalStatus'));
    fatherData.append('nationality', get(values, 'father_nationality'));
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

      if (get(values, 'child_address_id')) { 
        childAddressURL += '/' + get(values, 'child_address_id');
      }
      childAddressData.append('addressLine1', get(values, 'mother_addressLine1'));
      childAddressData.append('addressLine2', get(values, 'mother_addressLine2'));
      childAddressData.append('addressLine3', get(values, 'mother_addressLine3'));
      childAddressData.append('city', get(values, 'mother_city'));
      childAddressData.append('county', get(values, 'mother_county'));
      childAddressData.append('state', get(values, 'mother_state'));
      childAddressData.append('postalCode', get(values, 'mother_postalCode'));

      childAddressData.append('patient_id', childID);

      childAddressConfig.body = childAddressData;

      if (get(values, 'mother_address_id')) { 
        motherAddressURL += '/' + get(values, 'mother_address_id');
      }
      motherAddressData.append('addressLine1', get(values, 'mother_addressLine1'));
      motherAddressData.append('addressLine2', get(values, 'mother_addressLine2'));
      motherAddressData.append('addressLine3', get(values, 'mother_addressLine3'));
      motherAddressData.append('city', get(values, 'mother_city'));
      motherAddressData.append('county', get(values, 'mother_county'));
      motherAddressData.append('state', get(values, 'mother_state'));
      motherAddressData.append('postalCode', get(values, 'mother_postalCode'));

      motherAddressData.append('patient_id', motherID);

      motherAddressConfig.body = motherAddressData;

      if (get(values, 'father_address_id')) { 
        fatherAddressURL += '/' + get(values, 'father_address_id');
      }
      fatherAddressData.append('addressLine1', get(values, 'father_addressLine1'));
      fatherAddressData.append('addressLine2', get(values, 'father_addressLine2'));
      fatherAddressData.append('addressLine3', get(values, 'father_addressLine3'));
      fatherAddressData.append('city', get(values, 'father_city'));
      fatherAddressData.append('county', get(values, 'father_county'));
      fatherAddressData.append('state', get(values, 'father_state'));
      fatherAddressData.append('postalCode', get(values, 'father_postalCode'));

      fatherAddressData.append('patient_id', fatherID);

      fatherAddressConfig.body = fatherAddressData;

      subPromises.push(apiMiddleware(childAddressConfig, childAddressURL, dispatch));
      subPromises.push(apiMiddleware(motherAddressConfig, motherAddressURL, dispatch));
      subPromises.push(apiMiddleware(fatherAddressConfig, fatherAddressURL, dispatch));
      //set up telecom
      if (get(values, 'child_telecom_id')) { 
        childTelecomURL += '/' + get(values, 'child_telecom_id');
      }
      childTelecomData.append('email', get(values, 'mother_email'));
      childTelecomData.append('phone', get(values, 'mother_phone'));
      childTelecomData.append('use', get(values, 'mother_use'));

      childTelecomData.append('patient_id', childID);

      childTelecomConfig.body = childTelecomData;

      if (get(values, 'mother_telecom_id')) { 
        motherTelecomURL += '/' + get(values, 'mother_telecom_id');
      }
      motherTelecomData.append('email', get(values, 'mother_email'));
      motherTelecomData.append('phone', get(values, 'mother_phone'));
      motherTelecomData.append('use', get(values, 'mother_use'));

      motherTelecomData.append('patient_id', motherID);

      motherTelecomConfig.body = motherTelecomData;

      if (get(values, 'father_telecom_id')) { 
        fatherTelecomURL += '/' + get(values, 'father_telecom_id');
      }
      fatherTelecomData.append('email', get(values, 'father_email'));
      fatherTelecomData.append('phone', get(values, 'father_phone'));
      fatherTelecomData.append('use', get(values, 'father_use'));

      fatherTelecomData.append('patient_id', fatherID);

      fatherTelecomConfig.body = fatherTelecomData;

      subPromises.push(apiMiddleware(childTelecomConfig, childTelecomURL, dispatch));
      subPromises.push(apiMiddleware(motherTelecomConfig, motherTelecomURL, dispatch));
      subPromises.push(apiMiddleware(fatherTelecomConfig, fatherTelecomURL, dispatch));
      //set up extra
      if (get(values, 'mother_extra_id')) { 
        motherExtraURL += '/' + get(values, 'mother_extra_id');
      }
      motherExtraData.append('childrenBornAlive', get(values, 'mother_childrenBornAlive'));
      motherExtraData.append('childrenBornLiving', get(values, 'mother_childrenBornLiving'));
      motherExtraData.append('foetalDeaths', get(values, 'mother_foetalDeaths'));
      motherExtraData.append('birthDateLast', get(values, 'mother_birthDateLast'));
      motherExtraData.append('formalEducation', get(values, 'mother_formalEducation'));
      motherExtraData.append('occupation', get(values, 'mother_occupation'));
      motherExtraData.append('religion', get(values, 'mother_religion'));
      motherExtraData.append('employment', get(values, 'mother_employment'));
      motherExtraData.append('personalIDNummber', get(values, 'mother_personalIDNummber'));
      motherExtraData.append('maidenName', get(values, 'mother_maidenName'));
      motherExtraData.append('marriageDate', get(values, 'mother_marriageDate'));

      motherExtraData.append('patient_id', motherID);

      motherExtraConfig.body = motherExtraData;

      if (get(values, 'father_extra_id')) { 
        fatherExtraURL += '/' + get(values, 'father_extra_id');
      }

      fatherExtraData.append('childrenBornAlive', get(values, 'father_childrenBornAlive'));
      fatherExtraData.append('childrenBornLiving', get(values, 'father_childrenBornLiving'));
      fatherExtraData.append('foetalDeaths', get(values, 'father_foetalDeaths'));
      fatherExtraData.append('birthDateLast', get(values, 'father_birthDateLast'));
      fatherExtraData.append('formalEducation', get(values, 'father_formalEducation'));
      fatherExtraData.append('occupation', get(values, 'father_occupation'));
      fatherExtraData.append('religion', get(values, 'father_religion'));
      fatherExtraData.append('employment', get(values, 'father_employment'));
      fatherExtraData.append('personalIDNummber', get(values, 'father_personalIDNummber'));
      fatherExtraData.append('maidenName', get(values, 'father_maidenName'));
      fatherExtraData.append('marriageDate', get(values, 'father_marriageDate'));

      fatherExtraData.append('patient_id', fatherID);

      fatherExtraConfig.body = fatherExtraData;

      subPromises.push(apiMiddleware(motherExtraConfig, motherExtraURL, dispatch));
      subPromises.push(apiMiddleware(fatherExtraConfig, fatherExtraURL, dispatch));

      Promise.all(subPromises).then(updatedItems => { 
        // save declaration then update tempImages and clear them
        const declarationPromises = [];

        if (newDeclaration) { 
          declarationsData.append('uuid', uuidv4());
          declarationsData.append('motherDetails', motherID);
          declarationsData.append('fatherDetails', fatherID);
          declarationsData.append('childDetails', childID);
          declarationsData.append('code', get(values, 'code'));
          declarationsData.append('status', 'submitted');
        } else {
          declarationsURL += '/' + selectedDeclaration.id;
          declarationsData.append('status', 'submitted');
        }

        declarationsConfig.body = declarationsData;

        declarationPromises.push(apiMiddleware(declarationsConfig, declarationsURL, dispatch));
        Promise.all(declarationPromises).then(updatedDeclaration => { 
          const declarationID = updatedDeclaration[0].updated.id;
          const trackingID = updatedDeclaration[0].updated.tracking;
          const locationPromises = [];
          // TODO update locations

          if (get(values, 'location_id')) { 
            locationsURL += '/' + get(values, 'location_id');
          }
          locationsData.append('placeOfDelivery', get(values, 'placeOfDelivery'));
          locationsData.append('attendantAtBirth', get(values, 'attendantAtBirth'));
          locationsData.append('hospitalName', get(values, 'hospitalName'));
          locationsData.append('addressLine1', get(values, 'addressLine1'));
          locationsData.append('addressLine2', get(values, 'addressLine2'));
          locationsData.append('addressLine3', get(values, 'addressLine3'));
          locationsData.append('city', get(values, 'city'));
          locationsData.append('county', get(values, 'county'));
          locationsData.append('state', get(values, 'state'));
          locationsData.append('postalCode', get(values, 'postalCode'));
          locationsData.append('declaration_id', declarationID);
          locationsConfig.body = locationsData;

          locationPromises.push(apiMiddleware(locationsConfig, locationsURL, dispatch));
          Promise.all(locationPromises).then(updatedDeclaration => { 
            dispatch(submitDeclarationSuccess(trackingID));
            dispatch(clearTempImages());
            dispatch(fetchDeclarations());
            dispatch(trackingModalOpened());
          });
        });

        // display modal with tracking ID
        
        /*images.forEach((image) => {
            dispatch(fetchPatients(declaration.childDetails));
            dispatch(fetchPatients(declaration.motherDetails));
            dispatch(fetchPatients(declaration.fatherDetails));
          });*/

          /*
    let declarationsConfig = Object.assign({}, childConfig);
    let locationsConfig = Object.assign({}, childConfig);
    let documentsConfig = Object.assign({}, childConfig);

          const declarationsData = new FormData();
    const locationsData = new FormData();
    const documentsData = new FormData();
            let declarationsURL = BASE_URL + 'declarations';
            let locationsURL = BASE_URL + 'locations';
            let documentsURL = BASE_URL + 'documents';

            return (dispatch, getState) => {
              const {selectedDeclaration, newDeclaration} = getState().declarationsReducer;
              const {tempImages} = getState().imageReducer;
          */
      });
    });
  };
}

