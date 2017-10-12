import React from 'react';
import styles from './styles.css';
import Dropdown from 'react-toolbox/lib/dropdown';

const listFilters = [
  { value: 'none', label: 'Alphabetical' },
  { value: 'certifications', label: 'Registration coverage' },
];

const listOrders = [
  { value: 'desc', label: 'High to low'},
  { value: 'asc', label: 'Low to high' },
];

class LocationListFilters extends React.Component {
  constructor(props) {
    super(props);
  }

  handleListFilter = (value) => {
    this.props.onListFilterChange(value);
  }

  handleListOrder = (value) => {
    this.props.onListOrderChange(value);
  }

  render = () => {
    const {
      listFilter,
      listOrder,
    } = this.props;
   
    return (
      <div className={styles.locationListFilters}>
        <div className={styles.filterOption}>
          <Dropdown
            auto
            className={styles.dropdownInput}
            onChange={this.handleListFilter}
            source={listFilters}
            value={listFilter}
          />
        </div>
        <div className={styles.filterOption}>
          <Dropdown
            className={styles.dropdownInput}
            auto
            onChange={this.handleListOrder}
            source={listOrders}
            value={listOrder}
          />
        </div>
      </div>
    );
  }
}

export default LocationListFilters;
