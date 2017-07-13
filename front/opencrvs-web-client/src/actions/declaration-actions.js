/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-13 12:44:23
 */
import { BASE_URL } from 'constants/urls';
import { logoutUser, updateUserDetails } from 'actions/user-actions';
import { fetchPatients } from 'actions/patient-actions';
export const DECLARATION_REQUEST = 'DECLARATION_REQUEST';
export const DECLARATION_SUCCESS = 'DECLARATION_SUCCESS';
export const DECLARATION_FAILURE = 'DECLARATION_FAILURE';
export const DECLARATION_SELECTED = 'DECLARATION_SELECTED';
export const DECLARATION_CLOSED = 'DECLARATION_CLOSED';

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

export function selectDeclaration(declaration) {
  return {
    type: DECLARATION_SELECTED,
    selectedDeclaration: declaration,
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
  }
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
