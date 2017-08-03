/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 15:45:39
 */
import {
  MOBILE_MENU,
  CONFIRMATION_CASE,
  REPORT_OPTION_TOGGLE,
  SELECT_WORK_VIEW,
  DESELECT_WORK_VIEW,
} from '../actions/global-actions';

function globalReducer(
  state = {
    menuOpened: 0,
    confirmationCase: '',
    reportOption: 0,
    workView: null,
  },
  action
) {
  switch (action.type) {
    case DESELECT_WORK_VIEW:
      return {
        ...state,
        workView: null,
      };
    case SELECT_WORK_VIEW:
      return {
        ...state,
        workView: action.workView,
      };
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
    case REPORT_OPTION_TOGGLE:
      return {
        ...state,
        reportOption: state.reportOption == 0 ? 1 : 0,
      };
    default:
      return state;
  }
}

export default globalReducer;