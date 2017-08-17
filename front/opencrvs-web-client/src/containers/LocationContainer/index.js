/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-16 15:28:04
 */
import React from 'react';
import styles from './styles.css';
import OverviewFilter from 'components/OverviewFilter';
import OverviewMap from 'components/OverviewMap';
import OverviewDetails from 'components/OverviewDetails';
import TrackerGraph from 'components/TrackerGraph';
import TrackerDetails from 'components/TrackerDetails';
import {Tab, Tabs} from 'react-toolbox';
import { connect } from 'react-redux';
import { selectRegion,
         selectCountry,
         selectEvent,
         selectPeriod,
         updateTooltipOrigin,
         setTooltipData,
         disableTooltip,
         reportOptionToggle } from 'actions/manager-actions';

class LocationContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  handleOptionChange = (index) => {
    this.props.onReportOptionClick();
  };

  render = () => {
    const { managerView, 
      reportOption } = this.props;
   
    return (
      <div className={
        managerView
        ? styles.locationContainer + ' pure-u-1'
        :
          styles.registrationView
        }>
        <Tabs index={reportOption} onChange={this.handleOptionChange} className={styles.tabs}>
          <Tab label="Overview" className={styles.tab}>
            <OverviewFilter {...this.props} />
            <OverviewMap {...this.props} />
            <OverviewDetails {...this.props} />
          </Tab>
          <Tab label="Case Tracker">
            <TrackerGraph />
            <TrackerDetails />
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
    updateOrigin: newProps => {
      dispatch(updateTooltipOrigin(newProps));
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


