/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-15 22:08:53
 */
export const PRINT_SELECTED = 'PRINT_SELECTED';
export const PRINT_DESELECTED = 'PRINT_DESELECTED';
export const UPDATE_CERT_NUMBER = 'UPDATE_CERT_NUMBER';



export function printCert() {
  return {
    type: PRINT_SELECTED,
  };
}

export function closePrintModal() {
  return {
    type: PRINT_DESELECTED,
  };
}

export function updateCertNumber(certificateNumber) {
  console.log(certificateNumber);
  return {
    type: UPDATE_CERT_NUMBER,
    certificateNumber,
  };
}