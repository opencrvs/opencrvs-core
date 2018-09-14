import { defineMessages } from 'react-intl'
import { ValidIndicator } from '@opencrvs/components/lib/forms'
import { messages as addressMessages, states } from '../address'
import { countries } from '../countries'
import { messages as identityMessages } from '../identity'
import { messages as maritalStatusMessages } from '../maritalStatus'
import { messages as educationMessages } from '../education'
import { ViewType } from 'src/forms'

export interface IFatherSectionFormData {
  firstName: string
  foo: string
  bar: string
  baz: string
}
import { IFormSection } from '../index'
import { conditionals } from '../utils'

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
    id: 'formFields.father.nationality',
    defaultMessage: 'Nationality',
    description: 'Label for form field: Nationality'
  },
  nationalityBangladesh: {
    id: 'formFields.father.nationalityBangladesh',
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
    id: 'formFields.fatherGivenNameEng',
    defaultMessage: 'Given name (in english)',
    description: 'Label for form field: Given name in english'
  },
  fatherMiddleNamesEng: {
    id: 'formFields.fatherMiddleNamesEng',
    defaultMessage: 'Middle name(s) (in english)',
    description: 'Label for form field: Middle names in english'
  },
  fatherFamilyNameEng: {
    id: 'formFields.fatherFamilyNameEng',
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
    id: 'formFields.fatherEducationAttainment',
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
  viewType: 'form' as ViewType,
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
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherID',
      type: 'text',
      label: identityMessages.iD,
      required: true,
      initialValue: '',
      validate: [],
      postfix: ValidIndicator,
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'nationality',
      type: 'select',
      label: messages.nationality,
      required: true,
      initialValue: '',
      validate: [],
      options: countries,
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherGivenName',
      type: 'text',
      label: messages.fatherGivenName,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherMiddleNames',
      type: 'text',
      label: messages.fatherMiddleNames,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherFamilyName',
      type: 'text',
      label: messages.fatherFamilyName,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherGivenNameEng',
      type: 'text',
      label: messages.fatherGivenNameEng,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherMiddleNamesEng',
      type: 'text',
      label: messages.fatherMiddleNamesEng,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherFamilyNameEng',
      type: 'text',
      label: messages.fatherFamilyNameEng,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherDateOfBirth',
      type: 'date',
      label: messages.fatherDateOfBirth,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
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
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'fatherDateOfMarriage',
      type: 'date',
      label: maritalStatusMessages.dateOfMarriage,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [conditionals.fathersDetailsExist]
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
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'addressSameAsMother',
      type: 'radioGroup',
      label: addressMessages.addressSameAsMother,
      required: true,
      initialValue: '1',
      validate: [],
      options: [
        { value: '1', label: addressMessages.confirm },
        { value: '0', label: addressMessages.deny }
      ],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'currentAddress',
      type: 'subSection',
      label: messages.currentAddress,
      initialValue: '',
      required: false,
      validate: [],
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother
      ]
    },
    {
      name: 'country',
      type: 'select',
      label: addressMessages.country,
      required: true,
      initialValue: '',
      validate: [],
      options: countries,
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother
      ]
    },
    {
      name: 'state',
      type: 'select',
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      options: states,
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother,
        conditionals.country
      ]
    },
    {
      name: 'district',
      type: 'select',
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: 'district',
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother,
        conditionals.country,
        conditionals.state
      ]
    },
    {
      name: 'addressLine4',
      type: 'select',
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      options: [],
      dynamicOptions: 'addressLine4',
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother,
        conditionals.country,
        conditionals.state,
        conditionals.district
      ]
    },
    {
      name: 'addressLine3Options1',
      type: 'select',
      label: addressMessages.addressLine3Options1,
      required: true,
      initialValue: '',
      validate: [],
      options: [],
      dynamicOptions: 'addressLine3Options1',
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother,
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4
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
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother,
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3Options1
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
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother,
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3Options1
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
        conditionals.fathersDetailsExist,
        conditionals.addressSameAsMother,
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3Options1
      ]
    },
    {
      name: 'permanentAddressSameAsMother',
      type: 'radioGroup',
      label: addressMessages.permanentAddressSameAsMother,
      required: true,
      initialValue: '1',
      validate: [],
      options: [
        { value: '1', label: messages.confirm },
        { value: '0', label: messages.deny }
      ],
      conditionals: [conditionals.fathersDetailsExist]
    },
    {
      name: 'permanentAddress',
      type: 'subSection',
      label: messages.permanentAddress,
      initialValue: '',
      required: false,
      validate: [],
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother
      ]
    },
    {
      name: 'countryPermanent',
      type: 'select',
      label: addressMessages.country,
      required: true,
      initialValue: '',
      validate: [],
      options: countries,
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother
      ]
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
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent
      ]
    },
    {
      name: 'districtPermanent',
      type: 'select',
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      options: [],
      dynamicOptions: 'districtPermanent',
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent
      ]
    },
    {
      name: 'addressLine4Permanent',
      type: 'select',
      label: addressMessages.addressLine4,
      required: true,
      initialValue: '',
      validate: [],
      options: [],
      dynamicOptions: 'addressLine4Permanent',
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent
      ]
    },
    {
      name: 'addressLine3Options1Permanent',
      type: 'select',
      label: addressMessages.addressLine3Options1,
      required: true,
      initialValue: '',
      validate: [],
      options: [],
      dynamicOptions: 'addressLine3Options1Permanent',
      conditionals: [
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent
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
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Options1Permanent
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
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Options1Permanent
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
        conditionals.fathersDetailsExist,
        conditionals.permanentAddressSameAsMother,
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Options1Permanent
      ]
    }
  ]
}
