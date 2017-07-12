/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:35 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-06 09:54:34
 */
import React from 'react';
import styles from './styles.css';
import SearchForm from 'components/SearchForm';
import WorkListItem from 'components/WorkListItem';
import { map, filter, get, head } from 'lodash';


class WorkList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render = () => {

    const { declarations,
      patients,
      onWorkItemClick,
      role,
    } = this.props;

    return (
      <div className={styles.list + ' pure-u-1'}>
        <SearchForm role={role} />
        {
          map(declarations.declaration, (declaration, index ) => (
          <WorkListItem 
            key={declaration.id} 
            id={declaration.id} 
            given={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.given') }
            family={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.family') }
            county={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.county') }
            gender={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.gender') }
            birthDate={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.birthDate') }
            onClick={() => onWorkItemClick(declaration)} />
        ))}
      </div>
    )
  }
}

export default WorkList;