

import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';
import StaffCard from 'components/StaffCard';

class StaffCardLocationContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { mapLocations,
            countryLevel,
            regionLevel,
            rolloverMapData,
            regionManager,
            districtManager,
            countryManager } = this.props;

    let topCard = null;
    let middleCard = null;
    let bottomCard = null;
    if (countryLevel) {
      topCard = 'L';
      bottomCard = 'I';
      middleCard = 'I';
    }
    if (regionLevel){
      topCard = 'S';
      middleCard = 'M';
      bottomCard = 'I';
    }
    if (rolloverMapData) {
      if (rolloverMapData.title) {
        if (regionLevel) {
          topCard = 'T';
          middleCard = 'S';
          if (districtManager) {
            bottomCard = 'M';
          }
        }
        if (countryLevel) {
          topCard = 'S';
          middleCard = 'M';
          bottomCard = 'I';
        }
      }
    }
    return (
      <div className={styles.staffCardLocationContainer + ' pure-g'}>
        { countryManager != null && <StaffCard cardType={topCard} managerData={countryManager} />}
        { middleCard != 'I' && <StaffCard cardType={middleCard} managerData={regionManager} />}
        { bottomCard != 'I' && <StaffCard cardType={bottomCard} managerData={districtManager} />}
      </div>
    );
  }
}

const mapStateToProps = ({ managerReducer }) => {
  const { mapLocations,
            countryLevel,
            regionLevel,
            rolloverMapData,
            regionManager,
            countryManager,
            districtManager } = managerReducer;
  return {
    mapLocations,
    countryLevel,
    regionLevel,
    rolloverMapData,
    regionManager,
    districtManager,
    countryManager,
  };
};

export default connect(mapStateToProps, null)(StaffCardLocationContainer);
