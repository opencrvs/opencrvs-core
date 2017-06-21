import React from 'react';
import styles from './styles.css';   
import { values } from 'lodash';
        
const WorkListItem = ({ onClick, firstName, lastName, district, gender, dob }) => (         
  <div className={styles.workItem + ' pure-g'}>
    <div className="pure-u" onClick={onClick}>
      <span className={styles.labelDeclaration}></span>
    </div>
    <div className="pure-u-3-4">
      <h5 className={styles.workItemTitle}>{firstName + ' ' + lastName}</h5>
      <h4 className={styles.workItemSubject}>{district}</h4>
      <p className={styles.workItemDesc}>
        {district + ' - ' + dob}
      </p>
    </div>
  </div>
);



export default WorkListItem;


