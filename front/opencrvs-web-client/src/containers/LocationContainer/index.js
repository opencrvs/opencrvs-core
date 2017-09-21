/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:48
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-21 11:54:05
 */
import React from 'react';
import styles from './styles.css';
import OverviewFilter from 'components/OverviewFilter';
import OverviewMap from 'components/OverviewMap';
import OverviewDetails from 'components/OverviewDetails';
import TrackerTimeline from 'components/TrackerTimeline';
import OverviewPerformance from 'components/OverviewPerformance';
import {Tab, Tabs} from 'react-toolbox';
import { connect } from 'react-redux';
import { selectRegion,
         selectCountry,
         selectEvent,
         selectPeriod,
         setTooltipData,
         disableTooltip,
         togglePerformanceReport } from 'actions/manager-actions';

class LocationContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  handleOptionChange = (index) => {
    this.props.onReportOptionClick();
  };

  render = () => {
    const { reportOption,
      caseData,
      caseNotes } = this.props;

    return (
      <div className={styles.locationContainer + ' pure-u-1'}>
        <Tabs index={reportOption} onChange={this.handleOptionChange} className={styles.tabs}>
          <Tab label="Overview" className={styles.tab}>
            <OverviewMap {...this.props} />
          </Tab>
          <Tab label="Case Tracker">
            { caseData && <TrackerTimeline {...this.props}/> }
          </Tab>
        </Tabs>
        { reportOption == 0 && <OverviewPerformance {...this.props} />}
      </div>
    );
  }
}



const mapStateToProps = ({
  managerReducer,
  globalReducer }) => {
  const {
    mapLocations,
    fetchingMapView,
    subLocations,
    selectedLocation,
    countryMapData,
    regionMapData,
    selectedLocationMapData,
    caseNotes,
    caseData,
  } = managerReducer;
  const {
    country,
    region } = globalReducer;
  return {

    mapLocations,
    fetchingMapView,
    subLocations,
    selectedLocation,
    countryMapData,
    regionMapData,
    selectedLocationMapData,
    caseNotes,
    caseData,
    country,
    region,
  };
};

const mapDispatchToProps = dispatch => {
  return {

    onRegionClick: name => {
      dispatch(selectRegion(name));
    },
    onCountryClick: () => {
      dispatch(selectCountry());
    },
    onEventChange: value => {
      dispatch(selectEvent(value));
    },
    onPeriodChange: value => {
      dispatch(selectPeriod(value));
    },
    updateTooltipData: name => {
      dispatch(setTooltipData(name));
    },
    disableTooltipData: () => {
      dispatch(disableTooltip());
    },
    togglePerformance: () => {
      dispatch(togglePerformanceReport());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationContainer);


