import React from 'react';
import styles from './styles.css';
import Input from 'react-toolbox/lib/input';
import Dropdown from 'react-toolbox/lib/dropdown';
import { RadioGroup, RadioButton } from 'react-toolbox/lib/radio';
import DatePicker from 'react-toolbox/lib/date_picker';

const datetime = new Date(2015, 10, 16);
const min_datetime = new Date(new Date(datetime).setDate(8));
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
      placeOfBirthStreetNumber: '',
      addressLine1: '',
      addressLine2: '',
      town: '',
      district: '',
      zip: '',
      mother: {
        personalIDNummber: '',
        firstName: '',
        middleName: '',
        maidenName: '',
        dob: '',
        maritalStatus: '',
        doMarriage: '',
        durationOfMarriage: '',
        nationality: '',
        mobileNumber: '',
        emailAddress: '',
        streetNumber: '',
        houseNumber: '',
        addressLine1: '',
        addressLine2: '',
        town: '',
        district: '',
        zip: '',
      },
    };
  }

  handleContinue = event => {};

  handleChange = (name, value) => {
    this.setState({ ...this.formData, [name]: value });
  };

  render = () => {
    const { errorMessage } = this.props;

    return (
      <form className={styles.declarationForm}>
        <div className={styles.formSection}>
          <h2 className="content-subhead">
            Particulars of child
          </h2>
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
            auto
            onChange={this.handleChange.bind(this, 'gender')}
            source={gender}
            value={this.state.gender}
          />
          <section>
            <DatePicker
              label="Date of birth"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'dob')}
              value={this.state.date1}
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
            onChange={this.handleChange.bind(this, 'typeOfBirth')}>
            <RadioButton label="Single" value="single" />
            <RadioButton label="Twin" value="twin" disabled />
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
        </div>
        <div className={styles.formSection}>
          <h2 className="content-subhead">
            Detailed address of place of delivery
          </h2>
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
            name="placeOfBirthStreetNumber"
            required
            value={this.state.placeOfBirthStreetNumber}
            onChange={this.handleChange.bind(this, 'placeOfBirthStreetNumber')}
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
        </div>
        <div className={styles.formSection}>
          <h2 className="content-subhead">
            Particulars of mother
          </h2>
          <Input
            type="text"
            label="Personal ID Number"
            name="mother.personalIDNummber"
            value={this.state.mother.personalIDNummber}
            onChange={this.handleChange.bind(this, 'mother.personalIDNummber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="First Name"
            name="mother.firstName"
            required
            value={this.state.mother.firstName}
            onChange={this.handleChange.bind(this, 'mother.firstName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Middle Name"
            name="mother.middleName"
            required
            value={this.state.mother.middleName}
            onChange={this.handleChange.bind(this, 'mother.middleName')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Maiden Name"
            name="mother.maidenName"
            required
            value={this.state.mother.maidenName}
            onChange={this.handleChange.bind(this, 'mother.maidenName')}
            maxLength={16}
          />
          <section>
            <DatePicker
              label="Date of birth"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'mother.dob')}
              value={this.state.mother.dob}
            />
          </section>
          <p>Marital status</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother.maritalStatus')}
            source={maritalStatuses}
            value={this.state.mother.maritalStatus}
          />
          <section>
            <DatePicker
              label="Date of marriage"
              sundayFirstDayOfWeek
              onChange={this.handleChange.bind(this, 'mother.doMarriage')}
              value={this.state.mother.doMarriage}
            />
          </section>
          <p>Duration of marriage</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother.durationOfMarriage')}
            source={years}
            value={this.state.mother.durationOfMarriage}
          />
          <p>Nationality</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother.nationality')}
            source={countries}
            value={this.state.mother.nationality}
          />
          <Input
            type="text"
            label="Mobile number"
            name="mobileNumber"
            required
            value={this.state.mother.mobileNumber}
            onChange={this.handleChange.bind(this, 'mother.mobileNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Email address"
            name="emailAddress"
            required
            value={this.state.mother.emailAddress}
            onChange={this.handleChange.bind(this, 'mother.emailAddress')}
            maxLength={16}
          />
          <p>Address</p>

          <Input
            type="text"
            label="Street number"
            name="StreetNumber"
            value={this.state.mother.placeOfBirthStreetNumber}
            onChange={this.handleChange.bind(this, 'mother.streetNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="House number"
            name="HouseNumber"
            value={this.state.mother.placeOfBirthHouseNumber}
            onChange={this.handleChange.bind(this, 'mother.houseNumber')}
            maxLength={16}
          />
          <Input
            type="text"
            label="Address Line 1"
            name="addressLine1"
            required
            value={this.state.mother.addressLine1}
            onChange={this.handleChange.bind(this, 'mother.addressLine1')}
            maxLength={40}
          />
          <Input
            type="text"
            label="Address Line 2"
            name="addressLine2"
            required
            value={this.state.mother.addressLine2}
            onChange={this.handleChange.bind(this, 'mother.addressLine2')}
            maxLength={40}
          />
          <p>Region</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother.region')}
            source={regions}
            value={this.state.mother.region}
          />
          <p>District</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother.district')}
            source={districts}
            value={this.state.mother.district}
          />
          <p>Town</p>
          <Dropdown
            auto
            onChange={this.handleChange.bind(this, 'mother.town')}
            source={towns}
            value={this.state.mother.town}
          />
          <Input
            type="text"
            label="Zip / Postal code"
            name="zip"
            value={this.state.mother.zip}
            onChange={this.handleChange.bind(this, 'mother.zip')}
            maxLength={40}
          />
          <RadioGroup
            name="typeOfBirth"
            value={this.state.typeOfBirth}
            onChange={this.handleChange.bind(this, 'typeOfBirth')}
          >
            <RadioButton label="Single" value="single" />
            <RadioButton label="Twin" value="twin" disabled />
            <RadioButton label="Triplet" value="triplet" />
            <RadioButton label="Other" value="other" />
          </RadioGroup>
        </div>
      </form>
    );
  };
}

export default WorkingItemForm;
