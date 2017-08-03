/*
 * @Author: Euan Millar 
 * @Date: 2017-07-19 09:58:11 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-03 10:09:25
 */

import { 
  submitModalOpen,
} from 'actions/declaration-actions';


function submit(values, dispatch) {
  dispatch(submitModalOpen(values));
}

export default submit;