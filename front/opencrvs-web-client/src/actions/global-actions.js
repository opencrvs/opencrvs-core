/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-14 18:39:46
 */
export const MOBILE_MENU = 'MOBILE_MENU';
export const CONFIRMATION_CASE = 'CONFIRMATION_CASE';
export const REPORT_OPTION_TOGGLE = 'REPORT_OPTION_TOGGLE';
export const SELECT_WORK_VIEW = 'SELECT_WORK_VIEW';
export const DESELECT_WORK_VIEW = 'DESELECT_WORK_VIEW';
export const LAUNCH_SNACK = 'LAUNCH_SNACK';
export const HIDE_SNACK = 'HIDE_SNACK';


export function mobileMenuControl() {
  return {
    type: MOBILE_MENU,
  };
}

export function reportOptionToggle() {
  return {
    type: REPORT_OPTION_TOGGLE,
  };
}

export function confirmationCase(confirmationCase) {
  return {
    type: CONFIRMATION_CASE,
    confirmationCase,
  };
}

export function selectWorkView(type) {
  return {
    type: SELECT_WORK_VIEW,
    workView: type,
  };
}

export function deselectWorkView() {
  return {
    type: DESELECT_WORK_VIEW,
  };
}

export function launchSnack(snackMessage) {
  return {
    type: LAUNCH_SNACK,
    snackMessage,
  };
}

export function clearSnackbar() {
  return {
    type: HIDE_SNACK,
  };
}


