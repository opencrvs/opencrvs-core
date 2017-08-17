/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-17 13:44:33
 */
import { BASE_URL } from 'constants/urls';
import { OPEN_HIM_URL } from 'constants/urls';
import { logoutUser } from 'actions/user-actions';
export const PATIENT_REQUEST = 'PATIENT_REQUEST';
export const PATIENT_SUCCESS = 'PATIENT_SUCCESS';
export const PATIENT_FAILURE = 'PATIENT_FAILURE';
import { filter, get, head } from 'lodash';

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

export function fetchPatients(id, notificationCase) {
  // notificationCase is a temporary variable used while we 
  // still migrate from Euan's prototype server to FHIR: see variable temporaryURLSwitch
  // to date, only notifications are possible in FHIR
  let token = localStorage.getItem('token') || null;
  let config = {};
  return dispatch => {
    dispatch(requestPatient());
    if (token) {
      const data = {id:id};
      let temporaryURLSwitch = BASE_URL + `patient/${data.id}`;
      if (notificationCase) {
        temporaryURLSwitch = OPEN_HIM_URL + id;
        config = {
          method: 'GET',
        };
      } else {
        config = {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET',
        };
      }
      return fetch(temporaryURLSwitch, config)
        .then(response =>
          response.json().then(payload => ({ payload, response }))
        )
        .then(({ payload, response }) => {
          if (!response.ok) {
            dispatch(patientError(payload.message));
            return Promise.reject(payload);
          }
          if (notificationCase) {
            // temporary reformat until declarations exists in FHIR
            // at which point refactor across the app will be required
            // transitioning between euan's assumed data and true standards
            let given = null;
            let family = null;
            if (payload.resourceType == 'RelatedPerson') {
              given = get(payload.name, 'given').join(', ');
              family = get(payload.name, 'family').join(', ');
            } else {
              given = get(head(payload.name), 'given').join(', ');
              family = get(head(payload.name), 'family').join(', ');
            }
            const iDArray = id.split('/');
            const iD = iDArray[1];
            let newPayload = {
              message: 'Patient success',
              patient: {
                id: iD,
                given: given,
                family: family,
                birthDate: payload.birthDate,
                telecom: [
                  {
                    phone: get(head(filter(payload.telecom, {system: 'phone'})), 'value'),
                  },
                ],
                address: [
                  {
                    addressLine1: 'P.O. Box 78',
                    city: 'Swedru',
                    county: 'Agona West Municipal',
                    state: 'Central Region',
                  },
                ],
              },
            };
            dispatch(receivePatient(newPayload));
          } else {
            dispatch(receivePatient(payload));
            return true;
          }
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
