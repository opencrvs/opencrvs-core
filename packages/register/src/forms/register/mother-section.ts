import { defineMessages } from 'react-intl'

import { messages as identityMessages } from '../identity'
import { messages as maritalStatusMessages } from '../maritalStatus'
import { messages as educationMessages } from '../education'
import {
  ViewType,
  SELECT_WITH_OPTIONS,
  TEXT,
  NUMBER,
  DATE,
  SUBSECTION,
  SELECT_WITH_DYNAMIC_OPTIONS
} from 'src/forms'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  dateFormat
} from 'src/utils/validate'

export interface IMotherSectionFormData {
  firstName: string
}
import { IFormSection } from '../index'
import {
  messages as addressMessages,
  states,
  stateDistrictMap,
  districtUpazilaMap,
  upazilaUnionMap
} from '../address'
import { countries } from '../countries'
import { conditionals } from '../utils'

const messages = defineMessages({
  motherTab: {
    id: 'register.form.tabs.motherTab',
    defaultMessage: 'Mother',
    description: 'Tab title for Mother'
  },
  motherTitle: {
    id: 'register.form.section.motherTitle',
    defaultMessage: "Mother's details",
    description: 'Form section title for Mother'
  },
  nationality: {
    id: 'formFields.mother.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  nationalityBangladesh: {
    id: 'formFields.mother.nationalityBangladesh',
    defaultMessage: 'Bangladesh',
    description: 'Option for form field: Nationality'
  },
  motherFirstNames: {
    id: 'formFields.motherFirstNames',
    defaultMessage: 'First name(s)',
    description: 'Label for form field: First names'
  },
  motherFamilyName: {
    id: 'formFields.motherFamilyName',
    defaultMessage: 'Family name',
    description: 'Label for form field: Family name'
  },
  motherFirstNamesEng: {
    id: 'formFields.motherFirstNamesEng',
    defaultMessage: 'First name(s) (in english)',
    description: 'Label for form field: First names in english'
  },
  motherFamilyNameEng: {
    id: 'formFields.motherFamilyNameEng',
    defaultMessage: 'Family name (in english)',
    description: 'Label for form field: Family name in english'
  },
  defaultLabel: {
    id: 'formFields.defaultLabel',
    defaultMessage: 'Label goes here',
    description: 'default label'
  },
  motherDateOfBirth: {
    id: 'formFields.motherDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  motherEducationAttainment: {
    id: 'formFields.motherEducationAttainment',
    defaultMessage: "Mother's level of formal education attained",
    description: 'Label for form field: Mother education'
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

export const motherSection: IFormSection = {
  id: 'mother',
  viewType: 'form' as ViewType,
  name: messages.motherTab,
  title: messages.motherTitle,
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
      name: 'nationality',
      type: SELECT_WITH_OPTIONS,
      label: messages.nationality,
      required: true,
      initialValue: 'BGD',
      validate: [],
      options: countries
    },
    {
      name: 'firstNames',
      type: TEXT,
      label: messages.motherFirstNames,
      required: false,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'familyName',
      type: TEXT,
      label: messages.motherFamilyName,
      required: true,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'firstNamesEng',
      type: TEXT,
      label: messages.motherFirstNamesEng,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'familyNameEng',
      type: TEXT,
      label: messages.motherFamilyNameEng,
      required: true,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'birthDate',
      type: DATE,
      label: messages.motherDateOfBirth,
      required: true,
      initialValue: '',
      validate: [dateFormat]
    },
    {
      name: 'maritalStatus',
      type: SELECT_WITH_OPTIONS,
      label: maritalStatusMessages.maritalStatus,
      required: true,
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
      name: 'dateOfMarriage',
      type: DATE,
      label: maritalStatusMessages.dateOfMarriage,
      required: false,
      initialValue: '',
      validate: [dateFormat]
    },
    {
      name: 'educationalAttainment',
      type: SELECT_WITH_OPTIONS,
      label: messages.motherEducationAttainment,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        {
          value: 'NO_SCHOOLING',
          label: educationMessages.educationAttainmentNone
        },
        {
          value: 'PRIMARY_ISCED_1',
          label: educationMessages.educationAttainmentISCED1
        },
        {
          value: 'LOWER_SECONDARY_ISCED_2',
          label: educationMessages.educationAttainmentISCED2
        },
        {
          value: 'UPPER_SECONDARY_ISCED_3',
          label: educationMessages.educationAttainmentISCED3
        },
        {
          value: 'POST_SECONDARY_ISCED_4',
          label: educationMessages.educationAttainmentISCED4
        },
        {
          value: 'FIRST_STAGE_TERTIARY_ISCED_5',
          label: educationMessages.educationAttainmentISCED5
        },
        {
          value: 'SECOND_STAGE_TERTIARY_ISCED_6',
          label: educationMessages.educationAttainmentISCED6
        },
        {
          value: 'NOT_STATED',
          label: educationMessages.educationAttainmentNotStated
        }
      ]
    },
    {
      name: 'currentAddress',
      type: SUBSECTION,
      label: messages.currentAddress,
      initialValue: '',
      required: false,
      validate: []
    },
    {
      name: 'country',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: 'BGD',
      validate: [],
      options: countries
    },
    {
      name: 'state',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      options: states,
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
        dependency: 'state',
        options: stateDistrictMap
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
        dependency: 'district',
        options: districtUpazilaMap
      },
      conditionals: [
        conditionals.country,
        conditionals.state,
        conditionals.district
      ]
    },
    {
      name: 'addressLine3Options1',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine3Options1,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        dependency: 'addressLine4',
        options: upazilaUnionMap
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
        conditionals.addressLine3Options1
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
        conditionals.addressLine3Options1
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
        conditionals.addressLine3Options1
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
      name: 'countryPermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.country,
      required: true,
      initialValue: 'BGD',
      validate: [],
      options: countries
    },
    {
      name: 'statePermanent',
      type: SELECT_WITH_OPTIONS,
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      options: states,
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
        dependency: 'statePermanent',
        options: stateDistrictMap
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
        dependency: 'districtPermanent',
        options: districtUpazilaMap
      },
      conditionals: [
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent
      ]
    },
    {
      name: 'addressLine3Options1Permanent',
      type: SELECT_WITH_DYNAMIC_OPTIONS,
      label: addressMessages.addressLine3Options1,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: {
        dependency: 'addressLine4Permanent',
        options: upazilaUnionMap
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
        conditionals.addressLine3Options1Permanent
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
        conditionals.addressLine3Options1Permanent
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
        conditionals.addressLine3Options1Permanent
      ]
    }
  ]
}
