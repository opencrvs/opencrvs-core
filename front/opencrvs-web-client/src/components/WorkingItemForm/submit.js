/*
 * @Author: Euan Millar 
 * @Date: 2017-07-19 09:58:11 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 10:25:34
 */

import { 
  submitModalOpen,
} from 'actions/declaration-actions';
import { 
  confirmationCase,
} from 'actions/global-actions';


function submit(values, dispatch) {
  dispatch(submitModalOpen(values));
  dispatch(confirmationCase('declaration'));
}

export default submit;