/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:38 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 16:04:33
 */
import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import { connect } from 'react-redux';
import { logoutUser,
  updateUserDetails } from 'actions/user-actions';
import {
  reportOptionToggle,
  mobileMenuControl,
} from 'actions/global-actions';

class SettingsContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchUserDetails();
  }

  render = () => {
    return (
      <div className={styles.settingsContainer}>
        <Worknav {...this.props} />
        <div className={styles.settingsContent + ' pure-g'}>
          <div className="pure-u-1-1">
          Settings Container
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({ 
  managerReducer,
  globalReducer }) => {
  const { selectedLocationMapData } = managerReducer;
  const { 
    menuOpened,
    reportOption } = globalReducer;
  return {
    selectedLocationMapData,
    reportOption,
    menuOpened,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => {
      dispatch(logoutUser());
    },
    toggleMobileMenu: () => {
      dispatch(mobileMenuControl());
    },
    fetchUserDetails: () => {
      dispatch(updateUserDetails('settings'));
    }
    ////
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);

