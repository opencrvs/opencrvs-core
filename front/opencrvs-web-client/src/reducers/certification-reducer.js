/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-08 17:40:48
 */
import {
  PRINT_SELECTED,
  PRINT_DESELECTED,
  UPDATE_CERT_NUMBER,
  UPDATE_COLLECTOR,
  SUBMIT_COLLECTOR,
} from '../actions/certification-actions';

function globalReducer(
  state = {
    printCertificate: false,
    certificateNumber: '',
    collector: 'none',
  },
  action
) {
  switch (action.type) {
    case PRINT_SELECTED:
      return {
        ...state,
        printCertificate: true,
      };
    case PRINT_DESELECTED:
      return {
        ...state,
        printCertificate: false,
      };
    case UPDATE_CERT_NUMBER:
      return {
        ...state,
        certificateNumber: action.certificateNumber,
      };
    case UPDATE_COLLECTOR:
      return {
        ...state,
        collector: action.collector,
      };
    case SUBMIT_COLLECTOR:
      return {
        ...state,
        collector: 'none',
      };
    default:
      return state;
  }
}

export default globalReducer;