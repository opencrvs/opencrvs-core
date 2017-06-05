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