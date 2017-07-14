/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:18:43 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-14 11:51:36
 */
import React from 'react';
import styles from './styles.css';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import Input from 'react-toolbox/lib/input';
import Dropdown from 'react-toolbox/lib/dropdown';
import DatePicker from 'react-toolbox/lib/date_picker';
import Collapsible from 'react-collapsible';
import { 
  genderReference,
  typesOfBirth,
  placesOfDeliveryReference,
  attendantsAtBirthReference,
  townsReference,
  districtsReference,
  regionsReference,
  maritalStatusesReference,
  educationsReference,
  occupationsReference,
  religionsReference,
  countriesReference,
  numbersReference,
  telecomReference,

 } from 'constants/reference';

class WorkingItemForm extends React.Component {
  constructor(props) {
    super(props);
  }

  

  render = () => {
    const renderInput = ({ input, label, type, icon, meta: { touched, error } }) => (
      <Input {...input} label={label} type={type} icon={icon} error={touched ? error : ''} />
    );
    const renderTextArea = ({ input, label, type, icon, meta: { touched, error } }) => (
      <Input {...input} label={label} multiline maxLength={200} type={type} icon={icon} error={touched ? error : ''} />
    );
    const renderDropdown = ({ input: { onBlur, ...inputForm }, label, source }) => (
      <Dropdown {...inputForm} label={label} source={source}  />
    );
    const renderDatePicker = ({ input: { onBlur, ...inputForm }, label, source }) => (
      <DatePicker {...inputForm} label={label} sundayFirstDayOfWeek />
    );

    const { 
      handleSubmit, 
      onSubmit,
    } = this.props;

    return (
      <form className={styles.declarationForm}>
        <Collapsible
          classParentString={styles.collapsibleParent}
          triggerClassName={styles.collapsibleClosed}
          triggerOpenedClassName={styles.collapsibleOpened}
          trigger="
            Particulars of child
          "
        >
          <Field component={renderInput} name="firstName" placeholder="First name" label="First name" required />
          <Field component={renderInput} name="middleName" placeholder="Middle name" label="Middle names" required />
          <Field component={renderInput} name="family" placeholder="Last name" label="Last name" required />
          <Field component={renderDropdown} name="gender" label="Gender" source={ genderReference } />
          <section>
            <Field component={renderDatePicker} name="birthDate" label="Date of birth" />
          </section>
          <Field component={renderInput} name="personalIDNummber" placeholder="Personal ID number" label="Personal ID Number" required />
          <Field component={renderDropdown} name="typeOfBirth" label="Type of birth" source={ typesOfBirth } />
          <Field component={renderDropdown} name="placeOfDelivery" label="Place of delivery" source={ placesOfDeliveryReference } />
          <Field component={renderDropdown} name="attendantAtBirth" label="Attendant at birth" source={ attendantsAtBirthReference } />
          
          <Field component={renderInput} name="hospitalName" placeholder="Hospital name" label="Hospital name" required />
          <Field component={renderInput} name="addressLine1" placeholder="Address line 1" label="Address line 1" required />
          <Field component={renderInput} name="addressLine2" placeholder="Address line 2" label="Address line 2" required />
          <Field component={renderInput} name="addressLine3" placeholder="Address line 3" label="Address line 3" required />
          <Field component={renderDropdown} name="city" label="City or town" source={ townsReference } />
          <Field component={renderDropdown} name="county" label="County or district" source={ districtsReference } />
          <Field component={renderInput} name="postalCode" placeholder="Postal code" label="Postal code" required />
          <Field component={renderDropdown} name="state" label="State or region" source={ regionsReference } />
        </Collapsible>
        <Collapsible
          classParentString={styles.collapsibleParent}
          triggerClassName={styles.collapsibleClosed}
          triggerOpenedClassName={styles.collapsibleOpened}
          trigger="
            Particulars of mother
          "
        >
          <Field component={renderInput} name="mother_firstName" placeholder="First name" label="First name" required />
          <Field component={renderInput} name="mother_middleName" placeholder="Middle name" label="Middle names" required />
          <Field component={renderInput} name="mother_family" placeholder="Last name" label="Last name" required />

          <Field component={renderInput} name="mother_maidenName" placeholder="Maiden name" label="Maiden name" required />

          <section>
            <Field component={renderDatePicker} name="mother_birthDate" label="Date of birth" />
          </section>
          <Field component={renderInput} name="mother_personalIDNummber" placeholder="Personal ID number" label="Personal ID Number" required />
          <Field component={renderDropdown} name="mother_maritalStatus" label="Marital status" source={ maritalStatusesReference } />
          <section>
            <Field component={renderDatePicker} name="mother_marriageDate" label="Date of marriage" />
          </section>
          <Field component={renderDropdown} name="mother_nationality" label="Nationality" source={ countriesReference } />
          <Field component={renderInput} name="mother_phone" placeholder="Mobile number" label="Mobile number" />
          <Field component={renderInput} name="mother_email" placeholder="Email address" label="Email address" />
          <Field component={renderDropdown} name="mother_use" label="Use" source={ telecomReference } />
          <Field component={renderInput} name="mother_addressLine1" placeholder="Address line 1" label="Address line 1" required />
          <Field component={renderInput} name="mother_addressLine2" placeholder="Address line 2" label="Address line 2" required />
          <Field component={renderInput} name="mother_addressLine3" placeholder="Address line 3" label="Address line 3" required />
          <Field component={renderDropdown} name="mother_city" label="City or town" source={ townsReference } />
          <Field component={renderDropdown} name="mother_county" label="County or district" source={ districtsReference } />
          <Field component={renderInput} name="mother_postalCode" placeholder="Postal code" label="Postal code" required />
          <Field component={renderDropdown} name="mother_state" label="State or region" source={ regionsReference } />
          
          <Field component={renderDropdown} name="childrenBornAlive" label="Number of children ever born alive (including this birth)" source={ numbersReference } />
          <Field component={renderDropdown} name="childrenBornLiving" label="Number of children born alive and now living" source={ numbersReference } />
          <Field component={renderDropdown} name="foetalDeaths" label="Foetal deaths to mother" source={ numbersReference } />
          <section>
            <Field component={renderDatePicker} name="birthDateLast" label="Date of last previous live birth" />
          </section>

          <Field component={renderDropdown} name="mother_religion" label="Religion" source={ religionsReference } />
          <Field component={renderDropdown} name="mother_formalEducation" label="Education" source={ educationsReference } />
          <Field component={renderDropdown} name="mother_employment" label="Employment status" source={ occupationsReference } />
          <Field component={renderInput} name="mother_occupation" placeholder="Occupation" label="Occupation" required />
         </Collapsible>
         <Collapsible
            classParentString={styles.collapsibleParent}
            triggerClassName={styles.collapsibleClosed}
            triggerOpenedClassName={styles.collapsibleOpened}
            trigger="
              Particulars of father
            "
          >
            <Field component={renderInput} name="father_firstName" placeholder="First name" label="First name" required />
            <Field component={renderInput} name="father_middleName" placeholder="Middle name" label="Middle names" required />
            <Field component={renderInput} name="father_family" placeholder="Last name" label="Last name" required />
            <section>
              <Field component={renderDatePicker} name="father_birthDate" label="Date of birth" />
            </section>
            <Field component={renderInput} name="father_personalIDNummber" placeholder="Personal ID number" label="Personal ID Number" required />
            <Field component={renderDropdown} name="father_maritalStatus" label="Marital status" source={ maritalStatusesReference } />
            <section>
              <Field component={renderDatePicker} name="father_marriageDate" label="Date of marriage" />
            </section>
            <Field component={renderDropdown} name="father_nationality" label="Nationality" source={ countriesReference } />
            <Field component={renderInput} name="father_phone" placeholder="Mobile number" label="Mobile number" />
            <Field component={renderInput} name="father_email" placeholder="Email address" label="Email address" />
            <Field component={renderDropdown} name="father_use" label="Use" source={ telecomReference } />
            <Field component={renderInput} name="father_addressLine1" placeholder="Address line 1" label="Address line 1" required />
            <Field component={renderInput} name="father_addressLine2" placeholder="Address line 2" label="Address line 2" required />
            <Field component={renderInput} name="father_addressLine3" placeholder="Address line 3" label="Address line 3" required />
            <Field component={renderDropdown} name="father_city" label="City or town" source={ townsReference } />
            <Field component={renderDropdown} name="father_county" label="County or district" source={ districtsReference } />
            <Field component={renderInput} name="father_postalCode" placeholder="Postal code" label="Postal code" required />
            <Field component={renderDropdown} name="father_state" label="State or region" source={ regionsReference } />
            <Field component={renderDropdown} name="father_religion" label="Religion" source={ religionsReference } />
            <Field component={renderDropdown} name="father_formalEducation" label="Education" source={ educationsReference } />
            <Field component={renderDropdown} name="father_employment" label="Employment" source={ occupationsReference } />
            <Field component={renderInput} name="father_occupation" placeholder="Occupation" label="Occupation" required />
          </Collapsible>
          <Collapsible
            classParentString={styles.collapsibleParent}
            triggerClassName={styles.collapsibleClosed}
            triggerOpenedClassName={styles.collapsibleOpened}
            trigger="
              Notes
            "
          >
            <Field component={renderTextArea} name="notes" type="text" placeholder="Notes" label="Notes" />
        </Collapsible>
      </form>
    );
  };
}

export default reduxForm({
  form: 'activeDeclaration',
})(WorkingItemForm);