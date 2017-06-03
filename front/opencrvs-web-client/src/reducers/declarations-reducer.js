import {
  DECLARATION_REQUEST,
  DECLARATION_SUCCESS,
  DECLARATION_FAILURE,
} from '../actions/declaration-actions';

function declarationsReducer(
  state = {
    isFetching: false,
    declaration: '',
    authenticated: false,
  },
  action
) {
  switch (action.type) {
    case DECLARATION_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case DECLARATION_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        declaration: action.response,
        authenticated: action.authenticated || false,
      });
    case DECLARATION_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
      });
    default:
      return state;
  }
}

export default declarationsReducer;