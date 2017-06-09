import React from 'react';
import styles from './styles.css';
import WorkingItemForm from 'components/WorkingItemForm';
import WorkingItemDisplay from 'components/WorkingItemDisplay';

class WorkingItem extends React.Component {
  constructor(props) {
    super(props);
  }

  editItem = event => {
    
  };

  render = (props) => {
    return (
      <div className={styles.workingItemContainer + ' pure-u-1'}>
        <div className={styles.wiContentHeader + ' pure-g'}>
          <div className="pure-u-1-2">
            <h1 className={styles.wiContentTitle}>Validation required</h1>
            <p className={styles.wiContentSubtitle}>
              Declaration DV-874654681
              {' '}
              <span>3:56pm, July 3, 2017</span>
              {' '}
              Declared by Chris Joffe
            </p>
          </div>
          <div className={styles.wiContentControls + ' pure-u-1-2'}>
            <button
              className={styles.secondaryButton + ' pure-button'}
              onClick={this.editItem}
            >
              Edit
            </button>
            <button className={styles.secondaryButton + ' pure-button'}>
              Submit
            </button>
            <button className={styles.secondaryButton + ' pure-button'}>
              Move to
            </button>
          </div>
        </div>
        <div className={styles.wiContentBody}>
          <WorkingItemForm {...props} />
        </div>
      </div>
    );
  };
}

export default WorkingItem;
