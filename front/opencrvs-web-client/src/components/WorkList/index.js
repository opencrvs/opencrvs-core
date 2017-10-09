/*
 * @Author: Euan Millar
 * @Date: 2017-07-05 01:18:35
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-09 10:03:09
 */
import React from 'react';
import styles from './styles.css';
import SearchForm from 'components/SearchForm';
import WorkListItem from 'components/WorkListItem';
import { map, filter, get, head, orderBy } from 'lodash';
import { Button } from 'react-toolbox/lib/button';
import { connect } from 'react-redux';
import {
  searchDeclarations,
} from 'actions/declaration-actions';


class WorkList extends React.Component {
  constructor(props) {
    super(props);
  }

  openNewModal = (event) => {
    this.props.onModalOpenClick('new');
  }

  render = () => {

    const { declarationsList,
      patients,
      onWorkItemClick,
      role,
      onSearchRequest,
      managerView,
    } = this.props;
    let itemArray = declarationsList;
    if (declarationsList.length > 0) {
      itemArray = orderBy(declarationsList, function(e) {
        return e.created_at;
      }, ['asc']);
    }
    const wait = false;
    /*map(itemArray, (declaration, index ) => {
      console.log('worklist: ' + declaration.code);
      console.log('worklist: ' + declaration.id);
      console.log('worklist: ' + declaration.family);
      console.log('worklist: ' + declaration.given);
    });*/


    return (
      <div className={
        managerView
        ? styles.managerView
        :
        styles.list + ' pure-u-1'
        }>
        <section className={styles.newDecl + ' pure-g'}>
          <span className={styles.title + ' pure-u-4-5'}>Work queue</span>
          <Button className={styles.addButton + 'pure-u-1-5'} icon="add" floating accent mini onClick={this.openNewModal} />
        </section>
        <SearchForm role={role} onSearchRequest={onSearchRequest} />
        {
          map(itemArray, (declaration, index ) => (
          <WorkListItem
            key={declaration.id}
            id={declaration.id}
            code={declaration.code}
            given={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.given') }
            family={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.family') }
            address={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.address') }
            tracking={declaration.tracking}
            created={declaration.created_at}
            birthDate={ get(head(filter(patients, function(patient) { return patient.patient.id == declaration.childDetails; })), 'patient.birthDate') }
            onClick={() => onWorkItemClick(declaration)} />
        ))}
      </div>
    );
  }
}

const mapStateToProps = ({ declarationsReducer }) => {
  const {
    searchTerm,
    declarationsList,
  } = declarationsReducer;
  return {
    declarationsList,
    searchTerm,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSearchRequest: searchTerm => {
      dispatch(searchDeclarations(searchTerm));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkList);


