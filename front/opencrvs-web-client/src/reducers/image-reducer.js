import {
  IMAGE_REQUEST,
  IMAGE_SUCCESS,
  IMAGE_FAILURE,
  IMAGE_MODAL_OPENED,
  IMAGE_MODAL_CLOSED,
  IMAGE_OPTION_TOGGLE,
  IMAGE_PREVIEW_CHANGE,
  IMAGE_UPLOADING,
} from '../actions/image-actions';




function imageReducer(
  state = {
    imageFetching: false,
    images: '',
    imageModal: false,
    newImage: '',
    imageOption: 0,
    previewImages: {},
    imageErrorMessage: '',
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
        image: action.image,
      };
    case IMAGE_FAILURE:
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