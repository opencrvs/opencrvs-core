/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:17:38
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-20 16:09:46
 */
import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import { connect } from 'react-redux';
import { logoutUser,
  updateUserDetails } from 'actions/user-actions';
import {
  mobileMenuControl,
} from 'actions/global-actions';
import SettingsRow from 'components/SettingsRow';

const configurable = [

  'Business processes',
  'Statistics',
  'Performance Management',
  'Work Queues',
  'Alerts / Messaging',
  'Payments',
  'Users / roles',
  'Devices',
  'Helpdesk',
  'Data import',
  'General',
  'Decentralisation',
  'Unique number generation',
  'Languages',
  'Currency',
  'Technical',
  'External interfaces',
  'Security',
  'Logging',
  'Scanned Documents',
];

class SettingsContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange = (field, value) => {
    this.setState({[field]: value});
  };

  componentWillMount() {
    this.props.fetchUserDetails();
  }

  render = () => {
    return (
      <div className={styles.settingsContainer}>
        <Worknav {...this.props} />
        <div className={styles.settingsContent + ' pure-g'}>
          <div className="pure-u-1-1">
            <div className="pure-u-3-4">
              <h3>Edit modules in OpenCRVS</h3>
            </div>
          </div>
          <div className="pure-u-1-1">
            <div className={styles.settingsTitles + ' pure-g'}>
              <div className="pure-u-1-2">
                <h3 className={styles.title}>Module</h3>
              </div>
              <div className={styles.rightAlign + ' pure-u-1-2'}>
                <h3 className={styles.title}>Click to edit</h3>
              </div>
            </div>
            {configurable.map((subject, i) => (
              <SettingsRow
                key={i}
                text={subject}
              />)
            )}
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({
  managerReducer,
  globalReducer,
  userReducer }) => {
  const { selectedLocationMapData } = managerReducer;
  const {
    menuOpened,
    reportOption } = globalReducer;
  const { location } = userReducer;
  return {
    selectedLocationMapData,
    reportOption,
    menuOpened,
    location,
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
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
