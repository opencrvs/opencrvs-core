/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:17:38
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 15:43:18
 */
import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import LocationContainer from 'containers/LocationContainer';
import LocationListContainer from 'containers/LocationListContainer';
import TrackingSearchContainer from 'containers/TrackingSearchContainer';
import { connect } from 'react-redux';
import { logoutUser,
  updateUserDetails } from 'actions/user-actions';
import RatesOverTimeModal from 'components/RatesOverTimeModal';
import {
  reportOptionToggle,
  mobileMenuControl,
} from 'actions/global-actions';
import {
  caseTracking,
  caseTrackingClear,
  ratesModalToggle,
} from 'actions/manager-actions';

class ReportsContainer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchUserDetails();
  }

  render = () => {
    const { selectedLocationMapData, reportOption, ratesOverTimeModal } = this.props;
    let managerView = false;
    return (
      <div className={styles.reportsContainer}>
        <Worknav {...this.props} />
        <div className=" pure-g">

          { selectedLocationMapData && <LocationContainer {...this.props}  managerView={managerView}/> }
          {
            reportOption === 0
            ? <LocationListContainer {...this.props}  managerView={managerView}/>
            : <TrackingSearchContainer {...this.props}  managerView={managerView}/>
          }
          { ratesOverTimeModal > 0 && <RatesOverTimeModal {...this.props} />}
        </div>
      </div>
    );
  };
}

const mapStateToProps = ({
  managerReducer,
  globalReducer,
  userReducer }) => {
  const { selectedLocationMapData, ratesOverTimeModal, registrationRateData } = managerReducer;
  const {
    menuOpened,
    reportOption } = globalReducer;
  const { location } = userReducer;
  return {
    selectedLocationMapData,
    reportOption,
    menuOpened,
    ratesOverTimeModal,
    registrationRateData,
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
      dispatch(updateUserDetails('reports'));
    },
    onReportOptionClick: () => {
      dispatch(reportOptionToggle());
    },
    onCaseTrackingClick: () => {
      dispatch(caseTracking());
    },
    onCaseTrackingClear: () => {
      dispatch(caseTrackingClear());
    },
    onModalOpenClick: context => {
      switch (context) {
        case 'rates':
          dispatch(ratesModalToggle());
          break;
      }
    },
    onModalCloseClick: context => {
      switch (context) {
        case 'rates':
          dispatch(ratesModalToggle());
          break;
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportsContainer);

