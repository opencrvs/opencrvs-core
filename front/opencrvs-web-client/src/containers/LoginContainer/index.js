/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:44 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:17:44 
 */
import React from 'react';
import Login from 'components/Login';
import Logout from 'components/Logout';
import { loginUser, logoutUser } from 'actions/user-actions';
const LoginContainer = ({ dispatch, isAuthenticated, errorMessage }) => (

    <div className="pure-form">
      {
        isAuthenticated ? 
        <Logout onLogoutClick={() => dispatch(logoutUser())} /> : 
        <Login
          errorMessage={errorMessage}
          onLoginClick={creds => dispatch(loginUser(creds))}
        />
      }
    </div>
);

export default LoginContainer;