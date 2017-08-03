/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-03 10:14:42
 */
import { BASE_URL } from 'constants/urls';
import { apiMiddleware } from 'utils/api-middleware';
import { logoutUser } from 'actions/user-actions';
import { selectWorkView } from 'actions/global-actions';
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
export const DECLARATION_SEARCH = 'DECLARATION_SEARCH';
export const OLD_DOCUMENT_DELETED = 'OLD_DOCUMENT_DELETED';
export const DECLARATION_READY_TO_CONFIRM = 'DECLARATION_READY_TO_CONFIRM';
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

function submitDeclarationSuccess(trackingID) {
  return {
    type: DECLARATION_SUBMIT_SUCCESS,
    isSubmitting: false,
    trackingID,
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

function setFormSubmitValues(values) {
  return {
    type: DECLARATION_READY_TO_CONFIRM,
    values,
  };
}

export function submitModalOpen(values) {
  return dispatch => {
    dispatch(submitModalOpened());
    dispatch(setFormSubmitValues(values));
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
      const created = Moment(declaration.created_at).format('MMM Do YY');
      let given = get(head(filter(patients, function(patient) { 
        return patient.patient.id == declaration.childDetails; 
      })), 'patient.given');
      let family = get(head(filter(patients, function(patient) { 
        return patient.patient.id == declaration.childDetails; 
      })), 'patient.family');

      let dob = get(head(filter(patients, function(patient) { 
        return patient.patient.id == declaration.childDetails; 
      })), 'patient.birthDate');

      const dobFormat = Moment(dob).format('MMM Do YY');
      const tests = [];
      tests.push(Fuzzysearch(value.toUpperCase(), given.toUpperCase()));
      tests.push(Fuzzysearch(value.toUpperCase(), family.toUpperCase()));
      tests.push(Fuzzysearch(value.toUpperCase(), declaration.tracking.toUpperCase()));
      tests.push(Fuzzysearch(value, dobFormat));
      tests.push(Fuzzysearch(value, created));

      tests.forEach((test) => {
        if ( test == true) {
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

export function fetchDeclarations() {
  let token = localStorage.getItem('token') || null;
  let config = {};
  return dispatch => {
    dispatch(requestDeclaration());
    if (token) {
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
    } else {
      dispatch(declarationError('No token saved!'));
      return false;
    }
  };
}


export function submitDeclaration() {

  let token = localStorage.getItem('token') || null;
  let childPatientURL = BASE_URL + 'patient';
  let motherPatientURL = BASE_URL + 'patient';
  let fatherPatientURL = BASE_URL + 'patient';

  let childAddressURL = BASE_URL + 'address';
  let childTelecomURL = BASE_URL + 'telecom';

  let motherAddressURL = BASE_URL + 'address';
  let motherTelecomURL = BASE_URL + 'telecom';
  let motherExtraURL = BASE_URL + 'extra';

  let fatherAddressURL = BASE_URL + 'address';
  let fatherTelecomURL = BASE_URL + 'telecom';
  let fatherExtraURL = BASE_URL + 'extra';

  let declarationsURL = BASE_URL + 'declarations';
  let locationsURL = BASE_URL + 'locations';
  let informantsURL = BASE_URL + 'informant';

  return (dispatch, getState) => {
    const {selectedDeclaration, newDeclaration, submitValues} = getState().declarationsReducer;
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

      //const childExtraData = new FormData();
      const motherExtraData = new FormData();
      const fatherExtraData = new FormData();

      const declarationsData = new FormData();
      const locationsData = new FormData();
      const informantsData = new FormData();

      if (newDeclaration) {
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
      let informantsConfig = Object.assign({}, childConfig);

      if (get(submitValues, 'child_id')) { 
        childPatientURL += '/' + get(submitValues, 'child_id');
      } else {
        childData.append('uuid', uuidv4());
        childData.append('prefix', 'ch');
      }
      childData.append('given', get(submitValues, 'firstName') + ', ' +  get(submitValues, 'middleName'));
      childData.append('family', get(submitValues, 'family'));
      childData.append('birthDate', get(submitValues, 'birthDate').toDateString());
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
      motherData.append('given', get(submitValues, 'mother_firstName') + ', ' +  get(submitValues, 'mother_middleName'));
      motherData.append('family', get(submitValues, 'mother_family'));
      motherData.append('birthDate', get(submitValues, 'mother_birthDate').toDateString());
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
      fatherData.append('given', get(submitValues, 'father_firstName') + ', ' +  get(submitValues, 'father_middleName'));
      fatherData.append('family', get(submitValues, 'father_family'));
      fatherData.append('birthDate', get(submitValues, 'father_birthDate').toDateString());
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
        if (get(submitValues, 'mother_extra_id')) { 
          motherExtraURL += '/' + get(submitValues, 'mother_extra_id');
        }
        motherExtraData.append('childrenBornAlive', get(submitValues, 'mother_childrenBornAlive'));
        motherExtraData.append('childrenBornLiving', get(submitValues, 'mother_childrenBornLiving'));
        motherExtraData.append('foetalDeaths', get(submitValues, 'mother_foetalDeaths'));
        motherExtraData.append('birthDateLast', get(submitValues, 'mother_birthDateLast'));
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

        fatherExtraData.append('childrenBornAlive', get(submitValues, 'father_childrenBornAlive'));
        fatherExtraData.append('childrenBornLiving', get(submitValues, 'father_childrenBornLiving'));
        fatherExtraData.append('foetalDeaths', get(submitValues, 'father_foetalDeaths'));
        fatherExtraData.append('birthDateLast', get(submitValues, 'father_birthDateLast'));
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
        
        Promise.all(subPromises).then(updatedItems => { 

          const declarationPromises = [];

          if (newDeclaration) { 
            const newUuid = uuidv4();
            const prefix = get(submitValues, 'code').substring(0, 1);
            const suffix1 = get(submitValues, 'firstName').substring(0, 1);
            const suffix2 = get(submitValues, 'family').substring(0, 1);
            const newTrackID = prefix + 'd-' + newUuid.substring(0, 8) + suffix1 + suffix2;

            declarationsData.append('uuid', newUuid);
            declarationsData.append('tracking', newTrackID.toUpperCase());
            declarationsData.append('motherDetails', motherID);
            declarationsData.append('fatherDetails', fatherID);
            declarationsData.append('childDetails', childID);
            declarationsData.append('code', get(submitValues, 'code'));
            declarationsData.append('status', 'saved');
          } else {
            declarationsURL += '/' + selectedDeclaration.id;
            declarationsData.append('status', 'submitted');
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
            informantsData.append('given', get(submitValues, 'informant_firstName') + ', ' +  get(submitValues, 'informant_middleName'));
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

            declarationExtraPromises.push(apiMiddleware(locationsConfig, locationsURL, dispatch));
            declarationExtraPromises.push(apiMiddleware(informantsConfig, informantsURL, dispatch));

            
            Promise.all(declarationExtraPromises).then(updatedDeclaration => { 
              const imagePromises = [];
              if (newDeclaration) {
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
                    
                    dispatch(submitDeclarationSuccess(trackingID));
                    dispatch(clearTempImages());
                    dispatch(fetchDeclarations());
                    dispatch(trackingModalOpened());
                  });
                } else {
                  console.log('error no images in declaration');
                }
              } else {
                dispatch(submitDeclarationSuccess(trackingID));
                dispatch(clearTempImages());
                dispatch(fetchDeclarations());
                dispatch(trackingModalOpened());
              }
            });
          });
          
        });
      });
    }
  };
}

