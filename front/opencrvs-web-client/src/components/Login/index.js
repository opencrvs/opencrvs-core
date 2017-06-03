import React from 'react';
import styles from './styles.css';

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
    this.props.onLoginClick(creds);
  }

  render = () => {
    const { errorMessage } = this.props;

    return (
      <fieldset>
        <input
          type="text"
          ref="username"
          placeholder="Username"
          className={styles.loginInput}
        />
        <input
          type="password"
          ref="password"
          placeholder="Password"
          className={styles.loginInput}
        />
        <button className={styles.pureButtonPrimary}
          onClick={this.handleClick}
        >
          Login
        </button>
        <p className={styles.errorMessageSplash + ' pure-form-message'}>{errorMessage}</p>
      </fieldset>
    );
  }
}

export default Login;