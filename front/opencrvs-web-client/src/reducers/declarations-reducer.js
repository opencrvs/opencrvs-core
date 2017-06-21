import {
  DECLARATION_REQUEST,
  DECLARATION_SUCCESS,
  DECLARATION_FAILURE,
} from '../actions/declaration-actions';

function declarationsReducer(
  state = {
    isFetching: false,
    declarations: '',
  },
  action
) {
  switch (action.type) {
    case DECLARATION_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case DECLARATION_SUCCESS:
      return {
        ...state,
        isFetching: false,
        declarations: action.declarations,
      };
    case DECLARATION_FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    default:
      return state;
  }
}

export default declarationsReducer;