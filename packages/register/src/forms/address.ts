import { defineMessages } from 'react-intl'

export const countryMessages = defineMessages({
  bd: {
    id: 'countries.bd',
    defaultMessage: 'Bangladesh',
    description: 'ISO Country: bd'
  },
  gb: {
    id: 'countries.gb',
    defaultMessage: 'United Kingdome',
    description: 'ISO Country: gb'
  }
})

export const stateMessages = defineMessages({
  greaterLondon: {
    id: 'states.greaterLondon',
    defaultMessage: 'Greater London',
    description: 'Test state'
  },
  wales: {
    id: 'states.wales',
    defaultMessage: 'Wales',
    description: 'Test state'
  }
})

export const districtMessages = defineMessages({
  wandsworth: {
    id: 'districts.wandsworth',
    defaultMessage: 'Wandsworth',
    description: 'Test state'
  },
  lambeth: {
    id: 'districts.lambeth',
    defaultMessage: 'lambeth',
    description: 'Test state'
  }
})

export const countries = [
  { value: 'BD', label: countryMessages.bd },
  { value: 'GB', label: countryMessages.gb }
]

export const states = [
  { value: 'Greater London', label: stateMessages.greaterLondon },
  { value: 'Wales', label: stateMessages.wales }
]

export const districts = [
  { value: 'Wandsworth', label: districtMessages.wandsworth },
  { value: 'Lambeth', label: districtMessages.lambeth }
]

export const messages = defineMessages({
  country: {
    id: 'formFields.country',
    defaultMessage: 'Country',
    description: 'Title for the country select'
  },
  state: {
    id: 'formFields.state',
    defaultMessage: 'State',
    description: 'Title for the state select'
  },
  district: {
    id: 'formFields.district',
    defaultMessage: 'District',
    description: 'Title for the district select'
  },
  addressLine1: {
    id: 'formFields.addressLine1',
    defaultMessage: 'Address Line 1',
    description: 'Title for the address line 1'
  },
  addressLine2: {
    id: 'formFields.addressLine2',
    defaultMessage: 'Address Line 2',
    description: 'Title for the address line 2'
  },
  addressLine3: {
    id: 'formFields.addressLine3',
    defaultMessage: 'Address Line 3',
    description: 'Title for the address line 3'
  },
  addressLine4: {
    id: 'formFields.addressLine4',
    defaultMessage: 'Address Line 4',
    description: 'Title for the address line 4'
  },
  postCode: {
    id: 'formFields.postCode',
    defaultMessage: 'Postcode',
    description: 'Title for the postcode field'
  },
  permanentAddress: {
    id: 'formFields.permanentAddress',
    defaultMessage: 'Is the permanent address the same as the current address?',
    description:
      'Question to set permanent address as the same as the current address.'
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
  addressSameAsMother: {
    id: 'formFields.addressSameAsMother',
    defaultMessage: "Is his current address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's current address is the same as the mother's address"
  },
  permanentAddressSameAsMother: {
    id: 'formFields.permanentAddressSameAsMother',
    defaultMessage: "Is his permanent address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's permanent address is the same as the mother's address"
  }
})

export const permanentAddressOption = {
  name: 'permanentAddress',
  type: 'radioGroup',
  label: messages.permanentAddress,
  required: true,
  initialValue: '',
  validate: [],
  options: [
    { value: '1', label: messages.confirm },
    { value: '0', label: messages.deny }
  ]
}

export const addressSameAsMother = {
  name: 'addressSameAsMother',
  type: 'radioGroup',
  label: messages.addressSameAsMother,
  required: true,
  initialValue: '',
  validate: [],
  options: [
    { value: '1', label: messages.confirm },
    { value: '0', label: messages.deny }
  ]
}

export const permanentAddressSameAsMother = {
  name: 'permanentAddressSameAsMother',
  type: 'radioGroup',
  label: messages.permanentAddressSameAsMother,
  required: true,
  initialValue: '',
  validate: [],
  options: [
    { value: '1', label: messages.confirm },
    { value: '0', label: messages.deny }
  ]
}

export const currentAddressFields = [
  {
    name: 'country',
    type: 'select',
    label: messages.country,
    required: true,
    initialValue: '',
    validate: [],
    options: countries
  },
  {
    name: 'state',
    type: 'select',
    label: messages.state,
    required: true,
    initialValue: '',
    validate: [],
    options: states
  },
  {
    name: 'district',
    type: 'select',
    label: messages.district,
    required: true,
    initialValue: '',
    validate: [],
    options: districts
  },
  {
    name: 'addressLine1',
    type: 'text',
    label: messages.addressLine1,
    required: true,
    initialValue: '',
    validate: []
  },
  {
    name: 'addressLine2',
    type: 'text',
    label: messages.addressLine2,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'addressLine3',
    type: 'text',
    label: messages.addressLine3,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'addressLine4',
    type: 'text',
    label: messages.addressLine4,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'postCode',
    type: 'text',
    label: messages.postCode,
    required: true,
    initialValue: '',
    validate: []
  }
]

export const permanentAddressFields = [
  {
    name: 'countryPermanent',
    type: 'select',
    label: messages.country,
    required: true,
    initialValue: '',
    validate: [],
    options: countries
  },
  {
    name: 'statePermanent',
    type: 'select',
    label: messages.state,
    required: true,
    initialValue: '',
    validate: [],
    options: states
  },
  {
    name: 'districtPermanent',
    type: 'select',
    label: messages.district,
    required: true,
    initialValue: '',
    validate: [],
    options: districts
  },
  {
    name: 'addressLine1Permanent',
    type: 'text',
    label: messages.addressLine1,
    required: true,
    initialValue: '',
    validate: []
  },
  {
    name: 'addressLine2Permanent',
    type: 'text',
    label: messages.addressLine2,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'addressLine3Permanent',
    type: 'text',
    label: messages.addressLine3,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'addressLine4Permanent',
    type: 'text',
    label: messages.addressLine4,
    required: false,
    initialValue: '',
    validate: []
  },
  {
    name: 'postCodePermanent',
    type: 'text',
    label: messages.postCode,
    required: true,
    initialValue: '',
    validate: []
  }
]
