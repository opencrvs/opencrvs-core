import { defineMessages } from 'react-intl'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
    defaultMessage: 'Area / Ward / Mouja / Village',
    description: 'Title for the address line 2'
  },
  addressLine3: {
    id: 'formFields.addressLine3',
    defaultMessage: 'Union / Municipality / Cantonement',
    description: 'Title for the address line 3 option 1'
  },
  addressLine3CityOption: {
    id: 'formFields.addressLine3CityOption',
    defaultMessage: 'Ward',
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
  },
  currentAddressSameAsPermanent: {
    id: 'formFields.currentAddressSameAsPermanent',
    defaultMessage: 'Is her current address the same as her permanent address?',
    description:
      'Title for the radio button to select that the mothers current address is the same as her permanent address'
  }
})
