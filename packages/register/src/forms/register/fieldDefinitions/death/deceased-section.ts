import {
  IFormSection,
  ViewType,
  TEXT,
  SELECT_WITH_OPTIONS,
  DATE,
  SUBSECTION,
  SELECT_WITH_DYNAMIC_OPTIONS,
  NUMBER,
  RADIO_GROUP,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  LOADER_BUTTON
} from 'src/forms'
import { defineMessages } from 'react-intl'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  isValidBirthDate,
  validIDNumber
} from 'src/utils/validate'
import { countries } from 'src/forms/countries'

import {
  messages as identityMessages,
  identityNameMapper,
  identityTypeMapper,
  deathIdentityOptions
} from '../../../identity'
import { messages as maritalStatusMessages } from '../../../maritalStatus'
import { messages as addressMessages } from '../../../address'

import { OFFLINE_LOCATIONS_KEY } from 'src/offline/reducer'
import { conditionals } from 'src/forms/utils'
import { FETCH_DECEASED } from '@opencrvs/register/src/forms/register/fieldDefinitions/death/deceased-loader'

const messages = defineMessages({
  deceasedTab: {
    id: 'register.form.tabs.deceasedTab',
    defaultMessage: 'Deceased',
    description: 'Tab title for Deceased'
  },
  deceasedTitle: {
    id: 'register.form.section.deceasedTitle',
    defaultMessage: "Deceased's details",
    description: 'Form section title for Deceased'
  },
  deceasedIdType: {
    id: 'formFields.deceasedIdType',
    defaultMessage: 'Existing ID',
    description: 'Label for form field: Existing ID'
  },
  noId: {
    id: 'formFields.idTypeNoID',
    defaultMessage: 'No ID available',
    description: 'Option for form field: Type of ID'
  },
  fetchDeceasedDetails: {
    id: 'formFields.fetchDeceasedDetails',
    defaultMessage: "Retrieve Deceased's Details",
    description: 'Label for loader button'
  },
  fetchModalTitle: {
    id: 'formFields.fetchModalTitle',
    defaultMessage: 'Checking',
    description: 'Label for fetch modal title'
  },
  fetchModalSuccessTitle: {
    id: 'formFields.fetchModalSuccessTitle',
    defaultMessage: 'ID valid',
    description: 'Label for fetch modal success title'
  },
  fetchModalErrorTitle: {
    id: 'formFields.fetchModalErrorTitle',
    defaultMessage: 'Invalid Id',
    description: 'Label for fetch modal error title'
  },
  fetchModalErrorText: {
    id: 'formFields.fetchModalErrorText',
    defaultMessage: 'No registration found for provided BRN',
    description: 'Label for fetch modal error title'
  },
  fetchModalInfo: {
    id: 'formFields.fetchModalInfo',
    defaultMessage: 'Birth Registration Number',
    description: 'Label for loader button'
  },
  deceasedGivenNames: {
    id: 'formFields.deceasedGivenNames',
    defaultMessage: 'Given Name (s)',
    description: 'Label for form field: Given names'
  },
  deceasedFamilyName: {
    id: 'formFields.deceasedFamilyName',
    defaultMessage: 'Family Name',
    description: 'Label for form field: Family name'
  },
  deceasedGivenNamesEng: {
    id: 'formFields.deceasedGivenNamesEng',
    defaultMessage: 'Given Name (s) in English',
    description: 'Label for form field: Given names in english'
  },
  deceasedFamilyNameEng: {
    id: 'formFields.deceasedFamilyNameEng',
    defaultMessage: 'Family Name in English',
    description: 'Label for form field: Family name in english'
  },
  nationality: {
    id: 'formFields.deceased.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  deceasedSex: {
    id: 'formFields.deceasedSex',
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name'
  },
  deceasedSexMale: {
    id: 'formFields.deceasedSexMale',
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name'
  },
  deceasedSexFemale: {
    id: 'formFields.deceasedSexFemale',
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name'
  },
  deceasedSexOther: {
    id: 'formFields.deceasedSexOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name'
  },
  deceasedSexUnknown: {
    id: 'formFields.deceasedSexUnknown',
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name'
  },
  deceasedDateOfBirth: {
    id: 'formFields.deceasedDateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth'
  },
  currentAddressSameAsPermanent: {
    id: 'formFields.deceasedCurrentAddressSameAsPermanent',
    defaultMessage:
      'Is deceased’s current address the same as their permanent address?',
    description:
      'Title for the radio button to select that the deceased current address is the same as their permanent address'
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
      label: messages.deceasedIdType,
      required: true,
      initialValue: '',
      validate: [],
      options: deathIdentityOptions
    },
    {
      name: 'iDTypeOther',
      type: TEXT,
      label: identityMessages.iDTypeOtherLabel,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.iDType]
    },
    {
      name: 'iD',
      type: FIELD_WITH_DYNAMIC_DEFINITIONS,
      dynamicDefinitions: {
        label: {
          dependency: 'iDType',
          labelMapper: identityNameMapper
        },
        type: {
          dependency: 'iDType',
          typeMapper: identityTypeMapper
        },
        validate: [
          {
            validator: validIDNumber,
            dependencies: ['iDType']
          }
        ]
      },
      label: identityMessages.iD,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.iDAvailable]
    },
    {
      name: 'loaderButton',
      type: LOADER_BUTTON,
      label: messages.fetchDeceasedDetails,
      required: false,
      initialValue: '',
      query: FETCH_DECEASED,
      inputs: [
        {
          name: 'identifier',
          valueField: 'iD',
          labelField: 'iDType'
        }
      ],
      validate: [],
      conditionals: [conditionals.deceasedBRNSelected],
      modalTitle: messages.fetchModalTitle,
      modalInfoText1: messages.fetchModalInfo,
      modalInfoText2: messages.fetchModalInfo,
      successTitle: messages.fetchModalSuccessTitle,
      errorTitle: messages.fetchModalErrorTitle,
      errorText: messages.fetchModalErrorText
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
      required: true,
      initialValue: '',
      validate: [isValidBirthDate]
    },
    {
      name: 'permanentAddress',
      type: SUBSECTION,
      label: messages.permanentAddress,
      initialValue: '',
      validate: []
    },
    {
      name: 'countryPermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
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
      name: 'currentAddress',
      type: SUBSECTION,
      label: messages.currentAddress,
      initialValue: '',
      validate: [],
      conditionals: []
    },
    {
      name: 'currentAddressSameAsPermanent',
      type: RADIO_GROUP,
      label: messages.currentAddressSameAsPermanent,
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
      name: 'country',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
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
