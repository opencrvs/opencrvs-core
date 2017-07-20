/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:35 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 12:28:14
 */
import React from 'react';
import styles from './styles.css';
import SearchForm from 'components/SearchForm';
import WorkListItem from 'components/WorkListItem';
import { map, filter, get, head } from 'lodash';
import { Button } from 'react-toolbox/lib/button';
import { connect } from 'react-redux';


class WorkList extends React.Component {
  constructor(props) {
    super(props);
  }

  openNewModal = (event) => {
    this.props.onModalOpenClick('new');
  }

  render = () => {

    const { declarations,
      patients,
      onWorkItemClick,
      role,
    } = this.props;
    //TODO temp hack - do on the backend with pagination
    let workArray = [];
    map(declarations.declaration, (declaration, index ) => {
      console.log('xxxxxxxxxxxxxxxxxxxxxxx: ' + declaration.status);
      if (declaration.status != 'submitted') {
        workArray.push(declaration);
      }
    });

    return (
      <div className={styles.list + ' pure-u-1'}>
        <SearchForm role={role} />
        <section className={styles.newDecl}>
          <Button icon="add" floating accent mini onClick={this.openNewModal} />
        </section>
        {
          map(workArray, (declaration, index ) => (
          <WorkListItem 
            key={declaration.id} 
            id={declaration.id} 
            code={declaration.code}
            given={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.given') }
            family={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.family') }
            gender={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.gender') }
            birthDate={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.birthDate') }
            onClick={() => onWorkItemClick(declaration)} />
        ))}
      </div>
    );
  }
}

const mapStateToProps = ({ declarationsReducer }) => {
  const {
    declarations,
  } = declarationsReducer;
  return {
    declarations,
  };
};



export default connect(mapStateToProps, null)(WorkList);

