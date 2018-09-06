import { defineMessages } from 'react-intl'

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

export const wards = defineMessages({
  ward1: {
    id: 'wards.ward1',
    defaultMessage: 'ward1',
    description: 'Test ward1'
  },
  ward2: {
    id: 'wards.ward2',
    defaultMessage: 'ward2',
    description: 'Test ward2'
  }
})

export const unions = defineMessages({
  union1: {
    id: 'unions.union1',
    defaultMessage: 'union1',
    description: 'Test union1'
  },
  union2: {
    id: 'unions.union2',
    defaultMessage: 'union2',
    description: 'Test union2'
  }
})

export const upazilas = defineMessages({
  upazila1: {
    id: 'upazilas.upazila1',
    defaultMessage: 'upazila1',
    description: 'Test upazila1'
  },
  upazila2: {
    id: 'upazilas.upazila2',
    defaultMessage: 'upazila2',
    description: 'Test upazila2'
  }
})

export const states = [
  { value: 'Greater London', label: stateMessages.greaterLondon },
  { value: 'Wales', label: stateMessages.wales }
]

export const districts = [
  { value: 'Wandsworth', label: districtMessages.wandsworth },
  { value: 'Lambeth', label: districtMessages.lambeth }
]

export const addressLine3Options1 = [
  { value: 'ward1', label: wards.ward1 },
  { value: 'ward2', label: wards.ward2 }
]

export const addressLine3Options2 = [
  { value: 'union1', label: unions.union1 },
  { value: 'union2', label: unions.union2 }
]

export const addressLine4Options = [
  { value: 'upazila1', label: upazilas.upazila1 },
  { value: 'upazila2', label: upazilas.upazila2 }
]

export const messages = defineMessages({
  country: {
    id: 'formFields.country',
    defaultMessage: 'Country',
    description: 'Title for the country select'
  },
  state: {
    id: 'formFields.state',
    defaultMessage: 'Division',
    description: 'Title for the state select'
  },
  district: {
    id: 'formFields.district',
    defaultMessage: 'District',
    description: 'Title for the district select'
  },
  addressLine1: {
    id: 'formFields.addressLine1',
    defaultMessage: 'Street and house number',
    description: 'Title for the address line 1'
  },
  addressLine2: {
    id: 'formFields.addressLine2',
    defaultMessage: 'Area / Mouja / Village',
    description: 'Title for the address line 2'
  },
  addressLine3Options1: {
    id: 'formFields.addressLine3Options1',
    defaultMessage: 'Ward / Cantonement',
    description: 'Title for the address line 3 option 1'
  },
  addressLine3Options2: {
    id: 'formFields.addressLine3Options2',
    defaultMessage: 'Union / Cantonement',
    description: 'Title for the address line 3 option 2'
  },
  addressLine4: {
    id: 'formFields.addressLine4',
    defaultMessage: 'Upazila (Thana) / City',
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
