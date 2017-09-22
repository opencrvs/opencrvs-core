/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-22 10:12:42
 */
export const PRINT_SELECTED = 'PRINT_SELECTED';
export const PRINT_DESELECTED = 'PRINT_DESELECTED';
export const UPDATE_CERT_NUMBER = 'UPDATE_CERT_NUMBER';
export const UPDATE_COLLECTOR = 'UPDATE_COLLECTOR';
export const SUBMIT_COLLECTOR = 'SUBMIT_COLLECTOR';



export function submitCollector() {
  return {
    type: SUBMIT_COLLECTOR,
  };
}

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
  return {
    type: UPDATE_CERT_NUMBER,
    certificateNumber,
  };
}

export function updateCollector(collector) {
  console.log(collector);
  return {
    type: UPDATE_COLLECTOR,
    collector,
  };
}

