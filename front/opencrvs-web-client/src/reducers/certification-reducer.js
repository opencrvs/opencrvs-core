/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-21 17:46:22
 */
import {
  PRINT_SELECTED,
  PRINT_DESELECTED,
  UPDATE_CERT_NUMBER,
  UPDATE_REG_NUMBER,
  UPDATE_COLLECTOR,
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
    default:
      return state;
  }
}

export default globalReducer;