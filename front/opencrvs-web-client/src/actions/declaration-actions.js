/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 12:09:36
 */
import { BASE_URL } from 'constants/urls';
import { logoutUser, updateUserDetails } from 'actions/user-actions';
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

function submitDeclarationSuccess(data) {
  return {
    type: DECLARATION_SUBMIT_SUCCESS,
    isSubmitting: false,
    declarations: data,
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

const apiMiddleware = function (config, url, dispatch) {

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
  console.log('ACTION 1 :' + values);
  let token = localStorage.getItem('token') || null;
  let submitURL = BASE_URL + 'patient';
  return (dispatch, getState) => {
    const {selectedDeclaration, newDeclaration} = getState().declarationsReducer;
    const {images} = getState().imageReducer;
    // loop through patients
    console.log(selectedDeclaration.id);
    let childConfig = {};

    if (newDeclaration){
      //new declaration POST and no ID required
      //set childConfig POST
     
      childConfig = {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      };
    } else {
      //existing declaration PUT and ID required
      //set childConfig PUT
      childConfig = {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      };
      submitURL += '/' + selectedDeclaration.id;
    }


    let motherConfig = Object.assign({}, childConfig);
    let fatherConfig = Object.assign({}, childConfig);

    const childData = new FormData();
    childData.append('given', get(values, 'firstName') + ', ' +  get(values, 'middleName'));
    childData.append('family', get(values, 'family'));
    childData.append('birthDate', get(values, 'birthDate'));
    childData.append('gender', get(values, 'gender'));
    childData.append('maritalStatus', get(values, 'maritalStatus'));
    childData.append('nationality', get(values, 'nationality'));
    childConfig.body = childData;

    const motherData = new FormData();
    motherData.append('given', get(values, 'mother_firstName') + ', ' +  get(values, 'mother_middleName'));
    motherData.append('family', get(values, 'mother_family'));
    motherData.append('birthDate', get(values, 'mother_birthDate'));
    motherData.append('gender', get(values, 'mother_gender'));
    motherData.append('maritalStatus', get(values, 'mother_maritalStatus'));
    motherData.append('nationality', get(values, 'mother_nationality'));
    motherConfig.body = motherData;

    const fatherData = new FormData();
    fatherData.append('given', get(values, 'father_firstName') + ', ' +  get(values, 'father_middleName'));
    fatherData.append('family', get(values, 'father_family'));
    fatherData.append('birthDate', get(values, 'father_birthDate'));
    fatherData.append('gender', get(values, 'father_gender'));
    fatherData.append('maritalStatus', get(values, 'father_maritalStatus'));
    fatherData.append('nationality', get(values, 'father_nationality'));
    fatherConfig.body = fatherData;

    console.log(submitURL);

    const patientPromises = [];
    patientPromises.push(apiMiddleware(childConfig, submitURL, dispatch));
    patientPromises.push(apiMiddleware(motherConfig, submitURL, dispatch));
    patientPromises.push(apiMiddleware(fatherConfig, submitURL, dispatch));

    Promise.all(patientPromises).then(values => { 
      console.log(values); // [3, 1337, "foo"] 
    });
/*














    if (token) {
      dispatch(updateUserDetails(token));
      return fetch(BASE_URL + 'patients', config)
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
    dispatch(requestSubmit());

  */
  };
}

