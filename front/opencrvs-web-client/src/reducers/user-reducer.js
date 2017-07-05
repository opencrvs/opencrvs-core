/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:14 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:17:14 
 */
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_SUCCESS,
} from '../actions/user-actions';

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In the real app,
// we would also want a util to check if the token is expired.
function userReducer(
  state = {
    isFetching: false,
    isAuthenticated: !!localStorage.getItem('id_token'),
    user: null,
    errorMessage: '',
  },
  action
) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        isFetching: true,
        isAuthenticated: false,
        user: action.creds,
      };
    case LOGIN_SUCCESS:
      console.log('action: ' + action.user);
      return {
        ...state,
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
        user: action.user,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        isFetching: true,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

export default userReducer;
