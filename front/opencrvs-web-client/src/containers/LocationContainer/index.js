/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:48
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 15:47:41
 */
import React from 'react';
import styles from './styles.css';
import OverviewFilter from 'components/OverviewFilter';
import OverviewMap from 'components/OverviewMap';
import OverviewDetails from 'components/OverviewDetails';
import TrackerGraph from 'components/TrackerGraph';
import {Tab, Tabs} from 'react-toolbox';
import { connect } from 'react-redux';
import { selectRegion,
         selectCountry,
         selectEvent,
         selectPeriod,
         setTooltipData,
         disableTooltip } from 'actions/manager-actions';

class LocationContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  handleOptionChange = (index) => {
    this.props.onReportOptionClick();
  };

  render = () => {
    const { reportOption,
      caseGraphData,
      caseNotes } = this.props;

    return (
      <div className={styles.locationContainer + ' pure-u-1'}>
        <Tabs index={reportOption} onChange={this.handleOptionChange} className={styles.tabs}>
          <Tab label="Overview" className={styles.tab}>
            <OverviewFilter {...this.props} />
            <OverviewMap {...this.props} />
            <OverviewDetails {...this.props} />
          </Tab>
          <Tab label="Case Tracker">
            { caseGraphData && <TrackerGraph {...this.props}/> }
          </Tab>
        </Tabs>
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
    caseGraphData,
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
    caseGraphData,
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
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationContainer);


