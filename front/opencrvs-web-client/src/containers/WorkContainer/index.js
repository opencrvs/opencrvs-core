import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import WorkList from 'components/WorkList';
import WorkingItem from 'components/WorkingItem';


const WorkContainer = ({props}) => (
  <div className={styles.workItemContainer + ' content pure-g'}>
    <Worknav {...props} /> 
    <WorkList {...props} />
    <WorkingItem {...props} />
  </div>
);

export default WorkContainer;
