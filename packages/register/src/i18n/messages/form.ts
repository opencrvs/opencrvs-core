import { defineMessages } from 'react-intl'

interface IFormMessages {
  uploadedList: ReactIntl.FormattedMessage.MessageDescriptor
  optionalLabel: ReactIntl.FormattedMessage.MessageDescriptor
  searchFieldModalTitle: ReactIntl.FormattedMessage.MessageDescriptor
  officeLocationId: ReactIntl.FormattedMessage.MessageDescriptor
  changeAssignedOffice: ReactIntl.FormattedMessage.MessageDescriptor
  searchFieldPlaceHolderText: ReactIntl.FormattedMessage.MessageDescriptor
}
const messagesToDefine: IFormMessages = {
  uploadedList: {
    id: 'form.field.label.imageUpload.uploadedList',
    defaultMessage: 'Uploaded:',
    description: 'label for uploaded list'
  },
  optionalLabel: {
    id: 'form.field.label.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  searchFieldModalTitle: {
    id: 'form.field.SearchField.modalTitle',
    defaultMessage: `{fieldName, select, registrationOffice {Assigned Register Office}}`,
    description: 'Modal title'
  },
  officeLocationId: {
    id: 'form.field.SearchField.officeLocationId',
    defaultMessage: 'Id: {locationId}',
    description: 'The location Id column'
  },
  changeAssignedOffice: {
    id: 'form.field.SearchField.changeAssignedOffice',
    defaultMessage: 'Change assigned office',
    description: 'Edit button text'
  },
  searchFieldPlaceHolderText: {
    id: 'form.field.SearchField.placeHolderText',
    defaultMessage: 'Search',
    description: 'Place holder text '
  }
}

export const formMessages: IFormMessages = defineMessages(messagesToDefine)
