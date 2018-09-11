import { defineMessages } from 'react-intl'
import { ValidIndicator } from '@opencrvs/components/lib/forms'
import { ViewType } from 'src/forms'

export interface IMotherSectionFormData {
  firstName: string
}

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
  motherIDType: {
    id: 'formFields.mother.motherIDType',
    defaultMessage: 'Type of ID',
    description: 'Label for form field: Type of ID'
  },
  motherIDTypePassport: {
    id: 'formFields.mother.motherIDTypePassport',
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID'
  },
  motherIDTypeNationalID: {
    id: 'formFields.mother.motherIDTypeNationalID',
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID'
  },
  motherIDTypeDrivingLicence: {
    id: 'formFields.mother.motherIDTypeDrivingLicence',
    defaultMessage: 'Drivers Licence',
    description: 'Option for form field: Type of ID'
  },
  motherIDTypeBRN: {
    id: 'formFields.mother.motherIDTypeBRN',
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID'
  },
  motherIDTypeDRN: {
    id: 'formFields.mother.motherIDTypeDRN',
    defaultMessage: 'Death Registration Number',
    description: 'Option for form field: Type of ID'
  },
  motherIDTypeRefugeeNumber: {
    id: 'formFields.mother.motherIDTypeRefugeeNumber',
    defaultMessage: 'Refugee Number',
    description: 'Option for form field: Type of ID'
  },
  motherIDTypeAlienNumber: {
    id: 'formFields.mother.motherIDTypeAlienNumber',
    defaultMessage: 'Alien Number',
    description: 'Option for form field: Type of ID'
  },
  motherID: {
    id: 'formFields.mother.motherID',
    defaultMessage: 'NID number',
    description: 'Label for form field: NID number'
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
  motherMaritalStatus: {
    id: 'formFields.motherMaritalStatus',
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status'
  },
  motherMaritalStatusSingle: {
    id: 'formFields.motherMaritalStatusSingle',
    defaultMessage: 'Single',
    description: 'Option for form field: Marital status'
  },
  motherMaritalStatusMarried: {
    id: 'formFields.motherMaritalStatusMarried',
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status'
  },
  motherMaritalStatusWidowed: {
    id: 'formFields.motherMaritalStatusWidowed',
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status'
  },
  motherMaritalStatusDivorced: {
    id: 'formFields.motherMaritalStatusDivorced',
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status'
  },
  motherMaritalStatusNotStated: {
    id: 'formFields.motherMaritalStatusNotStated',
    defaultMessage: 'Not stated',
    description: 'Option for form field: Marital status'
  },
  motherDateOfMarriage: {
    id: 'formFields.motherDateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage'
  },
  motherEducationAttainment: {
    id: 'formFields.motherEducationAttainment',
    defaultMessage: "Mother's level of formal education attained",
    description: 'Label for form field: Mother education'
  },
  motherEducationAttainmentNone: {
    id: 'formFields.motherEducationAttainmentNone',
    defaultMessage: 'No schooling',
    description: 'Option for form field: Mother education'
  },
  motherEducationAttainmentISCED1: {
    id: 'formFields.motherEducationAttainmentISCED1',
    defaultMessage: 'Primary',
    description: 'Option for form field: Mother education'
  },
  motherEducationAttainmentISCED2: {
    id: 'formFields.motherEducationAttainmentISCED2',
    defaultMessage: 'Lower secondary',
    description: 'Option for form field: Mother education'
  },
  motherEducationAttainmentISCED3: {
    id: 'formFields.motherEducationAttainmentISCED3',
    defaultMessage: 'Upper secondary',
    description: 'Option for form field: Mother education'
  },
  motherEducationAttainmentISCED4: {
    id: 'formFields.motherEducationAttainmentISCED4',
    defaultMessage: 'Post secondary',
    description: 'Option for form field: Mother education'
  },
  motherEducationAttainmentISCED5: {
    id: 'formFields.motherEducationAttainmentISCED5',
    defaultMessage: 'First stage tertiary',
    description: 'Option for form field: Mother education'
  },
  motherEducationAttainmentISCED6: {
    id: 'formFields.motherEducationAttainmentISCED6',
    defaultMessage: 'Second stage tertiary',
    description: 'Option for form field: Mother education'
  },
  motherEducationAttainmentNotStated: {
    id: 'formFields.motherEducationAttainmentNotStated',
    defaultMessage: 'Not stated',
    description: 'Option for form field: Mother education'
  }
})

export const motherSection = {
  id: 'mother',
  viewType: 'form' as ViewType,
  name: messages.motherTab,
  title: messages.motherTitle,
  fields: [
    {
      name: 'motherIDType',
      type: 'select',
      label: messages.motherIDType,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'PASSPORT', label: messages.motherIDTypePassport },
        { value: 'NATIONAL_ID', label: messages.motherIDTypeNationalID },
        {
          value: 'DRIVING_LICENCE',
          label: messages.motherIDTypeDrivingLicence
        },
        { value: 'BIRTH_REGISTRATION_NUMBER', label: messages.motherIDTypeBRN },
        { value: 'DEATH_REGISTRATION_NUMBER', label: messages.motherIDTypeDRN },
        { value: 'REFUGEE_NUMBER', label: messages.motherIDTypeRefugeeNumber },
        { value: 'ALIEN_NUMBER', label: messages.motherIDTypeAlienNumber }
      ]
    },
    {
      name: 'motherID',
      type: 'text',
      label: messages.motherID,
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
      label: messages.motherMaritalStatus,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'SINGLE', label: messages.motherMaritalStatusSingle },
        { value: 'MARRIED', label: messages.motherMaritalStatusMarried },
        { value: 'WIDOWED', label: messages.motherMaritalStatusWidowed },
        { value: 'DIVORCED', label: messages.motherMaritalStatusDivorced },
        { value: 'NOT_STATED', label: messages.motherMaritalStatusNotStated }
      ]
    },
    {
      name: 'motherDateOfMarriage',
      type: 'date',
      label: messages.motherDateOfMarriage,
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
          label: messages.motherEducationAttainmentNone
        },
        {
          value: 'PRIMARY_ISCED_1',
          label: messages.motherEducationAttainmentISCED1
        },
        {
          value: 'LOWER_SECONDARY_ISCED_2',
          label: messages.motherEducationAttainmentISCED2
        },
        {
          value: 'UPPER_SECONDARY_ISCED_3',
          label: messages.motherEducationAttainmentISCED3
        },
        {
          value: 'POST_SECONDARY_ISCED_4',
          label: messages.motherEducationAttainmentISCED4
        },
        {
          value: 'FIRST_STAGE_TERTIARY_ISCED_5',
          label: messages.motherEducationAttainmentISCED5
        },
        {
          value: 'SECOND_STAGE_TERTIARY_ISCED_6',
          label: messages.motherEducationAttainmentISCED6
        },
        {
          value: 'NOT_STATED',
          label: messages.motherEducationAttainmentNotStated
        }
      ]
    }
    // TODO: add address when component is ready
  ]
}
