/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:44 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-13 13:12:30
 */
import React from 'react';
import Login from 'components/Login';
import Logout from 'components/Logout';
import { loginUser, logoutUser } from 'actions/user-actions';
import { connect } from 'react-redux';



class LoginContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  render = () => {
    const { isAuthenticated } = this.props;

    return (
      <div className="pure-form">
        {
          isAuthenticated ? 
          <Logout {...this.props} /> : 
          <Login {...this.props} />
        }
      </div>
    );
  }
}

const mapStateToProps = ({ userReducer }) => {
  const { isAuthenticated, errorMessage } = userReducer;

  return {
    isAuthenticated,
    errorMessage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogin: creds => {
      dispatch(loginUser(creds));
    },
    onLogout: () => {
      dispatch(logoutUser());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);