/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:35 
 * @Last Modified by:   Euan Millar 
 * @Last Modified time: 2017-07-05 01:18:35 
 */
import React from 'react';
import styles from './styles.css';
import SearchForm from 'components/SearchForm';
import WorkListItem from 'components/WorkListItem';
import { values } from 'lodash';

const WorkList = ({ declarations, onWorkItemClick }) => (
  <div className={styles.list + ' pure-u-1'}>
    <SearchForm />
    {
      values(declarations).map(declaration => (
      <WorkListItem key={declaration.id} {...declaration} onClick={() => onWorkItemClick(declaration)} />
    ))}
  </div>
);

export default WorkList;

