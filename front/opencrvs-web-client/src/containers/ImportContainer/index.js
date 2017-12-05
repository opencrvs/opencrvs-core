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
import { logoutUser, updateUserDetails } from 'actions/user-actions';
import { importData, clearData } from 'actions/import-actions';
import { mobileMenuControl } from 'actions/global-actions';

class ImportContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange = (field, value) => {
    this.setState({ [field]: value });
  };

  componentWillMount() {
    this.props.fetchUserDetails();
  }

  render = () => {
      const { clearData, importData, dataCleared, dataImported } = this.props;
    return <div className={styles.importContainer}>
        <Worknav {...this.props} />
        <div className={styles.importContent + " pure-g"}>
          <div className="pure-u-1-1">
            <h1>WARNING: YOU CANNOT UNDO THESE ACTIONS</h1>
          </div>
          {!dataCleared && <div className="pure-u-1-1">
              <h3>
                Click <a className={styles.link} onClick={clearData}>
                  here
                </a> to clear all prototype data
              </h3>
            </div>}
          {!dataImported && <div className="pure-u-1-1">
              <h3>
                Click <a className={styles.link} onClick={importData}>
                  here
                </a> to load saved notification for David Idirisu into prototype
              </h3>
            </div>}
        </div>
      </div>;
  };
}

const mapStateToProps = ({ managerReducer, globalReducer, userReducer, importReducer }) => {
  const { selectedLocationMapData } = managerReducer;
  const { dataCleared, dataImported } = importReducer;
  const { menuOpened, reportOption } = globalReducer;
  const { location } = userReducer;
  return {
    selectedLocationMapData,
    reportOption,
    menuOpened,
    location,
    dataCleared,
    dataImported,
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
      dispatch(updateUserDetails("settings"));
    },
    clearData: () => {
      dispatch(clearData());
    },
    importData: () => {
      dispatch(importData());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportContainer);
