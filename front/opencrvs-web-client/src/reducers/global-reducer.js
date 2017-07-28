/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 10:29:02
 */
import {
  MOBILE_MENU,
  CONFIRMATION_CASE,
} from '../actions/global-actions';

function globalReducer(
  state = {
    menuOpened: 0,
    confirmationCase: '',
  },
  action
) {
  switch (action.type) {
    case MOBILE_MENU:
      return {
        ...state,
        menuOpened: state.menuOpened == 0 ? 1 : 0,
      };
    case CONFIRMATION_CASE:
      return {
        ...state,
        confirmationCase: action.confirmationCase,
      };
    default:
      return state;
  }
}

export default globalReducer;