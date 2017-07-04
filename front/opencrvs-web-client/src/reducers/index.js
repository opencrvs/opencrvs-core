import { combineReducers } from 'redux';
import declarationsReducer from './declarations-reducer';
import userReducer from './user-reducer';
import imageReducer from './image-reducer';

export default combineReducers({
  declarationsReducer,
  userReducer,
  imageReducer,
});
