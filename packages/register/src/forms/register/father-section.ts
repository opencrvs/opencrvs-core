import { defineMessages } from 'react-intl'
import { ValidIndicator } from '@opencrvs/components/lib/forms'
import { addressSameAsMother, permanentAddressSameAsMother } from '../address'
import { messages as identityMessages } from '../identity'
import { messages as maritalStatusMessages } from '../maritalStatus'
import { messages as educationMessages } from '../education'

export interface IFatherSectionFormData {
  firstName: string
  foo: string
  bar: string
  baz: string
}

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
  }
})

export const fatherSection = {
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
      initialValue: '0',
      validate: [],
      options: [
        { value: '1', label: messages.confirm },
        { value: '0', label: messages.deny }
      ]
    }
  ]
}

export const fathersSectionDetails = [
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
    ]
  },
  {
    name: 'fatherID',
    type: 'text',
    label: identityMessages.iD,
    required: true,
    initialValue: '',
    validate: [],
    postfix: ValidIndicator
  },
  {
    name: 'nationality',
    type: 'select',
    label: messages.nationality,
    required: true,
    initialValue: '',
    validate: [],
    options: [{ value: 'bg', label: messages.nationalityBangladesh }]
  },
  {
    name: 'fatherGivenName',
    type: 'text',
    label: messages.fatherGivenName,
    required: true,
    initialValue: '',
    validate: []
  },
  {
    name: 'fatherMiddleNames',
    type: 'text',
    label: messages.fatherMiddleNames,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'fatherFamilyName',
    type: 'text',
    label: messages.fatherFamilyName,
    initialValue: '',
    validate: []
  },
  {
    name: 'fatherGivenNameEng',
    type: 'text',
    label: messages.fatherGivenNameEng,
    required: true,
    initialValue: '',
    validate: []
  },
  {
    name: 'fatherMiddleNamesEng',
    type: 'text',
    label: messages.fatherMiddleNamesEng,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'fatherFamilyNameEng',
    type: 'text',
    label: messages.fatherFamilyNameEng,
    initialValue: '',
    validate: []
  },
  {
    name: 'fatherDateOfBirth',
    type: 'date',
    label: messages.fatherDateOfBirth,
    required: true,
    initialValue: '',
    validate: []
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
    ]
  },
  {
    name: 'fatherDateOfMarriage',
    type: 'date',
    label: maritalStatusMessages.dateOfMarriage,
    required: true,
    initialValue: '',
    validate: []
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
    ]
  },
  addressSameAsMother,
  permanentAddressSameAsMother
]

export const fathersCurrentAddress = {
  name: 'fathersCurrentAddress',
  type: 'address',
  label: messages.currentAddress,
  required: false,
  initialValue: '',
  validate: []
}
