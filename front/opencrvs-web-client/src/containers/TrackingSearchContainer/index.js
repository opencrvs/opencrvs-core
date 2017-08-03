/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-08-02 09:40:42
 */
import React from 'react';
import styles from './styles.css';
import StaffCard from 'components/StaffCard';

class TrackingSearchContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { managerView } = this.props;
   
    return (
      <div className={
        managerView
        ? styles.list + ' pure-u-1'
        :
          styles.registrationView
        }>
        <StaffCard />
      </div>
    );
  }
}

   

export default TrackingSearchContainer;