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
  TEL
} from 'src/forms'
import { defineMessages } from 'react-intl'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  dateFormat
} from 'src/utils/validate'
import { countries } from 'src/forms/countries'

import { messages as identityMessages } from '../../../identity'
import { messages as addressMessages } from '../../../address'

import { config } from 'src/config'
import { OFFLINE_LOCATIONS_KEY } from 'src/offline/reducer'
import { conditionals } from 'src/forms/utils'
import { phoneNumberFormat } from 'src/utils/validate'

const messages = defineMessages({
  applicantTab: {
    id: 'register.form.tabs.applicantTab',
    defaultMessage: 'Applicant',
    description: 'Tab title for Applicant'
  },
  applicantTitle: {
    id: 'register.form.section.applicantTitle',
    defaultMessage: "Applicant's details",
    description: 'Form section title for applicants'
  },
  applicantsIdType: {
    id: 'formFields.applicantsIdType',
    defaultMessage: 'Existing ID',
    description: 'Label for form field: Existing ID'
  },
  noId: {
    id: 'formFields.idTypeNoID',
    defaultMessage: 'No ID available',
    description: 'Option for form field: Type of ID'
  },
  applicantsGivenNames: {
    id: 'formFields.applicantsGivenNames',
    defaultMessage: 'Given name (s)',
    description: 'Label for form field: Given names'
  },
  applicantsFamilyName: {
    id: 'formFields.applicantsFamilyName',
    defaultMessage: 'Family Name',
    description: 'Label for form field: Family name'
  },
  applicantsGivenNamesEng: {
    id: 'formFields.applicantsGivenNamesEng',
    defaultMessage: 'Given Name (s) in English',
    description: 'Label for form field: Given names in english'
  },
  applicantsFamilyNameEng: {
    id: 'formFields.applicantsFamilyNameEng',
    defaultMessage: 'Family Name in English',
    description: 'Label for form field: Family name in english'
  },
  applicantsNationality: {
    id: 'formFields.applicants.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  applicantsDateOfBirth: {
    id: 'formFields.applicantsDateOfBirth',
    defaultMessage: 'Date of Birth',
    description: 'Label for form field: Date of birth'
  },
  applicantsRelationWithDeceased: {
    id: 'formFields.applicantsRelationWithDeceased',
    defaultMessage: 'Relationship to Deceased',
    description: 'Label for Relationship to Deceased select'
  },
  relationFather: {
    id: 'formFields.applicantRelation.father',
    defaultMessage: 'Father',
    description: 'Label for option Father'
  },
  relationMother: {
    id: 'formFields.applicantRelation.mother',
    defaultMessage: 'Mother',
    description: 'Label for option Mother'
  },
  relationSpouse: {
    id: 'formFields.applicantRelation.spouse',
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse'
  },
  relationSon: {
    id: 'formFields.applicantRelation.son',
    defaultMessage: 'Son',
    description: 'Label for option Son'
  },
  relationDaughter: {
    id: 'formFields.applicantRelation.daughter',
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter'
  },
  relationExtendedFamily: {
    id: 'formFields.applicantRelation.extendedFamily',
    defaultMessage: 'Extended Family',
    description: 'Label for option Extended Family'
  },
  relationOther: {
    id: 'formFields.applicantRelation.other',
    defaultMessage: 'Other(Specify)',
    description: 'Label for option Other'
  },
  permanentAddressSameAsCurrent: {
    id: 'formFields.applicantsCurrentAddressSameAsPermanent',
    defaultMessage:
      'Is applicant’s permanent address the same as their current address?',
    description:
      'Title for the radio button to select that the applicants current address is the same as their permanent address'
  },
  applicantsPhone: {
    defaultMessage: 'Phone number',
    id: 'formFields.applicant.phone',
    description: 'Input label for phone input'
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

export const applicantsSection: IFormSection = {
  id: 'applicant',
  viewType: 'form' as ViewType,
  name: messages.applicantTab,
  title: messages.applicantTitle,
  fields: [
    {
      name: 'applicantIdType',
      type: SELECT_WITH_OPTIONS,
      label: messages.applicantsIdType,
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
          value: 'REFUGEE_NUMBER',
          label: identityMessages.iDTypeRefugeeNumber
        },
        { value: 'ALIEN_NUMBER', label: identityMessages.iDTypeAlienNumber },
        { value: 'NO_ID', label: messages.noId }
      ]
    },
    {
      name: 'applicantID',
      type: TEXT,
      label: identityMessages.iD,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.iDAvailable]
    },
    {
      name: 'applicantFirstNames',
      type: TEXT,
      label: messages.applicantsGivenNames,
      required: false,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'applicantFamilyName',
      type: TEXT,
      label: messages.applicantsFamilyName,
      required: true,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'applicantFirstNamesEng',
      type: TEXT,
      label: messages.applicantsGivenNamesEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'applicantFamilyNameEng',
      type: TEXT,
      label: messages.applicantsFamilyNameEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'applicantNationality',
      type: SELECT_WITH_OPTIONS,
      label: messages.applicantsNationality,
      required: false,
      initialValue: 'BGD',
      validate: [],
      options: countries
    },
    {
      name: 'applicantBirthDate',
      type: DATE,
      label: messages.applicantsDateOfBirth,
      required: false,
      initialValue: '',
      validate: [dateFormat]
    },
    {
      name: 'applicantsRelationToDeceased',
      type: SELECT_WITH_OPTIONS,
      label: messages.applicantsRelationWithDeceased,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'FATHER', label: messages.relationFather },
        { value: 'MOTHER', label: messages.relationMother },
        { value: 'SPOUSE', label: messages.relationSpouse },
        {
          value: 'SON',
          label: messages.relationSon
        },
        {
          value: 'DAUGHTER',
          label: messages.relationDaughter
        },
        {
          value: 'EXTENDED_FAMILY',
          label: messages.relationExtendedFamily
        },
        {
          value: 'OTHER',
          label: messages.relationOther
        }
      ]
    },
    {
      name: 'applicantPhone',
      type: TEL,
      label: messages.applicantsPhone,
      required: false,
      initialValue: '',
      validate: [phoneNumberFormat]
    },
    {
      name: 'currentAddress',
      type: SUBSECTION,
      label: messages.currentAddress,
      initialValue: '',
      required: true,
      validate: [],
      conditionals: []
    },
    {
      name: 'country',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries
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
      conditionals: [conditionals.country]
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
      conditionals: [conditionals.country, conditionals.state]
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
        conditionals.district
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
        conditionals.addressLine4
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
        conditionals.addressLine3
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
        conditionals.addressLine3
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
        conditionals.addressLine3
      ]
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
      name: 'applicantPermanentAddressSameAsCurrent',
      type: RADIO_GROUP,
      label: messages.permanentAddressSameAsCurrent,
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
      name: 'countryPermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: config.COUNTRY.toUpperCase(),
      validate: [],
      options: countries,
      conditionals: [conditionals.applicantPermanentAddressSameAsCurrent]
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
      conditionals: [
        conditionals.countryPermanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ]
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
      conditionals: [
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ]
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
        conditionals.districtPermanent,
        conditionals.applicantPermanentAddressSameAsCurrent
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
        conditionals.addressLine4Permanent,
        conditionals.applicantPermanentAddressSameAsCurrent
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
        conditionals.addressLine3Permanent,
        conditionals.applicantPermanentAddressSameAsCurrent
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
        conditionals.addressLine3Permanent,
        conditionals.applicantPermanentAddressSameAsCurrent
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
        conditionals.addressLine3Permanent,
        conditionals.applicantPermanentAddressSameAsCurrent
      ]
    }
  ]
}
