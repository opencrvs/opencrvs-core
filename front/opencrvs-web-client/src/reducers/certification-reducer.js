/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-15 22:43:28
 */
import {
  PRINT_SELECTED,
  PRINT_DESELECTED,
  UPDATE_CERT_NUMBER,
  UPDATE_REG_NUMBER,
} from '../actions/certification-actions';

function globalReducer(
  state = {
    printCertificate: false,
    certificateNumber: '',
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
    default:
      return state;
  }
}

export default globalReducer;