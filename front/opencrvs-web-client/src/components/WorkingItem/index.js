import React from 'react';
import styles from './styles.css';
import WorkingItemForm from 'components/WorkingItemForm';
import {connect} from 'react-redux';
import { Button } from 'react-toolbox/lib/button';

const WorkingItem = ({ selectedDeclaration }) => (   
      <div className={styles.workingItemContainer + ' pure-u-1'}>
        {
        selectedDeclaration ? 
          <div className={styles.wiContentHeader + ' pure-g'}>
            <div className="pure-u-1-2">
              <h1 className={styles.wiContentTitle}>
              
              { selectedDeclaration.firstName + ' ' + selectedDeclaration.lastName }
              
              </h1>
              <p className={styles.wiContentSubtitle}>
                
                {' '}
                <span>
                
                { selectedDeclaration.dob }
                
                </span>
                {' '}
                {
                  selectedDeclaration.district 
                }
              </p>
            </div>
            <div className={styles.wiContentControls + ' pure-u-1-2'}>
              <Button icon='save' label='Save' flat />
              <Button icon='delete' label='Trash' flat />
              <Button icon='send' label='Submit' flat />
            </div>
          </div> : ''
        }
        <div className={ !selectedDeclaration ? styles.noSelectedDeclaration : styles.wiContentBody}>
          {
              selectedDeclaration ? 
              <WorkingItemForm selectedDeclaration={selectedDeclaration} />
              : 
              <div className={styles.noSelectedMessage}>
                <h1 className={styles.wiContentTitle}>
                Select a birth to edit, or enter a new birth
                </h1>
              </div>
            }
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
)(WorkingItem)
