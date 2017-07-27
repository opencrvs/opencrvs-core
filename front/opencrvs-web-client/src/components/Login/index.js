/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:02 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-27 23:54:46
 */
import React from 'react';
import styles from './styles.css';
import { Button } from 'react-toolbox/lib/button';
import theme from './loginButton.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
  }
  
  handleClick = (event) => {
    const username = this.refs.username;
    const password = this.refs.password;
    const creds = {
      username: username.value.trim(),
      password: password.value.trim(),
    };
    this.props.onLogin(creds);
  }

  handleKeyPress = (event) => {
    if (event.key == 'Enter') {
      const username = this.refs.username;
      const password = this.refs.password;
      const creds = {
        username: username.value.trim(),
        password: password.value.trim(),
      };
      this.props.onLogin(creds);
    }
  }

  render = () => {
    const { errorMessage } = this.props;

    return (
      <fieldset>
        <div className="pure-g">
          <div className="pure-u-1 pure-u-md-1-3"></div>
          <div className={styles.formContainer + ' pure-u-1 pure-u-md-1-3'}>
          <input
              type="text"
              ref="username"
              placeholder="Username"
              className={styles.usernameInput}
            />
          <input
            type="password"
            ref="password"
            placeholder="Password"
            className={styles.passwordInput}
            onKeyPress={this.handleKeyPress}
          />
          <Button theme={theme} onClick={this.handleClick} raised >
            <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
            Login
          </Button>
          <p className={styles.errorMessageSplash + ' pure-form-message'}>{errorMessage}</p>
          </div>
          <div className="pure-u-1 pure-u-md-1-3"></div>
        </div>
      </fieldset>
    );
  }
}

export default Login;