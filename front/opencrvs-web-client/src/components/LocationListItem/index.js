/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 14:45:11
 */
import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';

class LocationListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { onClick,
      title,
      sub,
      id,
      selectedSubLocation } = this.props;
    
    
    return (
        <div
          onClick={onClick}
          className={
            id == selectedSubLocation.id
              ? styles.openedLocationItem + ' ' + styles.locationItem + ' pure-g'
              : styles.locationItem + ' pure-g'
          }
        >
          
          <div className={styles.locationItemHolder + ' pure-u-1-1'}>
            <h1 className={styles.locationItemTitle}>{ title }</h1>
            <h5 className={styles.locationItemDesc}>{ sub }</h5>
          </div>
        </div>
    );
  }
}


const mapStateToProps = ({ managerReducer }) => {
  const { selectedSubLocation } = managerReducer;
  return {
    selectedSubLocation,
  };
};

export default connect(mapStateToProps, null)(LocationListItem);
