import { defineMessages } from 'react-intl'

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
    defaultMessage: "Type of ID",
    description: "Label for form field: Type of ID"
  },
  motherID: {
    id: 'formFields.mother.motherID',
    defaultMessage: "NID number",
    description: "Label for form field: NID number"
  },
  nationality: {
    id: 'formFields.mother.nationality',
    defaultMessage: "Nationality",
    description: "Label for form field: Nationality"
  },
  nationalityBangladesh: {
    id: 'formFields.mother.nationalityBangladesh',
    defaultMessage: "Bangladesh",
    description: "Option for form field: Nationality"
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
  }
})

export const motherSection = {
  id: 'mother',
  name: messages.motherTab,
  title: messages.motherTitle,
  fields: [
    {
      name: 'motherIDType',
      type: 'select',
      label: messages.motherIDType,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherID',
      type: 'text',
      label: messages.motherID,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'nationality',
      type: 'select',
      label: messages.nationality,
      required: true,
      initialValue: 'bg',
      validate: [],
      options: [
        { value: 'bg', label: messages.nationalityBangladesh }
      ]
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
  ]
}
