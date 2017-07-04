import React from 'react';
import styles from './styles.css';
import Input from 'react-toolbox/lib/input';
import Dropdown from 'react-toolbox/lib/dropdown';
import { RadioGroup, RadioButton } from 'react-toolbox/lib/radio';
import DatePicker from 'react-toolbox/lib/date_picker';
import Collapsible from 'react-collapsible';
import Switch from 'react-toolbox/lib/switch';
import {connect} from 'react-redux';

const datetime = new Date(2015, 10, 16);
//const min_datetime = new Date(new Date(datetime).setDate(8));
datetime.setHours(17);
datetime.setMinutes(28);

const gender = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const placesOfDelivery = [
  { value: 'place1', label: 'Place 1' },
  { value: 'place2', label: 'Place 2' },
];

const attendantsAtBirth = [
  { value: 'attendant1', label: 'Attendant 1' },
  { value: 'attendant2', label: 'Attendant 2' },
];

const towns = [{ value: 'town1', label: 'Town 1' }];

const districts = [
  { value: 'district1', label: 'District 1' },
  { value: 'Ketu Ketu North' },
  { value: 'Adaklu District', label: 'Adaklu District' },
  { value: 'Afadjato South District', label: 'Afadjato South District' },
  { value: 'Agotime Ziope District', label: 'Agotime Ziope District' },
  { value: 'Akatsi North District', label: 'Akatsi North District' },
  { value: 'Akatsi South District', label: 'Akatsi South District' },
  { value: 'Biakoye District', label: 'Biakoye District' },
  { value: 'Central Tongu District', label: 'Central Tongu District' },
  { value: 'Ho Municipal District', label: 'Ho Municipal District' },
  { value: 'Ho West District', label: 'Ho West District' },
  { value: 'Hohoe Municipal District', label: 'Hohoe Municipal District' },
  { value: 'Jasikan District', label: 'Jasikan District' },
  { value: 'Kadjebi District', label: 'Kadjebi District' },
  { value: 'Keta Municipal District', label: 'Keta Municipal District' },
  { value: 'Ketu North District', label: 'Ketu North District' },
  {
    value: 'Ketu South Municipal District',
    label: 'Ketu South Municipal District',
  },
  { value: 'Kpando Municipal District', label: 'Kpando Municipal District' },
  { value: 'Krachi East District', label: 'Krachi East District' },
  { value: 'Krachi Nchumuru District', label: 'Krachi Nchumuru District' },
  { value: 'Krachi West District', label: 'Krachi West District' },
  { value: 'Nkwanta North District', label: 'Nkwanta North District' },
  { value: 'Nkwanta South District', label: 'Nkwanta South District' },
  { value: 'North Dayi District', label: 'North Dayi District' },
  { value: 'North Tongu District', label: 'North Tongu District' },
  { value: 'South Dayi District', label: 'South Dayi District' },
  { value: 'South Tongu District', label: 'South Tongu District' },
];

const regions = [{ value: 'region1', label: 'Region 1' }];

const maritalStatuses = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
];

const educations = [
  { value: 'elementary', label: 'Elementary School' },
  { value: 'high', label: 'High School' },
  { value: 'university', label: 'University' },
];

const occupations = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'builder', label: 'Builder' },
  { value: 'other', label: 'Other' },
];

const religions = [
  { value: 'muslim', label: 'Muslim' },
  { value: 'christian', label: 'Christian' },
  { value: 'jewish', label: 'Jewish' },
];

const countries = [
  { value: 'Afghanistan', label: 'Afghanistan' },
  { value: 'Albania', label: 'Albania' },
  { value: 'Algeria', label: 'Algeria' },
  { value: 'Andorra', label: 'Andorra' },
  { value: 'Angola', label: 'Angola' },
  { value: 'Anguilla', label: 'Anguilla' },
  { value: 'Antigua Barbuda', label: 'Antigua &amp; Barbuda' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Armenia', label: 'Armenia' },
  { value: 'Aruba', label: 'Aruba' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Azerbaijan', label: 'Azerbaijan' },
  { value: 'Bahamas', label: 'Bahamas' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Barbados', label: 'Barbados' },
  { value: 'Belarus', label: 'Belarus' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Belize', label: 'Belize' },
  { value: 'Benin', label: 'Benin' },
  { value: 'Bermuda', label: 'Bermuda' },
  { value: 'Bhutan', label: 'Bhutan' },
  { value: 'Bolivia', label: 'Bolivia' },
  { value: 'Bosnia Herzegovina', label: 'Bosnia &amp; Herzegovina' },
  { value: 'Botswana', label: 'Botswana' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'British Virgin Islands', label: 'British Virgin Islands' },
  { value: 'Brunei', label: 'Brunei' },
  { value: 'Bulgaria', label: 'Bulgaria' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'Cambodia', label: 'Cambodia' },
  { value: 'Cameroon', label: 'Cameroon' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Cape Verde', label: 'Cape Verde' },
  { value: 'Cayman Islands', label: 'Cayman Islands' },
  { value: 'Chad', label: 'Chad' },
  { value: 'Chile', label: 'Chile' },
  { value: 'China', label: 'China' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Congo', label: 'Congo' },
  { value: 'Cook Islands', label: 'Cook Islands' },
  { value: 'Costa Rica', label: 'Costa Rica' },
  { value: 'Cote D Ivoire', label: 'Cote D Ivoire' },
  { value: 'Croatia', label: 'Croatia' },
  { value: 'Cruise Ship', label: 'Cruise Ship' },
  { value: 'Cuba', label: 'Cuba' },
  { value: 'Cyprus', label: 'Cyprus' },
  { value: 'Czech Republic', label: 'Czech Republic' },
  {
    value: 'Democratic Republic Of Congo',
    label: 'Democratic Republic Of Congo',
  },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Djibouti', label: 'Djibouti' },
  { value: 'Dominica', label: 'Dominica' },
  { value: 'Dominican Republic', label: 'Dominican Republic' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'El Salvador', label: 'El Salvador' },
  { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
  { value: 'Estonia', label: 'Estonia' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Falkland Islands', label: 'Falkland Islands' },
  { value: 'Faroe Islands', label: 'Faroe Islands' },
  { value: 'Fiji', label: 'Fiji' },
  { value: 'Finland', label: 'Finland' },
  { value: 'France', label: 'France' },
  { value: 'French Polynesia', label: 'French Polynesia' },
  { value: 'French West Indies', label: 'French West Indies' },
  { value: 'Gabon', label: 'Gabon' },
  { value: 'Gambia', label: 'Gambia' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Gibraltar', label: 'Gibraltar' },
  { value: 'Greece', label: 'Greece' },
  { value: 'Greenland', label: 'Greenland' },
  { value: 'Grenada', label: 'Grenada' },
  { value: 'Guam', label: 'Guam' },
  { value: 'Guatemala', label: 'Guatemala' },
  { value: 'Guernsey', label: 'Guernsey' },
  { value: 'Guinea', label: 'Guinea' },
  { value: 'Guinea Bissau', label: 'Guinea Bissau' },
  { value: 'Guyana', label: 'Guyana' },
  { value: 'Haiti', label: 'Haiti' },
  { value: 'Honduras', label: 'Honduras' },
  { value: 'Hong Kong', label: 'Hong Kong' },
  { value: 'Hungary', label: 'Hungary' },
  { value: 'Iceland', label: 'Iceland' },
  { value: 'India', label: 'India' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Iran', label: 'Iran' },
  { value: 'Iraq', label: 'Iraq' },
  { value: 'Ireland', label: 'Ireland' },
  { value: 'Isle of Man', label: 'Isle of Man' },
  { value: 'Israel', label: 'Israel' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Jamaica', label: 'Jamaica' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Jersey', label: 'Jersey' },
  { value: 'Jordan', label: 'Jordan' },
  { value: 'Kazakhstan', label: 'Kazakhstan' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Kyrgyz Republic', label: 'Kyrgyz Republic' },
  { value: 'Laos', label: 'Laos' },
  { value: 'Latvia', label: 'Latvia' },
  { value: 'Lebanon', label: 'Lebanon' },
  { value: 'Lesotho', label: 'Lesotho' },
  { value: 'Liberia', label: 'Liberia' },
  { value: 'Libya', label: 'Libya' },
  { value: 'Liechtenstein', label: 'Liechtenstein' },
  { value: 'Lithuania', label: 'Lithuania' },
  { value: 'Luxembourg', label: 'Luxembourg' },
  { value: 'Macau', label: 'Macau' },
  { value: 'Macedonia', label: 'Macedonia' },
  { value: 'Madagascar', label: 'Madagascar' },
  { value: 'Malawi', label: 'Malawi' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Maldives', label: 'Maldives' },
  { value: 'Mali', label: 'Mali' },
  { value: 'Malta', label: 'Malta' },
  { value: 'Mauritania', label: 'Mauritania' },
  { value: 'Mauritius', label: 'Mauritius' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Moldova', label: 'Moldova' },
  { value: 'Monaco', label: 'Monaco' },
  { value: 'Mongolia', label: 'Mongolia' },
  { value: 'Montenegro', label: 'Montenegro' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'Mozambique', label: 'Mozambique' },
  { value: 'Namibia', label: 'Namibia' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Netherlands Antilles', label: 'Netherlands Antilles' },
  { value: 'New Caledonia', label: 'New Caledonia' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Nicaragua', label: 'Nicaragua' },
  { value: 'Niger', label: 'Niger' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'North Korea', label: 'North Korea' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Palestine', label: 'Palestine' },
  { value: 'Panama', label: 'Panama' },
  { value: 'Papua New Guinea', label: 'Papua New Guinea' },
  { value: 'Paraguay', label: 'Paraguay' },
  { value: 'Peru', label: 'Peru' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Puerto Rico', label: 'Puerto Rico' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Reunion', label: 'Reunion' },
  { value: 'Romania', label: 'Romania' },
  { value: 'Russia', label: 'Russia' },
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'Saint Pierre Miquelon', label: 'Saint Pierre &amp; Miquelon' },
  { value: 'Samoa', label: 'Samoa' },
  { value: 'San Marino', label: 'San Marino' },
  { value: 'Satellite', label: 'Satellite' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Senegal', label: 'Senegal' },
  { value: 'Serbia', label: 'Serbia' },
  { value: 'Seychelles', label: 'Seychelles' },
  { value: 'Sierra Leone', label: 'Sierra Leone' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Slovakia', label: 'Slovakia' },
  { value: 'Slovenia', label: 'Slovenia' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'St Kitts', label: 'St Kitts &amp; Nevis' },
  { value: 'St Vincent', label: 'St Vincent' },
  { value: 'St.Lucia', label: 'St. Lucia' },
  { value: 'Sudan', label: 'Sudan' },
  { value: 'Suriname', label: 'Suriname' },
  { value: 'Swaziland', label: 'Swaziland' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Syria', label: 'Syria' },
  { value: 'Taiwan', label: 'Taiwan' },
  { value: 'Tajikistan', label: 'Tajikistan' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'East Timor', label: "Timor L'Este" },
  { value: 'Togo', label: 'Togo' },
  { value: 'Tonga', label: 'Tonga' },
  { value: 'TrinidadTobago', label: 'Trinidad &amp; Tobago' },
  { value: 'Tunisia', label: 'Tunisia' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Turkmenistan', label: 'Turkmenistan' },
  { value: 'Turks/Caicos', label: 'Turks &amp; Caicos' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Ukraine', label: 'Ukraine' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United States', label: 'United States' },
  { value: 'Uruguay', label: 'Uruguay' },
  { value: 'Uzbekistan', label: 'Uzbekistan' },
  { value: 'Venezuela', label: 'Venezuela' },
  { value: 'Vietnam', label: 'Vietnam' },
  { value: 'Virgin Islands (US)', label: 'Virgin Islands (US)' },
  { value: 'Yemen', label: 'Yemen' },
  { value: 'Zambia', label: 'Zambia' },
  { value: 'Zimbabwe', label: 'Zimbabwe' },
];

const years = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
  { value: '16', label: '16' },
  { value: '17', label: '17' },
  { value: '18', label: '18' },
  { value: '19', label: '19' },
  { value: '20', label: '20' },
  { value: '21', label: '21' },
  { value: '22', label: '22' },
  { value: '23', label: '23' },
  { value: '24', label: '24' },
  { value: '25', label: '25' },
  { value: '26', label: '26' },
  { value: '27', label: '27' },
  { value: '28', label: '28' },
  { value: '29', label: '29' },
  { value: '30', label: '30' },
  { value: '31', label: '31' },
  { value: '32', label: '32' },
  { value: '33', label: '33' },
  { value: '34', label: '34' },
  { value: '35', label: '35' },
  { value: '36', label: '36' },
  { value: '37', label: '37' },
  { value: '38', label: '38' },
  { value: '39', label: '39' },
  { value: '40', label: '40' },
];

class WorkingItemForm extends React.Component {
  constructor(props) {
    super(props);
  }

  handleContinue = event => {};

  handleChange = (name, value) => {
    this.setState({ ...this.state, [name]: value });
  };

  render = () => {
    const { selectedDeclaration } = this.props;
    selectedDeclaration ? this.state = selectedDeclaration :

    this.state = {
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      personalIDNummber: '',
      gender: '',
      typeOfBirth: '',
      placeOfDelivery: '',
      attendantAtBirth: '',
      hospitalName: '',
      streetNumber: '',
      addressLine1: '',
      addressLine2: '',
      town: '',
      district: '',
      region: '',
      zip: '',
      notes: '',

      mother_personalIDNummber: '',
      mother_firstName: '',
      mother_middleName: '',
      mother_maidenName: '',
      mother_dob: '',
      mother_maritalStatus: '',
      mother_doMarriage: '',
      mother_durationOfMarriage: '',
      mother_nationality: '',
      mother_mobileNumber: '',
      mother_emailAddress: '',
      mother_streetNumber: '',
      mother_houseName: '',
      mother_addressLine1: '',
      mother_addressLine2: '',
      mother_town: '',
      mother_district: '',
      mother_region: '',
      mother_zip: '',
      mother_childrenBornAlive: '',
      mother_childrenBornLiving: '',
      mother_foetalDeaths: '',
      mother_dobLastPreviousBirth: '',
      mother_formalEducation: '',
      mother_occupation: '',
      mother_religion: '',
      mother_gainfulEmployment: false,

      father_personalIDNummber: '',
      father_firstName: '',
      father_middleName: '',
      father_lastName: '',
      father_dob: '',
      father_maritalStatus: '',
      father_doMarriage: '',
      father_durationOfMarriage: '',
      father_nationality: '',
      father_mobileNumber: '',
      father_emailAddress: '',
      father_streetNumber: '',
      father_houseName: '',
      father_addressLine1: '',
      father_addressLine2: '',
      father_town: '',
      father_district: '',
      father_region: '',
      father_zip: '',
      father_formalEducation: '',
      father_occupation: '',
      father_religion: '',
      father_gainfulEmployment: false,

      informant_personalIDNummber: '',
      informant_firstName: '',
      informant_middleName: '',
      informant_lastName: '',
      informant_relationship: '',
      informant_mobileNumber: '',
      informant_emailAddress: '',
      informant_streetNumber: '',
      informant_houseName: '',
      informant_addressLine1: '',
      informant_addressLine2: '',
      informant_town: '',
      informant_district: '',
      informant_region: '',
      informant_zip: '',
    };
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
          <Input
            type="text"
            label="First Name"
            name="firstName"
            required
            value={this.state.firstName}
            onChange={this.handleChange.bind(this, 'firstName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Middle Name"
            name="middleName"
            required
            value={this.state.middleName}
            onChange={this.handleChange.bind(this, 'middleName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Last Name"
            name="lastName"
            required
            value={this.state.lastName}
            onChange={this.handleChange.bind(this, 'lastName')}
            maxLength={16}
          />
          <p>Gender</p>
          <Dropdown
            onChange={this.handleChange.bind(this, 'gender')}
            source={gender}
            value={this.state.gender}
          />
          <section>
            <DatePicker
              label="Date of birth"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'dob')}
              value={this.state.dob}
            />
          </section>
          <Input
            type="text"
            label="Personal ID Number"
            name="personalIDNummber"
            value={this.state.personalIDNummber}
            onChange={this.handleChange.bind(this, 'personalIDNummber')}
            maxLength={16}
          />
          <p>Select type of birth</p>
          <RadioGroup
            name="typeOfBirth"
            value={this.state.typeOfBirth}
            onChange={this.handleChange.bind(this, 'typeOfBirth')}
          >
            <RadioButton label="Single" value="single" />
            <RadioButton label="Twin" value="twin" />
            <RadioButton label="Triplet" value="triplet" />
            <RadioButton label="Other" value="other" />
          </RadioGroup>
          <p>Place of delivery</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'placeOfDelivery')}
            source={placesOfDelivery}
            value={this.state.placeOfDelivery}
          />
          <p>Attendant at delivery</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'attendantAtBirth')}
            source={attendantsAtBirth}
            value={this.state.attendantAtBirth}
          />
          <Input
            type="text"
            multiline
            label="Name of Hospital / Clinic/ Maternity home"
            maxLength={20}
            value={this.state.hospitalName}
            onChange={this.handleChange.bind(this, 'hospitalName')}
          />
          <Input
            type="text"
            label="Street number"
            name="streetNumber"
            required
            value={this.state.streetNumber}
            onChange={this.handleChange.bind(this, 'streetNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Address Line 1"
            name="addressLine1"
            required
            value={this.state.addressLine1}
            onChange={this.handleChange.bind(this, 'addressLine1')}
            maxLength={40}
          />
          <Input
            type="text"
            label="Address Line 2"
            name="addressLine2"
            required
            value={this.state.addressLine2}
            onChange={this.handleChange.bind(this, 'addressLine2')}
            maxLength={40}
          />
          <p>Region</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'region')}
            source={regions}
            value={this.state.region}
          />
          <p>District</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'district')}
            source={districts}
            value={this.state.district}
          />
          <p>Town</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'town')}
            source={towns}
            value={this.state.town}
          />
          <Input
            type="text"
            label="Zip / Postal code"
            name="zip"
            value={this.state.zip}
            onChange={this.handleChange.bind(this, 'zip')}
            maxLength={40}
          />
        </Collapsible>
        <Collapsible
          classParentString={styles.collapsibleParent}
          triggerClassName={styles.collapsibleClosed}
          triggerOpenedClassName={styles.collapsibleOpened}
          trigger="
            Particulars of mother
          "
        >
          <Input
            type="text"
            label="Personal ID Number"
            name="mother_personalIDNummber"
            value={this.state.mother_personalIDNummber}
            onChange={this.handleChange.bind(this, 'mother_personalIDNummber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="First Name"
            name="mother_firstName"
            required
            value={this.state.mother_firstName}
            onChange={this.handleChange.bind(this, 'mother_firstName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Middle Name"
            name="mother_middleName"
            required
            value={this.state.mother_middleName}
            onChange={this.handleChange.bind(this, 'mother_middleName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Maiden Name"
            name="mother_maidenName"
            required
            value={this.state.mother_maidenName}
            onChange={this.handleChange.bind(this, 'mother_maidenName')}
            maxLength={16}
          />
          <section>
            <DatePicker
              label="Date of birth"
              name="mother_dob"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'mother_dob')}
              value={this.state.mother_dob}
            />
          </section>
          <p>Marital status</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_maritalStatus')}
            source={maritalStatuses}
            value={this.state.mother_maritalStatus}
          />
          <section>
            <DatePicker
              label="Date of marriage"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'mother_doMarriage')}
              value={this.state.mother_doMarriage}
            />
          </section>
          <p>Duration of marriage</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_durationOfMarriage')}
            source={years}
            value={this.state.mother_durationOfMarriage}
          />
          <p>Nationality</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_nationality')}
            source={countries}
            value={this.state.mother_nationality}
          />
          <Input
            type="text"
            label="Mobile number"
            name="mobileNumber"
            required
            value={this.state.mother_mobileNumber}
            onChange={this.handleChange.bind(this, 'mother_mobileNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Email address"
            name="emailAddress"
            required
            value={this.state.mother_emailAddress}
            onChange={this.handleChange.bind(this, 'mother_emailAddress')}
            maxLength={16}
          />
          <p>Address</p>

          <Input
            type="text"
            label="Street number"
            name="StreetNumber"
            value={this.state.mother_streetNumber}
            onChange={this.handleChange.bind(this, 'mother_streetNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="House number"
            name="houseName"
            value={this.state.mother_houseName}
            onChange={this.handleChange.bind(this, 'mother_houseName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Address Line 1"
            name="addressLine1"
            required
            value={this.state.mother_addressLine1}
            onChange={this.handleChange.bind(this, 'mother_addressLine1')}
            maxLength={40}
          />
          <Input
            type="text"
            label="Address Line 2"
            name="addressLine2"
            required
            value={this.state.mother_addressLine2}
            onChange={this.handleChange.bind(this, 'mother_addressLine2')}
            maxLength={40}
          />
          <p>Region</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_region')}
            source={regions}
            value={this.state.mother_region}
          />
          <p>District</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_district')}
            source={districts}
            value={this.state.mother_district}
          />
          <p>Town</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_town')}
            source={towns}
            value={this.state.mother_town}
          />
          <Input
            type="text"
            label="Zip / Postal code"
            name="zip"
            value={this.state.mother_zip}
            onChange={this.handleChange.bind(this, 'mother_zip')}
            maxLength={40}
          />
          <p>Number of children ever born alive (including this birth)</p>
          <Input
            type="text"
            label="No. of children"
            name="childrenBornAlive"
            value={this.state.mother_childrenBornAlive}
            onChange={this.handleChange.bind(this, 'mother_childrenBornAlive')}
            maxLength={2}
          />
          <p>Number of children born alive and now living</p>
          <Input
            type="text"
            label="No. of children"
            name="childrenBornLiving"
            value={this.state.mother_childrenBornLiving}
            onChange={this.handleChange.bind(this, 'mother_childrenBornLiving')}
            maxLength={2}
          />
          <p>Foetal deaths to mother</p>
          <Input
            type="text"
            label="No. of foetal deaths"
            name="foetalDeaths"
            value={this.state.mother_foetalDeaths}
            onChange={this.handleChange.bind(this, 'mother_foetalDeaths')}
            maxLength={2}
          />
          <p>Date of last previous live birth</p>
          <section>
            <DatePicker
              label="Date of birth"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(
                this,
                'mother_dobLastPreviousBirth'
              )}
              value={this.state.mother_dobLastPreviousBirth}
            />
          </section>
          <p>Formal education</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_formalEducation')}
            source={educations}
            value={this.state.mother_formalEducation}
          />
          <p>Occupation</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_occupation')}
            source={occupations}
            value={this.state.mother_occupation}
          />
          <p>Religion</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother_religion')}
            source={religions}
            value={this.state.mother_religion}
          />
          <p>In gainful employment</p>
          <Switch
            checked={this.state.mother_gainfulEmployment}
            label="In gainful employment"
            onChange={this.handleChange.bind(this, 'mother_gainfulEmployment')}
          />
        </Collapsible>

        <Collapsible
          classParentString={styles.collapsibleParent}
          triggerClassName={styles.collapsibleClosed}
          triggerOpenedClassName={styles.collapsibleOpened}
          trigger="
            Particulars of father
          "
        >
          <Input
            type="text"
            label="Personal ID Number"
            name="father_personalIDNummber"
            value={this.state.father_personalIDNummber}
            onChange={this.handleChange.bind(this, 'father_personalIDNummber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="First Name"
            name="father_firstName"
            required
            value={this.state.father_firstName}
            onChange={this.handleChange.bind(this, 'father_firstName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Middle Name"
            name="father_middleName"
            required
            value={this.state.father_middleName}
            onChange={this.handleChange.bind(this, 'father_middleName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Last Name"
            name="father_lastName"
            required
            value={this.state.father_lastName}
            onChange={this.handleChange.bind(this, 'father_lastName')}
            maxLength={16}
          />
          <section>
            <DatePicker
              label="Date of birth"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'father_dob')}
              value={this.state.father_dob}
            />
          </section>
          <p>Marital status</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_maritalStatus')}
            source={maritalStatuses}
            value={this.state.father_maritalStatus}
          />
          <section>
            <DatePicker
              label="Date of marriage"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'father_doMarriage')}
              value={this.state.father_doMarriage}
            />
          </section>
          <p>Duration of marriage</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_durationOfMarriage')}
            source={years}
            value={this.state.father_durationOfMarriage}
          />
          <p>Nationality</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_nationality')}
            source={countries}
            value={this.state.father_nationality}
          />
          <Input
            type="text"
            label="Mobile number"
            name="mobileNumber"
            required
            value={this.state.father_mobileNumber}
            onChange={this.handleChange.bind(this, 'father_mobileNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Email address"
            name="emailAddress"
            required
            value={this.state.father_emailAddress}
            onChange={this.handleChange.bind(this, 'father_emailAddress')}
            maxLength={16}
          />
          <p>Address</p>

          <Input
            type="text"
            label="Street number"
            name="StreetNumber"
            value={this.state.father_streetNumber}
            onChange={this.handleChange.bind(this, 'father_streetNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="House number"
            name="HouseNumber"
            value={this.state.father_houseNumber}
            onChange={this.handleChange.bind(this, 'father_houseNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Address Line 1"
            name="addressLine1"
            required
            value={this.state.father_addressLine1}
            onChange={this.handleChange.bind(this, 'father_addressLine1')}
            maxLength={40}
          />
          <Input
            type="text"
            label="Address Line 2"
            name="addressLine2"
            required
            value={this.state.father_addressLine2}
            onChange={this.handleChange.bind(this, 'father_addressLine2')}
            maxLength={40}
          />
          <p>Region</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_region')}
            source={regions}
            value={this.state.father_region}
          />
          <p>District</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_district')}
            source={districts}
            value={this.state.father_district}
          />
          <p>Town</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_town')}
            source={towns}
            value={this.state.father_town}
          />
          <Input
            type="text"
            label="Zip / Postal code"
            name="zip"
            value={this.state.father_zip}
            onChange={this.handleChange.bind(this, 'father_zip')}
            maxLength={40}
          />
          <p>Formal education</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_formalEducation')}
            source={educations}
            value={this.state.father_formalEducation}
          />
          <p>Occupation</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_occupation')}
            source={occupations}
            value={this.state.father_occupation}
          />
          <p>Religion</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'father_religion')}
            source={religions}
            value={this.state.father_religion}
          />
          <p>In gainful employment</p>
          <Switch
            checked={this.state.father_gainfulEmployment}
            label="In gainful employment"
            onChange={this.handleChange.bind(this, 'father_gainfulEmployment')}
          />
        </Collapsible>
        <Collapsible
          classParentString={styles.collapsibleParent}
          triggerClassName={styles.collapsibleClosed}
          triggerOpenedClassName={styles.collapsibleOpened}
          trigger="
            Particulars of informant
          "
        >
          <Input
            type="text"
            label="Personal ID Number"
            name="informant_personalIDNummber"
            value={this.state.informant_personalIDNummber}
            onChange={this.handleChange.bind(
              this,
              'informant_personalIDNummber'
            )}
            maxLength={16}
          />
          <Input
            type="text"
            label="First Name"
            name="informant_firstName"
            required
            value={this.state.informant_firstName}
            onChange={this.handleChange.bind(this, 'informant_firstName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Middle Name"
            name="informant_middleName"
            required
            value={this.state.informant_middleName}
            onChange={this.handleChange.bind(this, 'informant_middleName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Last Name"
            name="informant_lastName"
            required
            value={this.state.informant_lastName}
            onChange={this.handleChange.bind(this, 'informant_lastName')}
            maxLength={16}
          />
          <p>Relationship</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'informant_relationship')}
            source={religions}
            value={this.state.informant_relationship}
          />
          <Input
            type="text"
            label="Mobile number"
            name="mobileNumber"
            required
            value={this.state.informant_mobileNumber}
            onChange={this.handleChange.bind(this, 'informant_mobileNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Email address"
            name="emailAddress"
            required
            value={this.state.informant_emailAddress}
            onChange={this.handleChange.bind(this, 'informant_emailAddress')}
            maxLength={16}
          />
          <p>Address</p>

          <Input
            type="text"
            label="Street number"
            name="StreetNumber"
            value={this.state.informant_streetNumber}
            onChange={this.handleChange.bind(this, 'informant_streetNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="House number"
            name="HouseNumber"
            value={this.state.informant_houseNumber}
            onChange={this.handleChange.bind(this, 'informant_houseNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Address Line 1"
            name="addressLine1"
            required
            value={this.state.informant_addressLine1}
            onChange={this.handleChange.bind(this, 'informant_addressLine1')}
            maxLength={40}
          />
          <Input
            type="text"
            label="Address Line 2"
            name="addressLine2"
            required
            value={this.state.informant_addressLine2}
            onChange={this.handleChange.bind(this, 'informant_addressLine2')}
            maxLength={40}
          />
          <p>Region</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'informant_region')}
            source={regions}
            value={this.state.informant_region}
          />
          <p>District</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'informant_district')}
            source={districts}
            value={this.state.informant_district}
          />
          <p>Town</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'informant_town')}
            source={towns}
            value={this.state.informant_town}
          />
          <Input
            type="text"
            label="Zip / Postal code"
            name="zip"
            value={this.state.informant_zip}
            onChange={this.handleChange.bind(this, 'informant_zip')}
            maxLength={40}
          />
        </Collapsible>
        <Collapsible
          classParentString={styles.collapsibleParent}
          triggerClassName={styles.collapsibleClosed}
          triggerOpenedClassName={styles.collapsibleOpened}
          trigger="
            Notes
          "
        >
          <Input
            type="text"
            multiline
            label="Notes"
            maxLength={200}
            value={this.state.notes}
            onChange={this.handleChange.bind(this, 'notes')}
          />
        </Collapsible>
      </form>
    );
  };
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
)(WorkingItemForm);

