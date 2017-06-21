import {
  DECLARATION_REQUEST,
  DECLARATION_SUCCESS,
  DECLARATION_FAILURE,
  DECLARATION_SELECTED,
} from '../actions/declaration-actions';

function declarationsReducer(
  state = {
    isFetching: false,
    declarations: '',
    selectedDeclaration: '',
    newDeclaration: '',
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
    case DECLARATION_SELECTED:
      return {
        ...state,
        selectedDeclaration: action.selectedDeclaration,
      };
    default:
      return state;
  }
}

export default declarationsReducer;