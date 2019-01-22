import {
  IFormSection,
  ViewType,
  TEXT,
  SELECT_WITH_OPTIONS,
  DATE,
  SUBSECTION,
  SELECT_WITH_DYNAMIC_OPTIONS,
  NUMBER,
  RADIO_GROUP
} from 'src/forms'
import { defineMessages } from 'react-intl'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  dateFormat
} from 'src/utils/validate'
import { countries } from 'src/forms/countries'

import { messages as identityMessages } from '../../../identity'
import { messages as maritalStatusMessages } from '../../../maritalStatus'
import { messages as addressMessages } from '../../../address'

import { config } from 'src/config'
import { OFFLINE_LOCATIONS_KEY } from 'src/offline/reducer'
import { conditionals } from 'src/forms/utils'

const messages = defineMessages({
  deceasedTab: {
    id: 'register.form.tabs.deceasedTab',
    defaultMessage: 'Deceased'
  },
  deceasedTitle: {
    id: 'register.form.section.deceasedTitle',
    defaultMessage: 'Deceased’s details'
  },
  deceasedGivenNames: {
    id: 'formFields.deceasedGivenNames',
    defaultMessage: 'Given name (s)'
  },
  deceasedFamilyName: {
    id: 'formFields.deceasedFamilyName',
    defaultMessage: 'Family Name'
  },
  deceasedGivenNamesEng: {
    id: 'formFields.deceasedGivenNamesEng',
    defaultMessage: 'Given Name (s) in English'
  },
  deceasedFamilyNameEng: {
    id: 'formFields.deceasedFamilyNameEng',
    defaultMessage: 'Family Name in English'
  },
  nationality: {
    id: 'formFields.deceased.nationality',
    defaultMessage: 'Nationality'
  },
  deceasedSex: {
    id: 'formFields.deceasedSex',
    defaultMessage: 'Sex'
  },
  deceasedSexMale: {
    id: 'formFields.deceasedSexMale',
    defaultMessage: 'Male'
  },
  deceasedSexFemale: {
    id: 'formFields.deceasedSexFemale',
    defaultMessage: 'Female'
  },
  deceasedSexOther: {
    id: 'formFields.deceasedSexOther',
    defaultMessage: 'Other'
  },
  deceasedSexUnknown: {
    id: 'formFields.deceasedSexUnknown',
    defaultMessage: 'Unknown'
  },
  deceasedDateOfBirth: {
    id: 'formFields.deceasedDateOfBirth',
    defaultMessage: 'Date of Birth'
  },
  currentAddress: {
    id: 'formFields.currentAddress',
    defaultMessage: 'Current Address',
    description: 'Title for the current address fields'
  },
  permanentAddress: {
    id: 'formFields.permanentAddress',
    defaultMessage: 'Permanent Address',
    description: 'Title for the permanent address fields'
  },
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  }
})

export const deceasedSection: IFormSection = {
  id: 'deceased',
  viewType: 'form' as ViewType,
  name: messages.deceasedTab,
  title: messages.deceasedTitle,
  fields: [
    {
      name: 'iDType',
      type: SELECT_WITH_OPTIONS,
      label: identityMessages.iDType,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'PASSPORT', label: identityMessages.iDTypePassport },
        { value: 'NATIONAL_ID', label: identityMessages.iDTypeNationalID },
        {
          value: 'DRIVING_LICENCE',
          label: identityMessages.iDTypeDrivingLicence
        },
        {
          value: 'BIRTH_REGISTRATION_NUMBER',
          label: identityMessages.iDTypeBRN
        },
        {
          value: 'DEATH_REGISTRATION_NUMBER',
          label: identityMessages.iDTypeDRN
        },
        {
          value: 'REFUGEE_NUMBER',
          label: identityMessages.iDTypeRefugeeNumber
        },
        { value: 'ALIEN_NUMBER', label: identityMessages.iDTypeAlienNumber }
      ]
    },
    {
      name: 'iD',
      type: TEXT,
      label: identityMessages.iD,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'firstNames',
      type: TEXT,
      label: messages.deceasedGivenNames,
      required: false,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'familyName',
      type: TEXT,
      label: messages.deceasedFamilyName,
      required: true,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'firstNamesEng',
      type: TEXT,
      label: messages.deceasedGivenNamesEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'familyNameEng',
      type: TEXT,
      label: messages.deceasedFamilyNameEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'nationality',
      type: SELECT_WITH_OPTIONS,
      label: messages.nationality,
      required: true,
      initialValue: 'BGD',
      validate: [],
      options: countries
    },
    {
      name: 'gender',
      type: SELECT_WITH_OPTIONS,
      label: messages.deceasedSex,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'male', label: messages.deceasedSexMale },
        { value: 'female', label: messages.deceasedSexFemale },
        { value: 'other', label: messages.deceasedSexOther },
        { value: 'unknown', label: messages.deceasedSexUnknown }
      ]
    },
    {
      name: 'maritalStatus',
      type: SELECT_WITH_OPTIONS,
      label: maritalStatusMessages.maritalStatus,
      required: false,
      initialValue: 'MARRIED',
      validate: [],
      options: [
        { value: 'SINGLE', label: maritalStatusMessages.maritalStatusSingle },
        { value: 'MARRIED', label: maritalStatusMessages.maritalStatusMarried },
        { value: 'WIDOWED', label: maritalStatusMessages.maritalStatusWidowed },
        {
          value: 'DIVORCED',
          label: maritalStatusMessages.maritalStatusDivorced
        },
        {
          value: 'NOT_STATED',
          label: maritalStatusMessages.maritalStatusNotStated
        }
      ]
    },
    {
      name: 'birthDate',
      type: DATE,
      label: messages.deceasedDateOfBirth,
      required: false,
      initialValue: '',
      validate: [dateFormat]
    },
    {
      name: 'permanentAddress',
      type: SUBSECTION,
      label: messages.permanentAddress,
      initialValue: '',
      required: false,
      validate: []
    },
    {
      name: 'countryPermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries
    },
    {
      name: 'statePermanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'countryPermanent'
      },
      conditionals: [conditionals.countryPermanent]
    },
    {
      name: 'districtPermanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'statePermanent'
      },
      conditionals: [conditionals.countryPermanent, conditionals.statePermanent]
    },
    {
      name: 'addressLine4Permanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'districtPermanent'
      },
      conditionals: [
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent
      ]
    },
    {
      name: 'addressLine3Permanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine3,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'addressLine4Permanent'
      },
      conditionals: [
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent
      ]
    },
    {
      name: 'addressLine2Permanent',
      type: TEXT,
      label: addressMessages.addressLine2,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Permanent
      ]
    },
    {
      name: 'addressLine1Permanent',
      type: TEXT,
      label: addressMessages.addressLine1,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Permanent
      ]
    },
    {
      name: 'postCodePermanent',
      type: NUMBER,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Permanent
      ]
    },
    {
      name: 'currentAddressSameAsPermanent',
      type: RADIO_GROUP,
      label: addressMessages.currentAddressSameAsPermanent,
      required: true,
      initialValue: true,
      validate: [],
      options: [
        { value: true, label: addressMessages.confirm },
        { value: false, label: addressMessages.deny }
      ],
      conditionals: []
    },
    {
      name: 'currentAddress',
      type: SUBSECTION,
      label: messages.currentAddress,
      initialValue: '',
      required: false,
      validate: [],
      conditionals: [conditionals.currentAddressSameAsPermanent]
    },
    {
      name: 'country',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
      conditionals: [conditionals.currentAddressSameAsPermanent]
    },
    {
      name: 'state',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'country'
      },
      conditionals: [
        conditionals.country,
        conditionals.currentAddressSameAsPermanent
      ]
    },
    {
      name: 'district',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'state'
      },
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.currentAddressSameAsPermanent
      ]
    },
    {
      name: 'addressLine4',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'district'
      },
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.currentAddressSameAsPermanent
      ]
    },
    {
      name: 'addressLine3',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine3,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        resource: OFFLINE_LOCATIONS_KEY,
        dependency: 'addressLine4'
      },
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.currentAddressSameAsPermanent
      ]
    },
    {
      name: 'addressLine2',
      type: TEXT,
      label: addressMessages.addressLine2,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3,
        conditionals.currentAddressSameAsPermanent
      ]
    },
    {
      name: 'addressLine1',
      type: TEXT,
      label: addressMessages.addressLine1,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3,
        conditionals.currentAddressSameAsPermanent
      ]
    },
    {
      name: 'postCode',
      type: NUMBER,
      label: addressMessages.postCode,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3,
        conditionals.currentAddressSameAsPermanent
      ]
    }
  ]
}
