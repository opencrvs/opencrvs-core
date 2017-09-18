/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:18 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 15:44:03
 */
var jwtDecode = require('jwt-decode');

import { UNPROTECTED_URL } from 'constants/urls';
import { fetchDeclarations } from 'actions/declaration-actions';
import { fetchMapViewData } from 'actions/manager-actions';
import { selectWorkView } from 'actions/global-actions';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';
export const USER_UPDATE = 'USER_UPDATE';
//actions

function getMockLocationBasedOnRole(role) {
  let location = null;
  switch (role) {
    case 'field officer':
    case 'registrar':
      location = 'Agona East';
      break;
    case 'certification clerk':
      location = 'Central Region';
      break;
    case 'admin':
      location = 'Ghana';
      break;
    default:
      location = '';
  }
  return location;
}

function requestLogin(creds) {
  return {
    type: LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false,
    creds,
  };
}

function receiveLogin(user) {
  const decoded = jwtDecode(user.token);
  console.log(decoded);
  return {
    type: LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    user: user,
    email: decoded.email,
    family: decoded.family,
    given: decoded.given,
    avatar: decoded.avatar,
    role: decoded.role,
    scopes: decoded.scopes,
    user_id: decoded.user_id,
    username: decoded.username,
    location: getMockLocationBasedOnRole(decoded.role),
  };
}

function updateUser(token) {
  const decoded = jwtDecode(token);
  console.log(decoded);
  return {
    type: USER_UPDATE,
    isFetching: false,
    isAuthenticated: true,
    email: decoded.email,
    family: decoded.family,
    given: decoded.given,
    avatar: decoded.avatar,
    role: decoded.role,
    scopes: decoded.scopes,
    user_id: decoded.user_id,
    username: decoded.username,
    location: getMockLocationBasedOnRole(decoded.role),
  };
}

function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    message,
  };
}

function requestLogout() {
  return {
    type: LOGOUT_REQUEST,
    isFetching: true,
    isAuthenticated: true,
  };
}

function receiveLogout() {
  return {
    type: LOGOUT_SUCCESS,
    isFetching: false,
    isAuthenticated: false,
  };
}

export function updateUserDetails(location) {
  let token = localStorage.getItem('token') || null;
  return dispatch => {
    if (token) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role != 'admin' && role != 'manager' ) {
        dispatch(updateUser(token));
        dispatch(fetchDeclarations(role));
      } else {
        dispatch(updateUser(token));
        dispatch(selectWorkView('manager'));
        switch (location){
          case 'reports':
            dispatch(fetchMapViewData());
            break;
          case 'stats':
            break;
          case 'settings':
            break;
        }
      }
    } else {
      dispatch(logoutUser());
    }
  };
}

// Calls the API to get a token and
// dispatches actions along the way
export function loginUser(creds) {
  let config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'username=' + creds.username + '&password=' + creds.password,
  };


  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(requestLogin(creds));

    return fetch(UNPROTECTED_URL + 'auth/login', config)
      .then(response => response.json().then(user => ({ user, response })))
      .then(({ user, response }) => {
        if (!response.ok) {
          // If there was a problem, we want to
          // dispatch the error condition
          dispatch(loginError(user.message));
          return Promise.reject(user);
        } else {
          // If login was successful, set the token in local storage
          localStorage.setItem('token', user.token);
          // Dispatch the success action
          dispatch(receiveLogin(user));
          //window.location.href = '/work';
          return true;
        }
      })
      .catch(err => console.log('Error: ', err));
  };
}

// Logs the user out
export function logoutUser() {
  return dispatch => {
    dispatch(requestLogout());
    console.log('Logging out.  Removing tokens.');
    localStorage.removeItem('token');
    dispatch(receiveLogout());
    //window.location.href = '/tokenexpired';
  };
}
