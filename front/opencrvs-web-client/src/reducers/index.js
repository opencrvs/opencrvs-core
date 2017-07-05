/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:18 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:17:18 
 */
import { combineReducers } from 'redux';
import declarationsReducer from './declarations-reducer';
import userReducer from './user-reducer';
import imageReducer from './image-reducer';

export default combineReducers({
  declarationsReducer,
  userReducer,
  imageReducer,
});
