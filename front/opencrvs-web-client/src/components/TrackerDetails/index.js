

import React from 'react';
import styles from './styles.css';

class TrackerDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange(name, value) {
    console.log(value);
  }

  render = () => {
    const { caseData } = this.props;
    return (


      <div className="pure-g">
        <div className={styles.detailsContainer + ' pure-u-1'}>
            <p className={styles.title}>Birth Declaration</p>
            <p className={styles.sub}>Main contact: <strong>Mother</strong></p>
            <p className={styles.sub}>First name: <strong>{caseData.middleName}</strong></p>
            <p className={styles.sub}>Middle name: <strong>{caseData.firstName}</strong></p>
            <p className={styles.sub}>Family name: <strong>{caseData.family}</strong></p>
            <p className={styles.sub}>Personal ID Number: <strong>{caseData.personalIDNummber}</strong></p>
            <p className={styles.sub}>Contact: <strong>{caseData.phone}</strong></p>
            <p className={styles.sub}>Address Line 1: <strong>{caseData.addressLine1}</strong></p>
            <p className={styles.sub}>Address Line 2: <strong>{caseData.addressLine2}</strong></p>
            <p className={styles.sub}>Address Line 3: <strong>{caseData.addressLine3}</strong></p>
            <p className={styles.sub}>District: <strong>{caseData.county}</strong></p>
            <p className={styles.sub}>Region: <strong>{caseData.state}</strong></p>
        </div>
      </div>
    );
  }
}

   

export default TrackerDetails;
