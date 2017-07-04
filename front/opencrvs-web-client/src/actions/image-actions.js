import { BASE_URL } from 'constants/urls';
import { logoutUser } from 'actions/user-actions';
export const IMAGE_REQUEST = 'IMAGE_REQUEST';
export const IMAGE_SUCCESS = 'IMAGE_SUCCESS';
export const IMAGE_FAILURE = 'IMAGE_FAILURE';
export const IMAGE_MODAL_OPENED = 'IMAGE_MODAL_OPENED';
export const IMAGE_MODAL_CLOSED = 'IMAGE_MODAL_CLOSED';
export const IMAGE_OPTION_TOGGLE = 'IMAGE_OPTION_TOGGLE';
export const IMAGE_PREVIEW_CHANGE = 'IMAGE_PREVIEW_CHANGE';
export const IMAGE_UPLOADING = 'IMAGE_UPLOADING';

function requestImage() {
  return {
    type: IMAGE_REQUEST,
    imageFetching: true,
  };
}

export function imageModalOpened() {
  return {
    type: IMAGE_MODAL_OPENED,
    imageModal: true,
  };
}

export function imageModalClosed() {
  return {
    type: IMAGE_MODAL_CLOSED,
    imageModal: false,
  };
}

export function previewImages(images) {
  return {
    type: IMAGE_PREVIEW_CHANGE,
    imageFetching: false,
    images,
  };
}

export function imageOptionToggle() {
  return {
    type: IMAGE_OPTION_TOGGLE
  };
}

function imageUploaded(data) {
  return {
    type: IMAGE_SUCCESS,
    imageFetching: false,
    image: data,
  };
}

function imageError(message) {
  return {
    type: IMAGE_FAILURE,
    imageFetching: false,
    message,
  };
}

function imageUploading() {
  return {
    type: IMAGE_UPLOADING,
    imageFetching: true,
  };
}

export function uploadImage(image) {
  let token = localStorage.getItem('token') || null;
  let config = {};
  return dispatch => {
    dispatch(imageUploading());
    if (token) {
      config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      return fetch(BASE_URL + 'protected/random-declaration', config)
        .then(response =>
          response.json().then(payload => ({ payload, response }))
        )
        .then(({ payload, response }) => {
          if (!response.ok) {
            dispatch(imageError(payload.message));
            return Promise.reject(payload);
          }
          dispatch(imageUploaded(payload.data));
          return true;
        })
        .catch(err => {
          if (err.message == 'The token has expired') {
            dispatch(logoutUser());
          } else {
            console.log(err);
          }
        });
    } else {
      dispatch(imageError('No token saved!'));
      return false;
    }
  };
}
