/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 12:06:21
 */
import { BASE_URL } from 'constants/urls';
import { logoutUser } from 'actions/user-actions';
import { fetchDeclarations } from 'actions/declaration-actions';
export const IMAGE_REQUEST = 'IMAGE_REQUEST';
export const IMAGE_SUCCESS = 'IMAGE_SUCCESS';
export const IMAGE_FAILURE = 'IMAGE_FAILURE';
export const IMAGE_MODAL_OPENED = 'IMAGE_MODAL_OPENED';
export const IMAGE_MODAL_CLOSED = 'IMAGE_MODAL_CLOSED';
export const IMAGE_OPTION_TOGGLE = 'IMAGE_OPTION_TOGGLE';
export const IMAGE_UPLOADING = 'IMAGE_UPLOADING';
export const IMAGE_ZOOM_TOGGLE = 'IMAGE_ZOOM_TOGGLE';
export const IMAGE_DELETE_REQUEST = 'IMAGE_DELETE_REQUEST';
export const IMAGE_DELETE_SUCCESS = 'IMAGE_DELETE_SUCCESS';
export const IMAGE_DELETE_FAILURE = 'IMAGE_DELETE_FAILURE';
export const CLEAR_TEMP_IMAGES = 'CLEAR_TEMP_IMAGES';

const uuidv4 = require('uuid/v4');
import axios, { post } from 'axios';
const FormData = require('form-data');

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

export function imageOptionToggle() {
  return {
    type: IMAGE_OPTION_TOGGLE,
  };
}

export function clearTempImages() {
  return {
    type: CLEAR_TEMP_IMAGES,
  };
}

export function onZoomImage(id) {
  return {
    type: IMAGE_ZOOM_TOGGLE,
    index: id,
  };
}

export function closeZoomModal() {
  return {
    type: IMAGE_ZOOM_TOGGLE,
    index: 0,
  };
}

export function onDeleteImage(id) {
  return {
    type: IMAGE_DELETE_REQUEST,
    index: id,
  };
}

function imageUploaded(data) {
  if (data) {
    return {
      type: IMAGE_SUCCESS,
      imageFetching: false,
      image: data,
    };
  } else {
    return {
      type: IMAGE_SUCCESS,
      imageFetching: false,
    };
  }
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

export function uploadImageFile(image) {
  console.log(image);
  return (dispatch, getState) => {
    const {selectedDeclaration} = getState().declarationsReducer;
    let addToExisting = false;
    let declarationID = 0;
    if (selectedDeclaration.id) {
      addToExisting = true;
      declarationID = selectedDeclaration.id;
    }
    let token = localStorage.getItem('token') || null;
    if (token) {
      var formData = new FormData();
      formData.append('name', image[0].name);
      formData.append('preview', image[0].preview);
      formData.append('size', image[0].size);
      formData.append('type', image[0].type);
      formData.append('addToExisting', addToExisting);
      formData.append('declaration_id', declarationID);
      formData.append('uuid', uuidv4());
      formData.append('uploadFile', image[0]);
      dispatch(requestImage());
      const instance = axios.create({BASE_URL});
      const config = {
        headers: {
          'Authorization': token,
        },
      };
      instance.post(BASE_URL + 'documents', formData, config)
        .then((response) => {
          dispatch(imageModalClosed());
          if (addToExisting) {
            dispatch(fetchDeclarations());
            dispatch(imageUploaded());
          } else {
            dispatch(imageUploaded(response.data.documents));
          }
          return true;
        })
        .catch(err => {
          if (err.status == 401) {
            dispatch(logoutUser());
          } else {
            console.log(err);
            dispatch(imageError());
          }
        });
    } else {
      dispatch(imageError('No token saved!'));
      return false;
    }
  };
}
