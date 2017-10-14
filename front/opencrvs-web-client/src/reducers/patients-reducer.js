/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-14 18:01:24
 */
import {
  PATIENT_REQUEST,
  PATIENT_SUCCESS,
  PATIENT_FAILURE,
  RESET_PATIENTS,
} from '../actions/patient-actions';

function patientsReducer(
  state = {
    isFetching: false,
    patients: [],
  },
  action
) {
  switch (action.type) {
    case RESET_PATIENTS:
      return {
        ...state,
        patients: [],
      };
    case PATIENT_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case PATIENT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        patients:[...state.patients, action.patients],
      };
    case PATIENT_FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    default:
      return state;
  }
}

export default patientsReducer;