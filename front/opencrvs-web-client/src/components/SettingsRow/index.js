
import React from 'react';
import styles from './styles.css';
import PropTypes from 'prop-types';
import { Button } from 'react-toolbox/lib/button';


class SettingsRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.settingsRow + ' pure-g'}>
        <div className={styles.subjectTitle + ' pure-u-1-2'}>
          <p className={styles.itemText}>{this.props.text}</p>
        </div>
        <div className="pure-u-1-2">
          <div className={styles.buttons}>
            <div className={styles.editButton}>
              <Button icon="edit" label="Edit" primary raised /> 
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SettingsRow.propTypes = {
  text: PropTypes.string.isRequired,
};

export default SettingsRow;
