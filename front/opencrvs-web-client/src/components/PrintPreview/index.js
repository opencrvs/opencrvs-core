/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:51 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-19 13:31:27
 */
import React from 'react';
import styles from './styles.css';
import { get, head, filter } from 'lodash';
import { printCert } from 'actions/certification-actions';
import { connect } from 'react-redux';
const Moment = require('moment');

class PrintPreview extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { selectedCertification, 
      patients, 
      certificateNumber} = this.props;
    const childPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedCertification.childDetails; }));
    const motherPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedCertification.motherDetails; }));
    const fatherPatient = head(filter(patients,
      function(patient) { return patient.patient.id == selectedCertification.fatherDetails; }));
    const childExtra = head(get(childPatient, 'patient.extra'));
    const motherExtra = head(get(motherPatient, 'patient.extra'));
    const fatherExtra = head(get(fatherPatient, 'patient.extra'));
    const county = head(selectedCertification.locations).county;
    const state = head(selectedCertification.locations).state;
    const tracking = selectedCertification.tracking;
    const childGiven = get(childPatient, 'patient.given').toString().split(',').map(function(item) {
      return item.trim();
    });
    const motherGiven = get(motherPatient, 'patient.given').toString().split(',').map(function(item) {
      return item.trim();
    });
    const fatherGiven = get(fatherPatient, 'patient.given').toString().split(',').map(function(item) {
      return item.trim();
    });

    const firstName = childGiven.shift();
    const middleName = childGiven.toString().replace(/,/g, '');
    const family = get(childPatient, 'patient.family');
    const gender = get(childPatient, 'patient.gender');
    const mother_firstName = motherGiven.shift();
    const mother_middleName = motherGiven.toString().replace(/,/g, '');
    const mother_family = get(motherPatient, 'patient.family');
    const mother_nationality = get(motherPatient, 'patient.nationality');
    const father_firstName = fatherGiven.shift();
    const father_middleName = fatherGiven.toString().replace(/,/g, '');
    const father_family = get(fatherPatient, 'patient.family');
    const father_nationality = get(fatherPatient, 'patient.nationality');
    const birthDate = new Date(get(childPatient, 'patient.birthDate'));

    const birthRegistrationNumber = selectedCertification.birthRegistrationNumber;

    return (
      <div id="print-mount" className={styles.certificatePaper + ' pure-g'}>
        <div className="pure-u-1 pure-u-md-1-2">
          <p>Serial No: <span className={styles.certNumber}>
            <strong>{certificateNumber.toUpperCase()}</strong></span>
          </p>
        </div>
        <div className={styles.rightAlign + ' pure-u-1 pure-u-md-1-2'}>
          <p><strong>C.R. FORM I. B. 3</strong></p>
          <p>Office of Chief Registrar</p>
          <p>Births and Deaths Registry</p>
          <p>Ghana</p>
        </div>
        <div className={styles.logo + ' pure-u-1'}>
          <img
            width="175"
            alt="Ghana crest"
            className="pure-img-responsive"
            src="static/img/crest.png"
          />
        </div>
        <div className={styles.logo + ' pure-u-1'}>
          <p>Birth Registration No: {birthRegistrationNumber}</p>
        </div>
        <div className={styles.rightAlign + ' ' + styles.original + ' pure-u-1 pure-u-md-1-2'}>
          <p><strong>ORIGINAL </strong>&nbsp;</p>
        </div>
        <div className={styles.original + ' pure-u-1 pure-u-md-1-2'}>
          <p><strong>BC / 2006</strong></p>
        </div>
        <div className={styles.logo + ' pure-u-1'}>
          <p>This is to certify that <span className={styles.dataItem}>{ firstName + ' ' + middleName + ' ' + family }</span></p>
          <div className={styles.info}>Name of Child</div>
        </div>
        <div className="pure-u-1 pure-u-md-1-2">
          <p>Child of <span className={styles.dataItem}>{ mother_firstName + ' ' + mother_middleName + ' ' + mother_family }</span></p>
          <div className={styles.info}>Full Name of Mother</div>
        </div>
        <div className="pure-u-1 pure-u-md-1-2">
          <p>Nationality <span className={styles.dataItem}>{ mother_nationality }</span></p>
          <div className={styles.info}>Nationality of Mother</div>
        </div>
        <div className="pure-u-1 pure-u-md-1-2">
          <p>and of <span className={styles.dataItem}>{ father_firstName + ' ' + father_middleName + ' ' + father_family }</span></p>
          <div className={styles.info}>Full Name of Father</div>
        </div>
        <div className="pure-u-1 pure-u-md-1-2">
          <p>Nationality <span className={styles.dataItem}>{ father_nationality }</span></p>
          <div className={styles.info}>Nationality of Father</div>
        </div>
        <div className="pure-u-1 pure-u-md-1-1">
          <p>Was born on <span className={styles.dataItem}>{ 
            Moment(birthDate).format('Do MMMM YYYY') }</span></p>
          <div className={styles.info}>Day Month Year</div>
        </div>
        <div className={styles.eventRegistered + ' pure-u-1'}>
          <p>This event was registered at { county } registration office, { state }, Ghana</p>
        </div>
        <div className={styles.witness + ' pure-u-1 pure-u-md-1-2'}>
          <p className={styles.witnessStatement}>Witness my hand this <span className={styles.dataItem}>{Moment().format('Do')}</span> day of 
          <span className={styles.dataItem}>{Moment().format('MMMM')}</span> <span className={styles.dataItem}>{Moment().format('YYYY')}</span></p>
        </div>
        <div className={styles.signatureField + ' pure-u-1 pure-u-md-1-2'}>
          <span className={styles.signature}>&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <div className={styles.info}>Registrar</div>
        </div>
      </div>
    );
  };
}
const mapStateToProps = ({ declarationsReducer, patientsReducer, certificationReducer }) => {
  const {
    selectedCertification,
  } = declarationsReducer;
  const {
    patients,
  } = patientsReducer;
  const {
    certificateNumber,
  } = certificationReducer;
  return {
    selectedCertification,
    patients,
    certificateNumber,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    printConfirm: () => {
      dispatch(printCert());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PrintPreview);
