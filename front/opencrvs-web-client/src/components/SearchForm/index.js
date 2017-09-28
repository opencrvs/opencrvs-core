/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:51
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-14 13:13:43
 */
import React from 'react';
import styles from './styles.css';
import Input from 'react-toolbox/lib/input';
import theme from './searchInput.css';

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

  handleChange(name, value) {
    this.props.onSearchRequest(value);
  }

  render = () => {
    return (
      <div className={styles.searchContainer + ' pure-g'}>
        <div className="pure-u-1">
          <form>
            <Input theme={theme} type="text" label="Search" icon="search" onChange={this.handleChange.bind(this, 'search')} />
          </form>
        </div>
      </div>
    );
  };
}

export default SearchForm;
