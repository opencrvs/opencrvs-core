/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 14:44:48
 */
import React from 'react';
import styles from './styles.css';
import StaffCardLocationContainer from 'containers/StaffCardLocationContainer';
import LocationListFilters from 'components/LocationListFilters';
import LocationListItem from 'components/LocationListItem';
import { map } from 'lodash';

class LocationListContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { managerView, 
            subLocations,
            selectedSubLocation, 
            onLocationClick } = this.props;
   
    return (
      <div className={
        managerView
        ? styles.list + ' pure-u-1'
        :
          styles.registrationView
        }>
        <StaffCardLocationContainer />
        <LocationListFilters />
        {
          map(subLocations, (location, index ) => (
          <LocationListItem 
            key={location.id} 
            id={location.id} 
            title={ location.title }
            selectedSubLocation={selectedSubLocation}
            sub={ location.sub }
            onClick={() => onLocationClick(location)} />
        ))}
      </div>
    );
  }
}

   

export default LocationListContainer;