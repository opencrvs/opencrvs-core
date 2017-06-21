import React from 'react';
import styles from './styles.css';
import SearchForm from 'components/SearchForm';
import WorkListItem from 'components/WorkListItem';
import { values } from 'lodash';

class WorkList extends React.Component {

  constructor(props) {
    super(props);
  }

  render = () => {
    return (
      //
      <div className={styles.list + ' pure-u-1'}>
        <SearchForm />
        {
          values(this.props.declarations).map(declaration => (
          <WorkListItem key={declaration.id} {...declaration} onClick={() => this.props.onWorkItemClick(declaration.id)} />
        ))}
      </div>
    );
  };
}

export default WorkList;



    