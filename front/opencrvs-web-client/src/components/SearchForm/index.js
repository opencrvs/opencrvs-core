import React from 'react';
import styles from './styles.css';

class SearchForm extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick = event => {
    const notification = this.refs.notification;
    const searchItem = {
      notification: notification.value.trim(),
    };
    this.props.onDeclarationClick(searchItem);
  };

  render = () => {
    const { errorMessage } = this.props;
    return (
      <div className={styles.searchContainer + ' pure-g'}>
        <div className="pure-u-3-4">
          <h4 className={styles.workItemSubject}>Search Notifications</h4>
          <form className="pure-form">
            <input
              type="text"
              className="pure-input-rounded"
              ref="notification"
              placeholder="Notification search"
            />
            <button
              type="submit"
              className={styles.secondaryButton + ' pure-button'}
              onClick={this.handleClick}
            >
              Search
            </button>
            <p className={styles.errorMessageSplash + ' pure-form-message'}>
              {errorMessage}
            </p>
          </form>
        </div>
      </div>
    );
  };
}

export default SearchForm;
