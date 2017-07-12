/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:51 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-12 16:08:17
 */
import React from 'react';
import styles from './styles.css';
import Input from 'react-toolbox/lib/input';

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
    const { role } = this.props;
    return (
      <div className={styles.searchContainer + ' pure-g'}>
        <div className="pure-u-7-8">
          <form>
            {
              role == 'validator' ? 
              <Input type="text" label="Search declarations" hint="Notification ID" icon="search" /> : 
              <Input type="text" label="Search notifications" hint="Notification ID" icon="search" /> 
            }
          </form>
        </div>
      </div>
    );
  };
}

export default SearchForm;
