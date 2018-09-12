import { defineMessages } from 'react-intl'
import { ValidIndicator } from '@opencrvs/components/lib/forms'
import { messages as identityMessages } from '../identity'
import { messages as maritalStatusMessages } from '../maritalStatus'
import { messages as educationMessages } from '../education'
import { ViewType } from 'src/forms'

export interface IMotherSectionFormData {
  firstName: string
}
import { IFormSection } from '../index'
import { messages as addressMessages, states } from '../address'
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
  motherGivenName: {
    id: 'formFields.motherGivenName',
    defaultMessage: 'Given name',
    description: 'Label for form field: Given name'
  },
  motherMiddleNames: {
    id: 'formFields.motherMiddleNames',
    defaultMessage: 'Middle name(s)',
    description: 'Label for form field: Middle names'
  },
  motherFamilyName: {
    id: 'formFields.motherFamilyName',
    defaultMessage: 'Family name',
    description: 'Label for form field: Family name'
  },
  motherGivenNameEng: {
    id: 'formFields.motherGivenName',
    defaultMessage: 'Given name (in english)',
    description: 'Label for form field: Given name in english'
  },
  motherMiddleNamesEng: {
    id: 'formFields.motherMiddleNames',
    defaultMessage: 'Middle name(s) (in english)',
    description: 'Label for form field: Middle names in english'
  },
  motherFamilyNameEng: {
    id: 'formFields.motherFamilyName',
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
  }
})

export const motherSection: IFormSection = {
  id: 'mother',
  viewType: 'form' as ViewType,
  name: messages.motherTab,
  title: messages.motherTitle,
  fields: [
    {
      name: 'motherIDType',
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
      name: 'motherID',
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
      name: 'motherGivenName',
      type: 'text',
      label: messages.motherGivenName,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherMiddleNames',
      type: 'text',
      label: messages.motherMiddleNames,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherFamilyName',
      type: 'text',
      label: messages.motherFamilyName,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherGivenNameEng',
      type: 'text',
      label: messages.motherGivenNameEng,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherMiddleNamesEng',
      type: 'text',
      label: messages.motherMiddleNamesEng,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherFamilyNameEng',
      type: 'text',
      label: messages.motherFamilyNameEng,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherDateOfBirth',
      type: 'date',
      label: messages.motherDateOfBirth,
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
      name: 'motherDateOfMarriage',
      type: 'date',
      label: maritalStatusMessages.dateOfMarriage,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherEducationAttainment',
      type: 'select',
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
      type: 'subSection',
      label: messages.currentAddress,
      initialValue: '',
      required: false,
      validate: []
    },
    {
      name: 'country',
      type: 'select',
      label: addressMessages.country,
      required: true,
      initialValue: '',
      validate: [],
      options: countries
    },
    {
      name: 'state',
      type: 'select',
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      options: states,
      conditionals: [conditionals.country]
    },
    {
      name: 'district',
      type: 'select',
      label: addressMessages.district,
      required: true,
      initialValue: '',
      validate: [],
      dynamicOptions: 'district',
      conditionals: [conditionals.country, conditionals.state]
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
        conditionals.country,
        conditionals.state,
        conditionals.district,
        conditionals.addressLine4,
        conditionals.addressLine3Options1
      ]
    },
    {
      name: 'permanentAddress',
      type: 'subSection',
      label: messages.permanentAddress,
      initialValue: '',
      required: false,
      validate: []
    },
    {
      name: 'countryPermanent',
      type: 'select',
      label: addressMessages.country,
      required: true,
      initialValue: '',
      validate: [],
      options: countries
    },
    {
      name: 'statePermanent',
      type: 'select',
      label: addressMessages.state,
      required: true,
      initialValue: '',
      validate: [],
      options: states,
      conditionals: [conditionals.countryPermanent]
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
      conditionals: [conditionals.countryPermanent, conditionals.statePermanent]
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
        conditionals.countryPermanent,
        conditionals.statePermanent,
        conditionals.districtPermanent,
        conditionals.addressLine4Permanent,
        conditionals.addressLine3Options1Permanent
      ]
    }
  ]
}
