/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:43 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-16 22:15:53
 */
import React from 'react';
import {connect} from 'react-redux';
import { filter, get, head } from 'lodash';
import WorkingItemForm from 'components/WorkingItemForm';
import { initialize } from 'redux-form';

class WorkingItemCanvas extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { selectedDeclaration, patients, newDeclaration, category } = this.props;
    let myInitialValues = null;
    if (newDeclaration == false && selectedDeclaration) {
      const childPatient = head(filter(patients,
        function(patient) { return patient.patient.id == selectedDeclaration.childDetails; }));
      const motherPatient = head(filter(patients,
        function(patient) { return patient.patient.id == selectedDeclaration.motherDetails; }));
      const fatherPatient = head(filter(patients,
        function(patient) { return patient.patient.id == selectedDeclaration.fatherDetails; }));

      //Addresses
      const motherAddress = head(get(motherPatient, 'patient.address'));
      const fatherAddress = head(get(fatherPatient, 'patient.address'));

      //Extra Info
      const childExtra = head(get(childPatient, 'patient.extra'));
      const motherExtra = head(get(motherPatient, 'patient.extra'));
      const fatherExtra = head(get(fatherPatient, 'patient.extra'));

      //Telecom
      const motherTelecom = head(get(motherPatient, 'patient.telecom'));
      const fatherTelecom = head(get(fatherPatient, 'patient.telecom'));

      // First Names
      const childGiven = get(childPatient, 'patient.given').toString().split(',').map(function(item) {
        return item.trim();
      });
      const motherGiven = get(motherPatient, 'patient.given').toString().split(',').map(function(item) {
        return item.trim();
      });
      const fatherGiven = get(fatherPatient, 'patient.given').toString().split(',').map(function(item) {
        return item.trim();
      });

      myInitialValues = {

        id: head(selectedDeclaration.id),
        status: head(selectedDeclaration.status),
        code: head(selectedDeclaration.code),
        tracking: head(selectedDeclaration.tracking),
        firstName: childGiven.shift(),
        middleName: childGiven.toString().replace(/,/g, ''),
        family: get(childPatient, 'patient.family'),
        gender: get(childPatient, 'patient.gender'),
        birthDate: new Date(get(childPatient, 'patient.birthDate')),
        personalIDNummber: get(childExtra, 'personalIDNummber'),
        // TODO: Type of birth outstanding
        placeOfDelivery: head(selectedDeclaration.locations).placeOfDelivery,
        attendantAtBirth: head(selectedDeclaration.locations).attendantAtBirth,
        addressLine1: head(selectedDeclaration.locations).addressLine1,
        addressLine2: head(selectedDeclaration.locations).addressLine2,
        addressLine3: head(selectedDeclaration.locations).addressLine3,
        city: head(selectedDeclaration.locations).city,
        county: head(selectedDeclaration.locations).county,
        hospitalName: head(selectedDeclaration.locations).hospitalName,
        postalCode: head(selectedDeclaration.locations).postalCode,
        state: head(selectedDeclaration.locations).state,
        // Mother
        mother_firstName: motherGiven.shift(),
        mother_middleName: motherGiven.toString().replace(/,/g, ''),
        mother_family: get(motherPatient, 'patient.family'),

        mother_maidenName: get(motherExtra, 'maidenName'),
        //TODO: set gender correctly for mum and dad
        mother_birthDate: new Date(get(motherPatient, 'patient.birthDate')),
        mother_personalIDNummber: get(motherExtra, 'personalIDNummber'),
        mother_maritalStatus: get(motherPatient, 'patient.maritalStatus'),
        mother_marriageDate: new Date(get(motherExtra, 'marriageDate')),
        mother_nationality: get(motherPatient, 'patient.nationality'),
        mother_phone: get(motherTelecom, 'phone'),
        mother_email: get(motherTelecom, 'email'),
        mother_use: get(motherTelecom, 'use'),
        mother_addressLine1: motherAddress.addressLine1,
        mother_addressLine2: motherAddress.addressLine2,
        mother_addressLine3: motherAddress.addressLine3,
        mother_city: motherAddress.city,
        mother_county: motherAddress.county,
        mother_hospitalName: motherAddress.hospitalName,
        mother_postalCode: motherAddress.postalCode,
        mother_state: motherAddress.state,
        // Extra
        childrenBornAlive: get(motherExtra, 'childrenBornAlive'),
        childrenBornLiving: get(motherExtra, 'childrenBornLiving'),
        foetalDeaths: get(motherExtra, 'foetalDeaths'),
        birthDateLast: new Date(get(motherExtra, 'foetalDeaths')),

        mother_religion: get(motherExtra, 'religion'),
        mother_formalEducation: get(motherExtra, 'formalEducation'),
        mother_occupation: get(motherExtra, 'occupation'),
        mother_employment: get(motherExtra, 'employment'),
        // Father
        father_firstName: fatherGiven.shift(),
        father_middleName: fatherGiven.toString().replace(/,/g, ''),
        father_family: get(fatherPatient, 'patient.family'),
        father_birthDate: new Date(get(fatherPatient, 'patient.birthDate')),
        father_personalIDNummber: get(fatherExtra, 'personalIDNummber'),
        father_maritalStatus: get(fatherPatient, 'patient.maritalStatus'),
        father_marriageDate: new Date(get(fatherExtra, 'marriageDate')),
        father_nationality: get(fatherPatient, 'patient.nationality'),
        father_phone: get(fatherTelecom, 'phone'),
        father_email: get(fatherTelecom, 'email'),
        father_use: get(fatherTelecom, 'use'),
        father_addressLine1: fatherAddress.addressLine1,
        father_addressLine2: fatherAddress.addressLine2,
        father_addressLine3: fatherAddress.addressLine3,
        father_city: fatherAddress.city,
        father_county: fatherAddress.county,
        father_hospitalName: fatherAddress.hospitalName,
        father_postalCode: fatherAddress.postalCode,
        father_state: fatherAddress.state,

        father_religion: get(fatherExtra, 'religion'),
        father_formalEducation: get(fatherExtra, 'formalEducation'),
        father_occupation: get(fatherExtra, 'occupation'),
        father_employment: get(fatherExtra, 'employment'),
      };
    } else if (newDeclaration == true) {
      myInitialValues = {
        status: 'new',
        code: category.toLowerCase() + '-declaration',
      };
    }
    console.log('INITIAL VALUES: ' + JSON.stringify(myInitialValues));
    this.props.onFormUpdate(myInitialValues);
    
    return (
      <WorkingItemForm 
        newDeclaration={newDeclaration}
        selectedDeclaration={selectedDeclaration} 
      />
    );
  };
}

const mapStateToProps = ({ declarationsReducer, patientsReducer }) => {
  const {
    selectedDeclaration,
    newDeclaration,
    category,
  } = declarationsReducer;
  const {
    patients,
  } = patientsReducer;
  return {
    selectedDeclaration,
    newDeclaration,
    category,
    patients,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onFormUpdate: myInitialValues => {
      dispatch(initialize('activeDeclaration', myInitialValues));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkingItemCanvas);