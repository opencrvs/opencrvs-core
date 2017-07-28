/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 10:28:14
 */
export const MOBILE_MENU = 'MOBILE_MENU';
export const CONFIRMATION_CASE = 'CONFIRMATION_CASE';


export function mobileMenuControl() {
  return {
    type: MOBILE_MENU,
  };
}

export function confirmationCase(confirmationCase) {
  return {
    type: CONFIRMATION_CASE,
    confirmationCase,
  };
}
