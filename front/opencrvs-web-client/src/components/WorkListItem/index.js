/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:30 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-06 01:18:49
 */
import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';

const WorkListItem = ({
  onClick,
  declaration,
  given,
  family,
  county,
  gender,
  birthDate,
  id,
  selectedDeclaration,
}) => (
  <div
    onClick={onClick}
    className={
      id == selectedDeclaration.id
        ? styles.openedWorkItem + ' ' + styles.workItem + ' pure-g'
        : styles.workItem + ' pure-g'
    }
  >
    <div className="pure-u">
      <span className={styles.labelDeclaration} />
    </div>
    <div className="pure-u-3-4">
      <h5 className={styles.workItemTitle}>{  given ? given.toString().replace(/,/g, '')  + ' ' + family : '' }</h5>
      <h4 className={styles.workItemSubject}>{county}</h4>
      <p className={styles.workItemDesc}>
        {gender + ' - ' + birthDate}
      </p>
    </div>
  </div>
);

const mapStateToProps = ({ declarationsReducer }) => {
  const { selectedDeclaration } = declarationsReducer;
  return {
    selectedDeclaration,
  };
};

export default connect(mapStateToProps, null)(WorkListItem);
