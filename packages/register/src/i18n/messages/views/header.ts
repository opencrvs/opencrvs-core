import { defineMessages, MessageDescriptor } from 'react-intl'

interface IHeaderMessages {
  typeBrnDrn: MessageDescriptor
  typePhone: MessageDescriptor
  placeHolderTrackingId: MessageDescriptor
  placeHolderBrnDrn: MessageDescriptor
  placeHolderPhone: MessageDescriptor
  systemTitle: MessageDescriptor
  settingsTitle: MessageDescriptor
  helpTitle: MessageDescriptor
}

const messagesToDefine: IHeaderMessages = {
  typeBrnDrn: {
    id: 'home.header.typeBrnDrn',
    defaultMessage: 'BRN/DRN',
    description: 'Search menu brn drn type'
  },
  typePhone: {
    id: 'home.header.typePhone',
    defaultMessage: 'Phone No.',
    description: 'Search menu phone no type'
  },
  placeHolderTrackingId: {
    id: 'home.header.placeHolderTrackingId',
    defaultMessage: 'Enter Tracking ID',
    description: 'Search menu tracking id place holder'
  },
  placeHolderBrnDrn: {
    id: 'home.header.placeHolderBrnDrn',
    defaultMessage: 'Enter BRN/DRN',
    description: 'Search menu brn drn place holder'
  },
  placeHolderPhone: {
    id: 'home.header.placeHolderPhone',
    defaultMessage: 'Enter Phone No.',
    description: 'Search menu phone no place holder'
  },
  systemTitle: {
    id: 'home.header.systemTitle',
    defaultMessage: 'System',
    description: 'System title'
  },
  settingsTitle: {
    id: 'home.header.settingsTitle',
    defaultMessage: 'Settings',
    description: 'settings title'
  },
  helpTitle: {
    id: 'home.header.helpTitle',
    defaultMessage: 'Help',
    description: 'Help title'
  }
}

export const messages: IHeaderMessages = defineMessages(messagesToDefine)
