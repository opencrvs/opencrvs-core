/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-14 18:02:53
 */
import { BASE_URL } from 'constants/urls';
import { OPEN_HIM_URL } from 'constants/urls';
import { logoutUser } from 'actions/user-actions';
export const PATIENT_REQUEST = 'PATIENT_REQUEST';
export const PATIENT_SUCCESS = 'PATIENT_SUCCESS';
export const PATIENT_FAILURE = 'PATIENT_FAILURE';
export const RESET_PATIENTS = 'RESET_PATIENTS';
import { filter, get, head } from 'lodash';

function requestPatient() {
  return {
    type: PATIENT_REQUEST,
    isFetching: true,
  };
}

export function resetPatients() {
  return {
    type: RESET_PATIENTS,
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
  console.log('FETCHING PATIENT WITH ID: ' + id);
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
            let addressLine1 = '';
            let addressLine2 = '';
            let addressLine3 = '';
            let city = '';
            let district = '';
            let state = '';
            let postalCode = '';
            if (payload.address) {
              if (head(payload.address).line) {
                const addressArray = head(payload.address).line;
                if (addressArray[0]) {
                  addressLine1 = addressArray[0];
                }
                if (addressArray[1]) {
                  addressLine2 = addressArray[1];
                }
                if (addressArray[2]) {
                  addressLine3 = addressArray[2];
                }
              }
              if (head(payload.address).state) {
                state = head(payload.address).state;
              }
              if (head(payload.address).district) {
                district = head(payload.address).district;
              }
              if (head(payload.address).city) {
                city = head(payload.address).city;
              }
              if (head(payload.address).postalCode) {
                postalCode = head(payload.address).postalCode;
              }
            }
            
            console.log(JSON.stringify(head(payload.address)));
            let newPayload = {
              message: 'Patient success',
              patient: {
                id: iD,
                given: given,
                family: family,
                gender: payload.gender,
                birthDate: payload.birthDate,
                telecom: [
                  {
                    phone: get(head(filter(payload.telecom, {system: 'phone'})), 'value'),
                  },
                ],
                address: [
                  {
                    addressLine1: addressLine1,
                    addressLine2: addressLine2,
                    addressLine3: addressLine3,
                    city: city,
                    county: district,
                    state: state,
                    postalCode: postalCode,
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
