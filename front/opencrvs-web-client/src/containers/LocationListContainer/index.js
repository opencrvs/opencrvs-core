/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 15:46:34
 */
import React from 'react';
import styles from './styles.css';
import StaffCardLocationContainer from 'containers/StaffCardLocationContainer';
import LocationListFilters from 'components/LocationListFilters';
import LocationListItem from 'components/LocationListItem';
import { connect } from 'react-redux';
import { map, orderBy, get, head, filter } from 'lodash';
import { calculateRagStatus } from 'utils/manager-utils';
import { selectListFilter,
         selectListOrder } from 'actions/manager-actions';

class LocationListContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  handleRegionClick(e, title) {
    if (this.props.countryLevel) {
      if (title == 'Volta') {
        this.props.onRegionClick(title);
      }
    }
    if (this.props.regionLevel) {
      this.props.updateTooltipData(title);
    }
  }

  onMouseOut(e) {
    this.props.disableTooltipData();
  }
  onMouseOver(e, title) {
    this.props.updateTooltipData(title);
  }

  render = () => {
    const { managerView, 
            selectedLocation,
            disableTooltipData,
            selectedRegion,
            selectedDistrict,
            mapEvent,
            mapTimePeriod,
            rolloverMapData,
            updateTooltipData,
            onRegionClick,
            listFilter,
            listOrder,
            regionLevel,
            countryLevel, } = this.props;
    let itemArray = null;
    if (selectedLocation) {
      itemArray = selectedLocation.subEntries.entries;
      let obj = null;
      let filteredObj = null;
      if (listFilter == 'certifications') {
        itemArray = orderBy(selectedLocation.subEntries.entries, function(e) { 
          obj = get(head(filter(e.events, {type: mapEvent})), 'timePeriod');
          filteredObj = head(filter(obj, {title: mapTimePeriod}));
          return filteredObj.certifications;
        }, [listOrder]);
      } else {
        itemArray = orderBy(selectedLocation.subEntries.entries, function(e) { 
          return e.title;
        }, [listOrder]);
      }
    }

    
    return (
      <div className={styles.list + ' pure-u-1'}>
        <StaffCardLocationContainer {...this.props} />
        <LocationListFilters {...this.props} />

        
        {
          map(itemArray, (location, index ) => (
          <LocationListItem 
            key={index} 
            title={location.title}
            sub={location.sub}
            rolloverMapData={rolloverMapData}
            rag={calculateRagStatus(location.events, mapEvent, mapTimePeriod)}
            onClick={ (e) => this.handleRegionClick(e, location.title) }
            onMouseOut={ (e) => this.onMouseOut(e, location.title) }
            onMouseOver={ (e) => this.onMouseOver(e, location.title) }
            />
        ))}
      </div>
    );
  }
}

   

const mapStateToProps = ({ managerReducer }) => {
  const { selectedLocation,
          subLocations,
          selectedRegion,
          listFilter,
          listOrder,
          selectedDistrict,
          mapEvent,
          mapTimePeriod,
          rolloverMapData,
          regionLevel,
          countryLevel } = managerReducer;
  return {
    selectedLocation,
    subLocations,
    selectedRegion,
    selectedDistrict,
    mapEvent,
    mapTimePeriod,
    rolloverMapData,
    regionLevel,
    countryLevel,
    listFilter,
    listOrder,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    
    onListFilterChange: value => {
      dispatch(selectListFilter(value));
    },
    onListOrderChange: value => {
      dispatch(selectListOrder(value));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(LocationListContainer);
