/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 20:13:41
 */
import { BASE_URL } from 'constants/urls';
import { logoutUser } from 'actions/user-actions';
export const PATIENT_REQUEST = 'PATIENT_REQUEST';
export const PATIENT_SUCCESS = 'PATIENT_SUCCESS';
export const PATIENT_FAILURE = 'PATIENT_FAILURE';

function requestPatient() {
  return {
    type: PATIENT_REQUEST,
    isFetching: true,
  };
}

function receivePatient(data) {
  return {
    type: PATIENT_SUCCESS,
    isFetching: false,
    patients: data,
  };
}

function patientError(message) {
  return {
    type: PATIENT_FAILURE,
    isFetching: false,
    message,
  };
}

export function fetchPatients(id) {
  let token = localStorage.getItem('token') || null;
  let config = {};
  return dispatch => {
    dispatch(requestPatient());
    if (token) {
      config = {
        headers: { Authorization: `Bearer ${token}` },
        method: 'GET',
      };
      const data = {id:id};
      return fetch(BASE_URL + `patient/${data.id}`, config)
        .then(response =>
          response.json().then(payload => ({ payload, response }))
        )
        .then(({ payload, response }) => {
          if (!response.ok) {
            dispatch(patientError(payload.message));
            return Promise.reject(payload);
          }
          
          dispatch(receivePatient(payload));
          return true;
        })
        .catch(err => {
          if (err.message == 'The token has expired') {
            dispatch(logoutUser());
          } else {
            console.log(err);
          }
        });
    } else {
      dispatch(patientError('No token saved!'));
      return false;
    }
  };
}
