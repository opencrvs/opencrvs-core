/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-06 09:58:36
 */
import React from 'react';
import styles from './styles.css';
import WorkingItemCanvas from 'components/WorkingItemCanvas';
import {connect} from 'react-redux';
import { Button } from 'react-toolbox/lib/button';
import { filter, get, head } from 'lodash';

class WorkingItem extends React.Component {
  constructor(props) {
    super(props);
  }
  
  openImageModal = (event) => {
    this.props.onModalOpenClick();
  }

  render = () => {
    const { selectedDeclaration, patients, role } = this.props;
    const childPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedDeclaration.childDetails; }));
    const childAddress = head(get(childPatient, 'patient.address'));
    return (
      <div className={styles.workingItemContainer + ' pure-u-1'}>
        {
        selectedDeclaration ? 
          <div className={styles.wiContentHeader + ' pure-g'}>
            <div className="pure-u-1-2">
              <h1 className={styles.wiContentTitle}>
              
              { get(childPatient, 'patient.given').toString().replace(/,/g, '') + ' ' + get(childPatient, 'patient.family') }
              
              </h1>
              <p className={styles.wiContentSubtitle}>
                
                {' '}
                <span>
                
                { get(childPatient, 'patient.birthDate') }
                
                </span>
                {' '}
                {
                  get(childAddress, 'county') 
                }
              </p>
            </div>
            <div className={styles.wiContentControls + ' pure-u-1-2'}>
              <Button icon="save" label="Save" flat />
              <Button icon="image" label="Upload" flat onClick={this.openImageModal} />
              <Button icon="delete" label="Trash" flat />
              <Button icon="send" label="Submit" flat />
            </div>
          </div> : ''
        }
        <div className={ !selectedDeclaration ? styles.noSelectedDeclaration : styles.wiContentBody}>
          {
              selectedDeclaration ? 
              <WorkingItemCanvas selectedDeclaration={selectedDeclaration} />
              : 
              <div className={styles.noSelectedMessage}>
                <h1 className={styles.wiContentTitle}>
                  {
                    role == 'validator' ? 
                     'Select a declaration to validate, or create a new declaration'  : 
                     'Select a notification to declare, or create a new declaration'  
                  }
                
                </h1>
              </div>
            }
        </div>
      </div>
    );
  }
}

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
)(WorkingItem);
