/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:12 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-10-08 17:58:39
 */
import React from 'react';
import styles from './styles.css';
import Dialog from 'react-toolbox/lib/dialog';
import { Button } from 'react-toolbox/lib/button';
import { filter, get, head } from 'lodash';
import Dropdown from 'react-toolbox/lib/dropdown';
import Input from 'react-toolbox/lib/input';
import Moment from 'moment';
import theme from './searchInput.css';

const individuals = [
  { value: 'none', label: 'Select collecting individual' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father'},
  { value: 'informant', label: 'Informant' },
  { value: 'other', label: 'Other'},
];

class CertCheckModal extends React.Component {
  constructor(props) {
    super(props);
  }
  
  closeCertCheckModal = (event) => {
    this.props.onModalCloseClick('certCheck');
  }
  
  rejectCert = (event) => {
    this.props.onModalCloseClick('certCheck');
  }

  continueToPrintCert = (event) => {
    if (this.props.collector != 'none') {
      this.props.onPrintProceed();
      this.props.onModalCloseClick('certCheck');
    }
  }

  handleChange = (value) => {
    this.props.setCollector(value);
  };

  render = () => {
    const { 
      certIDCheckModal, 
      collector,
      declarationToCheckAgainst,
      patients,
       } = this.props;
    const isCollector = (collector !== 'other' && collector !== 'none');
    const dialogueActions = [
      { label: 'Close', onClick: this.closeCertCheckModal },
      { label: 'Reject', onClick: this.rejectCert },
      { label: 'Continue', onClick: this.continueToPrintCert },
    ];
    let details = {};
    let myPatient = null;

    switch (collector) {
      case 'mother':
        myPatient = head(filter(patients,
          function(patient) { return patient.patient.id == declarationToCheckAgainst.motherDetails; }));
        break;
      case 'father':
        myPatient = head(filter(patients,
          function(patient) { return patient.patient.id == declarationToCheckAgainst.fatherDetails; }));
        break;
      case 'informant':
        // no informants exist in the database so for prototype, informant equals father
        myPatient = head(filter(patients,
          function(patient) { return patient.patient.id == declarationToCheckAgainst.fatherDetails; }));
        break;
    }
    if (myPatient) {
      const given = get(myPatient, 'patient.given').toString().split(',').map(function(item) {
        return item.trim();
      });
      const extra = head(get(myPatient, 'patient.extra'));
      details.firstName = given.shift();
      details.middleName = given.toString().replace(/,/g, '');
      details.family = get(myPatient, 'patient.family');
      details.birthDate = new Date(get(myPatient, 'patient.birthDate'));
      details.personalIDNummber = get(extra, 'personalIDNummber');
    }


    return (
      <Dialog
        actions={dialogueActions}
        active={certIDCheckModal}
        onEscKeyDown={this.closeCertCheckModal}
        title="Enter details for the collecting individual"
      >
        <section className={styles.checkCert + ' pure-g'}>
          <div className="pure-u-1">
            <Dropdown
              auto
              onChange={this.handleChange}
              source={individuals}
              value={collector}
            />
          </div>
          {
            isCollector &&
            <div className="pure-u-1">
              <p className={styles.checkHeading}>Click 'Continue' if the individual's ID matches the following data</p>
              {
                myPatient &&
                <div className={styles.patientData}>
                  <p className={styles.checkInfo}>
                    <span className={styles.info}>First name:</span> {details.firstName}
                  </p>
                  <p className={styles.checkInfo}>
                    <span className={styles.info}>Middle name:</span> {details.middleName}
                  </p>
                  <p className={styles.checkInfo}>
                    <span className={styles.info}>Family name:</span> {details.family}
                  </p>
                  <p className={styles.checkInfo}>
                    <span className={styles.info}>Date of birth:</span> {Moment(details.birthDate).format('MMMM Do YYYY')}
                  </p>
                  <p className={styles.checkInfo}>
                    <span className={styles.info}>Personal ID Number:</span> {details.personalIDNummber}
                  </p>
                </div>
              }
            </div>
          }
          {
            (collector === 'other') &&
            <div className="pure-u-1">
              <p className={styles.checkHeading}>1. Search the national ID database to confirm the person's identity</p>
              <div className="pure-u-1 pure-u-md-1-2">
              <Input theme={theme} type="text" label="Individual's National ID" icon="search" />
              </div>
              
              <div className={styles.nationalIDButton + ' pure-u-1 pure-u-md-1-2'}>
                <Button label="Check National ID" raised primary />
              </div>
              <div className="pure-u-1">
                <p className={styles.checkHeading}>2. Upload a signed affidavit from the mother of the child.</p>
                <Button icon="image" label="Upload affidavit" raised />
              </div>
            </div>
          }
        </section>
      </Dialog>
    );
  }
}

export default CertCheckModal;


