import { BASE_URL } from 'constants/urls';
import { logoutUser } from 'actions/user-actions';
export const DECLARATION_REQUEST = 'DECLARATION_REQUEST';
export const DECLARATION_SUCCESS = 'DECLARATION_SUCCESS';
export const DECLARATION_FAILURE = 'DECLARATION_FAILURE';
export const DECLARATION_SELECTED = 'DECLARATION_SELECTED';

// const requestDeclaration = () => ({
//   type: DECLARATION_REQUEST,
//   isFetching: true,
//   authenticated: true,
// });

function requestDeclaration() {
  return {
    type: DECLARATION_REQUEST,
    isFetching: true,
    authenticated: true,
  };
}

function selectDeclaration(id) {
  return {
    type: DECLARATION_SELECTED,
    selectedDeclaration: id,
  };
}

function receiveDeclaration(data) {
  return {
    type: DECLARATION_SUCCESS,
    isFetching: false,
    authenticated: true,
    declarations: data,
  };
}

function declarationError(message) {
  return {
    type: DECLARATION_FAILURE,
    isFetching: false,
    authenticated: true,
    message
  };
}

export function fetchDeclarations() {
  let token = localStorage.getItem('access_token') || null;
  let config = {};
  return dispatch => {
    dispatch(requestDeclaration());
    if (token) {
      config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      return fetch(BASE_URL + 'protected/random-declaration', config)
        .then(response =>
          response.json().then(payload => ({ payload, response }))
        )
        .then(({ payload, response }) => {
          if (!response.ok) {
            dispatch(declarationError(payload.message));
            return Promise.reject(payload);
          }
          dispatch(receiveDeclaration(payload.data));
          return true;
        })
        .catch(err => {
          if (err.message == 'The token has expired'){
            dispatch(logoutUser());
          }else{
            console.log(err);
          }
        });
    } else {
      dispatch(declarationError('No token saved!'));
      return false;
    }
  };
}
