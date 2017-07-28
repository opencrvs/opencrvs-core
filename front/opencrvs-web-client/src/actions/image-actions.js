/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 14:04:42
 */
import { BASE_URL } from 'constants/urls';
import { logoutUser } from 'actions/user-actions';
import { submitModalOpened, oldImageDeleted } from 'actions/declaration-actions';
import { apiMiddleware } from 'utils/api-middleware';
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
export const IMAGE_TO_DELETE = 'IMAGE_TO_DELETE';
import { map } from 'lodash';


const uuidv4 = require('uuid/v4');
// maybe should be import
const axios = require('axios');
const FormData = require('form-data');

function imageDeleted(index) {
  return {
    type: IMAGE_DELETE_SUCCESS,
    index,
  };
}

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

export function imageToDelete(id) {
  return {
    type: IMAGE_TO_DELETE,
    imageToDelete: id,
  };
}

export function closeZoomModal() {
  return {
    type: IMAGE_ZOOM_TOGGLE,
    index: 0,
  };
}

export function deleteImage() {
  return (dispatch, getState) => {
    const {selectedDeclaration} = getState().declarationsReducer;
    const {imageToDelete, tempImages} = getState().imageReducer;
    if (imageToDelete != 0) {
      let token = localStorage.getItem('token') || null;
      if (token) {
        const config = {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        };
        const imageURL = BASE_URL + 'documents/' + imageToDelete;
        const imagePromises = [];
        let staticFile = '';
        let tempImageIndex = null;
        let spliceFromTemp = false;
        let docsImageIndex = null;
        let spliceFromDocs = false;
        map(selectedDeclaration.documents, (image, index ) => {
          if (image.id == imageToDelete) {
            spliceFromDocs = true;
            docsImageIndex = index;
            staticFile = image.staticFile;
          }
        });
        map(tempImages, (image, index ) => {
          if (image.id == imageToDelete) {
            spliceFromTemp = true;
            tempImageIndex = index;
            staticFile = image.staticFile;
          }
        });
        var formData = new FormData();
        formData.append('staticFile', staticFile);
        config.body = formData;
        imagePromises.push(apiMiddleware(config, imageURL, dispatch));
        Promise.all(imagePromises).then(response => { 
          dispatch(submitModalOpened());
          if (spliceFromTemp) {
            dispatch(imageDeleted(tempImageIndex));
          } else if (spliceFromDocs) {
            dispatch(oldImageDeleted(docsImageIndex));
          }
        });
      }
    }
    
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

export function uploadImageFile(image) {
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
          dispatch(imageUploaded(response.data.documents));
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
