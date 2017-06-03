import { combineReducers } from 'redux';
import declarationsReducer from './declarations-reducer';
import userReducer from './user-reducer';

export default combineReducers({
  declarationsReducer,
  userReducer,
});
