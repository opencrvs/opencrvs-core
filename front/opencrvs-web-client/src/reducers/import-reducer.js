/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-13 12:40:17
 */
import {
  IMPORT_COMPLETED,
  CLEAR_COMPLETED,
} from '../actions/import-actions';

function importReducer(
  state = {
    dataCleared: false,
    dataImported: false,
  },
  action
) {
  switch (action.type) {
    case IMPORT_COMPLETED:
      return { ...state, dataImported: true };
    case CLEAR_COMPLETED:
      return { ...state, dataCleared: true };
    default:
      return state;
  }
}

export default importReducer;
