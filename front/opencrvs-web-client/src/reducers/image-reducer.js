/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:23 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 12:07:25
 */
import {
  IMAGE_REQUEST,
  IMAGE_SUCCESS,
  IMAGE_FAILURE,
  IMAGE_MODAL_OPENED,
  IMAGE_MODAL_CLOSED,
  IMAGE_OPTION_TOGGLE,
  IMAGE_UPLOADING,
  IMAGE_ZOOM_TOGGLE,
  IMAGE_DELETE_REQUEST,
  IMAGE_DELETE_SUCCESS,
  IMAGE_DELETE_FAILURE,
  CLEAR_TEMP_IMAGES,
} from '../actions/image-actions';




function imageReducer(
  state = {
    imageFetching: false,
    tempImages: [],
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
      if (action.image) {
        return {
          ...state,
          imageFetching: false,
          tempImages: [...state.tempImages, action.image],
        };
      } else {
        return {
          ...state,
          imageFetching: false,
        };
      }
    case IMAGE_FAILURE:
      return {
        ...state,
        imageFetching: false,
        imageErrorMessage: action.message,
      };
    case CLEAR_TEMP_IMAGES:
      return {
        ...state,
        imageFetching: false,
        tempImages: [],
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
        ...state.tempImages.slice(0, action.index),
        ...state.tempImages.slice(action.index + 1),
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