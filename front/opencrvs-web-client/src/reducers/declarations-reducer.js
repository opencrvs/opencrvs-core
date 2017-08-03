/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 15:39:50
 */
import {
  DECLARATION_REQUEST,
  DECLARATION_SUCCESS,
  DECLARATION_FAILURE,
  DECLARATION_SELECTED,
  NEW_DECL_MODAL_CLOSED,
  NEW_DECL_MODAL_OPENED,
  NEW_DECL_EDIT,
  SUBMIT_MODAL_TOGGLE,
  DECLARATION_SUBMIT_REQUEST,
  DECLARATION_SUBMIT_SUCCESS,
  DECLARATION_SUBMIT_FAILURE,
  TRACKING_MODAL_TOGGLE,
  DECLARATION_READY_TO_CONFIRM,
  REQD_MODAL_TOGGLE,
  DECLARATION_SEARCH,
  OLD_DOCUMENT_DELETED,
} from '../actions/declaration-actions';

function declarationsReducer(
  state = {
    isFetching: false,
    isSubmitting: false,
    declarations: '',
    selectedDeclaration: '',
    newDeclarationModal: false,
    newDeclaration: false,
    category: '',
    trackingID: '',
    submitModal: 0,
    trackingModal: 0,
    submitValues: '',
    reqDocsModal: 0,
    searchTerm: '',
    declarationsList: '',
  },
  action
) {
  switch (action.type) {
    case DECLARATION_READY_TO_CONFIRM:
      return {
        ...state,
        submitValues: action.values,
      };
    case DECLARATION_SUBMIT_REQUEST:
      return {
        ...state,
        isSubmitting: true,
      };
    case DECLARATION_SUBMIT_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        trackingID: action.trackingID,
        selectedDeclaration: '',
        submitValues: '',
        submitModal: 0,
        newDeclaration: false,
        category: '',
      };
    case DECLARATION_SUBMIT_FAILURE:
      return {
        ...state,
        isSubmitting: false,
      };
    case DECLARATION_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case DECLARATION_SEARCH:
      return {
        ...state,
        seacrhTerm: action.seacrhTerm,
        declarationsList: action.declarationsList,
      };
    case DECLARATION_SUCCESS:
      return {
        ...state,
        isFetching: false,
        declarations: action.declarations,
        declarationsList: action.declarationsList,
      };
    case DECLARATION_FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case SUBMIT_MODAL_TOGGLE:
      return {
        ...state,
        submitModal: state.submitModal == 0 ? 1 : 0,
      };
    case REQD_MODAL_TOGGLE:
      return {
        ...state,
        reqDocsModal: state.reqDocsModal == 0 ? 1 : 0,
      };
    case TRACKING_MODAL_TOGGLE:
      return {
        ...state,
        trackingModal: state.trackingModal == 0 ? 1 : 0,
      };
    case DECLARATION_SELECTED:
      return {
        ...state,
        selectedDeclaration: action.selectedDeclaration,
        newDeclaration: false,
        category: '',
      };
    case NEW_DECL_MODAL_OPENED:
      return {
        ...state,
        newDeclarationModal: true,
      };
    case NEW_DECL_MODAL_CLOSED:
      return {
        ...state,
        newDeclarationModal: false,
      };
    case NEW_DECL_EDIT:
      return {
        ...state,
        newDeclaration: true,
        selectedDeclaration: '',
        category: action.category,
      };
    case OLD_DOCUMENT_DELETED:
      return {
        ...state, 
        selectedDeclaration: {
          ...state.selectedDeclaration,
          [action.reference] : [
            ...state.selectedDeclaration[action.reference].slice(0, action.index),
            ...state.selectedDeclaration[action.reference].slice(action.index + 1),
          ],
        },
      };
    default:
      return state;
  }
}

export default declarationsReducer;