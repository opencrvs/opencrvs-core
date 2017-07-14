/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:48 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-14 12:48:56
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
    this.props.onModalOpenClick('image');
  }

  render = () => {
    const { selectedDeclaration, patients, role, category, newDeclaration } = this.props;
    const childPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedDeclaration.childDetails; }));
    const childAddress = head(get(childPatient, 'patient.address'));
    let pageTitle = null;
    let birthDate = null;
    let address = null;
    if (selectedDeclaration) {
      pageTitle = get(childPatient, 'patient.given').toString().replace(/,/g, '') + ' ' + get(childPatient, 'patient.family');
      birthDate = get(childPatient, 'patient.birthDate');
      address = get(childAddress, 'county');
    } else {
      pageTitle = 'New ' + category + ' Declaration';
      birthDate = '';
      address = '';
    }
    return (
      <div className={styles.workingItemContainer + ' pure-u-1'}>
        {
        selectedDeclaration || newDeclaration == true 
          ? 
          <div className={styles.wiContentHeader + ' pure-g'}>
            <div className="pure-u-1 pure-u-md-1-2">
              <h1 className={
                    newDeclaration == true
                      ? styles.newWorkItem + ' ' + styles.wiContentTitle
                      : styles.wiContentTitle
                  }
              >{ pageTitle }</h1>
              <p className={styles.wiContentSubtitle}>
                <span>{' ' + birthDate }</span>{' ' + address }
              </p>
            </div>
            <div className={styles.wiContentControls + ' pure-u-1 pure-u-md-1-2'}>
              <div className="pure-g">
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="save" label="Save" flat />
                </div>
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="image" label="Upload" flat onClick={this.openImageModal} />
                </div>
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="delete" label="Trash" flat />
                </div>
                <div className="pure-u-2 pure-u-md-1-4">
                  <Button icon="send" label="Submit" flat />
                </div>
              </div>
            </div>
          </div> 
          : 
            ''
        }
        <div 
          className={ !selectedDeclaration || newDeclaration == false 
            ? styles.noSelectedDeclaration 
            : styles.wiContentBody}>
          {
              selectedDeclaration || newDeclaration == true ? 
              <WorkingItemCanvas 
                selectedDeclaration={selectedDeclaration} 
                newDeclaration={newDeclaration} 
                patients={patients} 
                category={category} 
              />
              : 
              <div className={styles.noSelectedMessage}>
                <h1 className={styles.wiContentTitle}>
                  {
                    role == 'validator' 
                      ? 
                     'Select a declaration to validate, or create a new declaration'  
                      : 
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
    newDeclaration,
  } = declarationsReducer;
  return {
    selectedDeclaration,
    newDeclaration,
  };
};

export default connect(
  mapStateToProps,
  null
)(WorkingItem);
