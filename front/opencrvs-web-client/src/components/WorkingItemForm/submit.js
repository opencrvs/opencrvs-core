/*
 * @Author: Euan Millar 
 * @Date: 2017-07-19 09:58:11 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 21:32:24
 */
import { SubmissionError } from 'redux-form';

import { 
  submitModalOpen,
} from 'actions/declaration-actions';


function submit(values, dispatch) {
  dispatch(submitModalOpen(values));
    // simulate server latency
    /*if (!['john', 'paul', 'george', 'ringo'].includes(values.username)) {
      throw new SubmissionError({
        username: 'User does not exist',
        _error: 'Login failed!'
      })
    } else if (values.password !== 'redux-form') {
      throw new SubmissionError({
        password: 'Wrong password',
        _error: 'Login failed!'
      })
    } else {
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
    }*/
  
}

export default submit;