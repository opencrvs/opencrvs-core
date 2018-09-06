import { defineMessages } from 'react-intl'
import { ValidIndicator } from '@opencrvs/components/lib/forms'
import {
  messages as addressMessages,
  states,
  districts,
  addressLine4Options,
  addressLine3Options2,
  addressLine3Options1
} from '../address'
import { countries } from '../countries'
import { messages as identityMessages } from '../identity'
import { messages as maritalStatusMessages } from '../maritalStatus'
import { messages as educationMessages } from '../education'
import { IFormSection } from '../index'

export const messages = defineMessages({
  fatherTab: {
    id: 'register.form.tabs.fatherTab',
    defaultMessage: 'Father',
    description: 'Tab title for Father'
  },
  fatherTitle: {
    id: 'register.form.section.fatherTitle',
    defaultMessage: "Father's details",
    description: 'Form section title for Father'
  },
  fathersDetailsExist: {
    id: 'formFields.fathersDetailsExist',
    defaultMessage: "Do you have the father's details?",
    description: "Question to ask the user if they have the father's details"
  },
  confirm: {
    id: 'formFields.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'formFields.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
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
  fatherGivenName: {
    id: 'formFields.fatherGivenName',
    defaultMessage: 'Given name',
    description: 'Label for form field: Given name'
  },
  fatherMiddleNames: {
    id: 'formFields.fatherMiddleNames',
    defaultMessage: 'Middle name(s)',
    description: 'Label for form field: Middle names'
  },
  fatherFamilyName: {
    id: 'formFields.fatherFamilyName',
    defaultMessage: 'Family name',
    description: 'Label for form field: Family name'
  },
  fatherGivenNameEng: {
    id: 'formFields.fatherGivenName',
    defaultMessage: 'Given name (in english)',
    description: 'Label for form field: Given name in english'
  },
  fatherMiddleNamesEng: {
    id: 'formFields.fatherMiddleNames',
    defaultMessage: 'Middle name(s) (in english)',
    description: 'Label for form field: Middle names in english'
  },
  fatherFamilyNameEng: {
    id: 'formFields.fatherFamilyName',
    defaultMessage: 'Family name (in english)',
    description: 'Label for form field: Family name in english'
  },
  defaultLabel: {
    id: 'formFields.defaultLabel',
    defaultMessage: 'Label goes here',
    description: 'default label'
  },
  fatherDateOfBirth: {
    id: 'formFields.fatherDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  fatherEducationAttainment: {
    id: 'formFields.motherEducationAttainment',
    defaultMessage: "Father's level of formal education attained",
    description: 'Label for form field: Father education'
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

export const fatherSection: IFormSection = {
  id: 'father',
  viewType: 'form',
  name: messages.fatherTab,
  title: messages.fatherTitle,
  fields: [
    {
      name: 'fathersDetailsExist',
      type: 'radioGroup',
      label: messages.fathersDetailsExist,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: '1', label: messages.confirm },
        { value: '0', label: messages.deny }
      ]
    },
    {
      name: 'fatherIDType',
      type: 'select',
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
      ],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherID',
      type: 'text',
      label: identityMessages.iD,
      required: true,
      initialValue: '',
      validate: [],
      postfix: ValidIndicator,
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'nationality',
      type: 'select',
      label: messages.nationality,
      required: true,
      initialValue: '',
      validate: [],
      options: [{ value: 'bg', label: messages.nationalityBangladesh }],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherGivenName',
      type: 'text',
      label: messages.fatherGivenName,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherMiddleNames',
      type: 'text',
      label: messages.fatherMiddleNames,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherFamilyName',
      type: 'text',
      label: messages.fatherFamilyName,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherGivenNameEng',
      type: 'text',
      label: messages.fatherGivenNameEng,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherMiddleNamesEng',
      type: 'text',
      label: messages.fatherMiddleNamesEng,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherFamilyNameEng',
      type: 'text',
      label: messages.fatherFamilyNameEng,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherDateOfBirth',
      type: 'date',
      label: messages.fatherDateOfBirth,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'maritalStatus',
      type: 'select',
      label: maritalStatusMessages.maritalStatus,
      required: true,
      initialValue: '',
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
      ],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherDateOfMarriage',
      type: 'date',
      label: maritalStatusMessages.dateOfMarriage,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'fatherEducationAttainment',
      type: 'select',
      label: messages.fatherEducationAttainment,
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
      ],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'addressSameAsMother',
      type: 'radioGroup',
      label: addressMessages.addressSameAsMother,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: '1', label: addressMessages.confirm },
        { value: '0', label: addressMessages.deny }
      ],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'currentAddress',
      type: 'subSection',
      label: messages.currentAddress,
      initialValue: '',
      required: false,
      validate: [],
      conditionals: ['fathersDetailsExist', 'addressSameAsMother']
    },
    {
      name: 'country',
      type: 'select',
      label: addressMessages.country,
      required: true,
      initialValue: '',
      validate: [],
      options: countries,
      conditionals: ['fathersDetailsExist', 'addressSameAsMother']
    },
    {
      name: 'state',
      type: 'select',
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      options: states,
      conditionals: ['fathersDetailsExist', 'addressSameAsMother', 'country']
    },
    {
      name: 'district',
      type: 'select',
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      options: districts,
      conditionals: [
        'fathersDetailsExist',
        'addressSameAsMother',
        'country',
        'state'
      ]
    },
    {
      name: 'addressLine4',
      type: 'select',
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      options: addressLine4Options,
      conditionals: [
        'fathersDetailsExist',
        'addressSameAsMother',
        'country',
        'state',
        'district'
      ]
    },
    {
      name: 'addressLine3Options2',
      type: 'select',
      label: addressMessages.addressLine3Options2,
      required: true,
      initialValue: '',
      validate: [],
      options: addressLine3Options2,
      conditionals: [
        'fathersDetailsExist',
        'addressSameAsMother',
        'country',
        'state',
        'district',
        'addressLine4'
      ]
    },
    {
      name: 'addressLine3Options1',
      type: 'select',
      label: addressMessages.addressLine3Options1,
      required: true,
      initialValue: '',
      validate: [],
      options: addressLine3Options1,
      conditionals: [
        'fathersDetailsExist',
        'addressSameAsMother',
        'country',
        'state',
        'district',
        'addressLine4',
        'addressLine3Options2'
      ]
    },
    {
      name: 'addressLine2',
      type: 'text',
      label: addressMessages.addressLine2,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        'fathersDetailsExist',
        'addressSameAsMother',
        'country',
        'state',
        'district',
        'addressLine4',
        'addressLine3Options2'
      ]
    },
    {
      name: 'addressLine1',
      type: 'text',
      label: addressMessages.addressLine1,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        'fathersDetailsExist',
        'addressSameAsMother',
        'country',
        'state',
        'district',
        'addressLine4',
        'addressLine3Options2'
      ]
    },
    {
      name: 'postCode',
      type: 'text',
      label: addressMessages.postCode,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        'fathersDetailsExist',
        'addressSameAsMother',
        'country',
        'state',
        'district',
        'addressLine4',
        'addressLine3Options2'
      ]
    },
    {
      name: 'permanentAddressSameAsMother',
      type: 'radioGroup',
      label: addressMessages.permanentAddressSameAsMother,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: '1', label: messages.confirm },
        { value: '0', label: messages.deny }
      ],
      conditionals: ['fathersDetailsExist']
    },
    {
      name: 'permanentAddress',
      type: 'subSection',
      label: messages.permanentAddress,
      initialValue: '',
      required: false,
      validate: [],
      conditionals: ['fathersDetailsExist', 'permanentAddressSameAsMother']
    },
    {
      name: 'countryPermanent',
      type: 'select',
      label: addressMessages.country,
      required: true,
      initialValue: '',
      validate: [],
      options: countries,
      conditionals: ['fathersDetailsExist', 'permanentAddressSameAsMother']
    },
    {
      name: 'statePermanent',
      type: 'select',
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      options: states,
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent'
      ]
    },
    {
      name: 'districtPermanent',
      type: 'select',
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      options: districts,
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent',
        'statePermanent'
      ]
    },
    {
      name: 'addressLine4Permanent',
      type: 'select',
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      options: addressLine4Options,
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent',
        'statePermanent',
        'districtPermanent'
      ]
    },
    {
      name: 'addressLine3Options2Permanent',
      type: 'select',
      label: addressMessages.addressLine3Options2,
      required: true,
      initialValue: '',
      validate: [],
      options: addressLine3Options2,
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent',
        'statePermanent',
        'districtPermanent',
        'addressLine4Permanent'
      ]
    },
    {
      name: 'addressLine3Options1Permanent',
      type: 'select',
      label: addressMessages.addressLine3Options1,
      required: true,
      initialValue: '',
      validate: [],
      options: addressLine3Options1,
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent',
        'statePermanent',
        'districtPermanent',
        'addressLine4Permanent',
        'addressLine3Options2Permanent'
      ]
    },
    {
      name: 'addressLine2Permanent',
      type: 'text',
      label: addressMessages.addressLine2,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent',
        'statePermanent',
        'districtPermanent',
        'addressLine4Permanent',
        'addressLine3Options2Permanent'
      ]
    },
    {
      name: 'addressLine1Permanent',
      type: 'text',
      label: addressMessages.addressLine1,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent',
        'statePermanent',
        'districtPermanent',
        'addressLine4Permanent',
        'addressLine3Options2Permanent'
      ]
    },
    {
      name: 'postCodePermanent',
      type: 'text',
      label: addressMessages.postCode,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        'fathersDetailsExist',
        'permanentAddressSameAsMother',
        'countryPermanent',
        'statePermanent',
        'districtPermanent',
        'addressLine4Permanent',
        'addressLine3Options2Permanent'
      ]
    }
  ],
  conditionals: [
    {
      id: 'fathersDetailsExist',
      action: 'hide',
      expression: 'values.fathersDetailsExist == 0'
    },
    {
      id: 'permanentAddressSameAsMother',
      action: 'hide',
      expression: 'values.permanentAddressSameAsMother == 1'
    },
    {
      id: 'addressSameAsMother',
      action: 'hide',
      expression: 'values.addressSameAsMother == 1'
    },
    {
      id: 'countryPermanent',
      action: 'hide',
      expression: '!values.countryPermanent'
    },
    {
      id: 'statePermanent',
      action: 'hide',
      expression: '!values.statePermanent'
    },
    {
      id: 'districtPermanent',
      action: 'hide',
      expression: '!values.districtPermanent'
    },
    {
      id: 'addressLine4Permanent',
      action: 'hide',
      expression: '!values.addressLine4Permanent'
    },
    {
      id: 'addressLine3Options2Permanent',
      action: 'hide',
      expression: '!values.addressLine3Options2Permanent'
    },
    {
      id: 'country',
      action: 'hide',
      expression: '!values.country'
    },
    {
      id: 'state',
      action: 'hide',
      expression: '!values.state'
    },
    {
      id: 'district',
      action: 'hide',
      expression: '!values.district'
    },
    {
      id: 'addressLine4',
      action: 'hide',
      expression: '!values.addressLine4'
    },
    {
      id: 'addressLine3Options2',
      action: 'hide',
      expression: '!values.addressLine3Options2'
    }
  ]
}
