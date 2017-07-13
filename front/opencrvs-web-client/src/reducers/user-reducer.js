/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:14 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-06 09:24:59
 */
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_SUCCESS,
  USER_UPDATE,
} from '../actions/user-actions';

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In the real app,
// we would also want a util to check if the token is expired.
function userReducer(
  state = {
    isFetching: false,
    isAuthenticated: !!localStorage.getItem('token'),
    user: null,
    errorMessage: '',
    email: '',
    family: '',
    given: '',
    avatar: '',
    role: '',
    scopes: '',
    user_id: '',
    username: '',
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
      return {
        ...state,
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
        user: action.user,
        email: action.email,
        family: action.family,
        given: action.given,
        avatar: action.avatar,
        role: action.role,
        scopes: action.scopes,
        user_id: action.user_id,
        username: action.username,
      };
    case USER_UPDATE:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
        email: action.email,
        family: action.family,
        given: action.given,
        avatar: action.avatar,
        role: action.role,
        scopes: action.scopes,
        user_id: action.user_id,
        username: action.username,
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
