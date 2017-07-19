/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:23 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-19 10:07:13
 */
import {
  IMAGE_REQUEST,
  IMAGE_SUCCESS,
  IMAGE_FAILURE,
  IMAGE_MODAL_OPENED,
  IMAGE_MODAL_CLOSED,
  IMAGE_OPTION_TOGGLE,
  IMAGE_PREVIEW_CHANGE,
  IMAGE_UPLOADING,
  IMAGE_ZOOM_TOGGLE,
  IMAGE_DELETE_REQUEST,
  IMAGE_DELETE_SUCCESS,
  IMAGE_DELETE_FAILURE,
} from '../actions/image-actions';




function imageReducer(
  state = {
    imageFetching: false,
    images: [],
    imageModal: false,
    newImage: '',
    imageOption: 0,
    previewImages: {},
    imageErrorMessage: '',
    imageZoom: false,
    imageZoomID: 0,
  },
  action
) {
  switch (action.type) {
    case IMAGE_REQUEST:
      return {
        ...state,
        imageFetching: true,
      };
    case IMAGE_SUCCESS:
      return {
        ...state,
        imageFetching: false,
        images: [...state.images, action.image],
      };
    case IMAGE_FAILURE:
      return {
        ...state,
        imageFetching: false,
        imageErrorMessage: action.message,
      };
    case IMAGE_DELETE_REQUEST:
      return {
        ...state,
        imageFetching: true,
      };
    case IMAGE_DELETE_SUCCESS:
      return {
        ...state,
        imageFetching: false,
        ...state.images.slice(0, action.index),
        ...state.images.slice(action.index + 1),
      };
    case IMAGE_DELETE_FAILURE:
      return {
        ...state,
        imageFetching: false,
        imageErrorMessage: action.message,
      };
    case IMAGE_MODAL_OPENED:
      return {
        ...state,
        imageModal: true,
      };
    case IMAGE_MODAL_CLOSED:
      return {
        ...state,
        imageModal: false,
      };
    case IMAGE_OPTION_TOGGLE:
      return {
        ...state,
        imageOption: state.imageOption == 0 ? 1 : 0,
      };
    case IMAGE_ZOOM_TOGGLE:
      return {
        ...state,
        imageZoomID: action.index,
        imageZoom: state.imageOption == 0 ? 1 : 0,
      };
    case IMAGE_PREVIEW_CHANGE:
      return {
        ...state,
        previewImages: action.images,
      };
    case IMAGE_UPLOADING:
      return {
        ...state,
        imageFetching: true,
      };
    default:
      return state;
  }
}

export default imageReducer;