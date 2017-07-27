/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-26 16:36:56
 */
import {
  MOBILE_MENU,
} from '../actions/global-actions';

function globalReducer(
  state = {
    menuOpened: 0,
  },
  action
) {
  switch (action.type) {
    case MOBILE_MENU:
      return {
        ...state,
        menuOpened: state.menuOpened == 0 ? 1 : 0,
      };
    default:
      return state;
  }
}

export default globalReducer;