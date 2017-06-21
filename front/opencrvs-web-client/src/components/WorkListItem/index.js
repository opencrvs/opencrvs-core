import React from 'react';
import styles from './styles.css';   
import { values } from 'lodash';
import {connect} from 'react-redux'
        
const WorkListItem = ({ onClick, firstName, lastName, district, gender, dob, id, selectedDeclaration }) => (   
  <div onClick={onClick} className={id == selectedDeclaration ? styles.openedWorkItem + ' ' + styles.workItem + ' pure-g' : styles.workItem + ' pure-g'}>
    <div className="pure-u">
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

const mapStateToProps = ({ declarationsReducer }) => {
  const {
    selectedDeclaration,
  } = declarationsReducer;
  return {
    selectedDeclaration,
  };
};

export default connect(
  mapStateToProps,
  null
)(WorkListItem)


