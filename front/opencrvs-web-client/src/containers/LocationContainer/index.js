/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-03 00:20:37
 */
import React from 'react';
import styles from './styles.css';
import OverviewFilter from 'components/OverviewFilter';
import OverviewMap from 'components/OverviewMap';
import OverviewDetails from 'components/OverviewDetails';
import TrackerGraph from 'components/TrackerGraph';
import TrackerDetails from 'components/TrackerDetails';
import {Tab, Tabs} from 'react-toolbox';

class LocationContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  handleOptionChange = (index) => {
    this.props.onReportOptionClick();
  };

  render = () => {
    const { managerView, reportOption } = this.props;
   
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

   

export default LocationContainer;
