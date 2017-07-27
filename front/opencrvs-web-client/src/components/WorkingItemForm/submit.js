/*
 * @Author: Euan Millar 
 * @Date: 2017-07-19 09:58:11 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 22:55:15
 */

import { 
  submitModalOpen,
} from 'actions/declaration-actions';


function submit(values, dispatch) {
  dispatch(submitModalOpen(values));
}

export default submit;