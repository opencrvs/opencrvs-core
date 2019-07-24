import { defineMessages } from 'react-intl'

interface IConstantsMessages {
  areYouSure: ReactIntl.FormattedMessage.MessageDescriptor
  performanceTitle: ReactIntl.FormattedMessage.MessageDescriptor
  applicationTitle: ReactIntl.FormattedMessage.MessageDescriptor
  name: ReactIntl.FormattedMessage.MessageDescriptor
  dob: ReactIntl.FormattedMessage.MessageDescriptor
  gender: ReactIntl.FormattedMessage.MessageDescriptor
  dateOfApplication: ReactIntl.FormattedMessage.MessageDescriptor
  mother: ReactIntl.FormattedMessage.MessageDescriptor
  father: ReactIntl.FormattedMessage.MessageDescriptor
  id: ReactIntl.FormattedMessage.MessageDescriptor
  applicationState: ReactIntl.FormattedMessage.MessageDescriptor
  by: ReactIntl.FormattedMessage.MessageDescriptor
  reason: ReactIntl.FormattedMessage.MessageDescriptor
  review: ReactIntl.FormattedMessage.MessageDescriptor
  birth: ReactIntl.FormattedMessage.MessageDescriptor
  death: ReactIntl.FormattedMessage.MessageDescriptor
  application: ReactIntl.FormattedMessage.MessageDescriptor
  declared: ReactIntl.FormattedMessage.MessageDescriptor
  rejected: ReactIntl.FormattedMessage.MessageDescriptor
  registered: ReactIntl.FormattedMessage.MessageDescriptor
  certified: ReactIntl.FormattedMessage.MessageDescriptor
  trackingId: ReactIntl.FormattedMessage.MessageDescriptor
}
const messagesToDefine: IConstantsMessages = {
  areYouSure: {
    id: 'constants.areYouSure',
    defaultMessage: 'Are you sure?',
    description: 'Description for are you sure label in modals'
  },
  performanceTitle: {
    id: 'constants.performance',
    defaultMessage: 'Performance',
    description: 'Performance title'
  },
  applicationTitle: {
    id: 'constants.applications',
    defaultMessage: 'Applications',
    description: 'Application title'
  },
  trackingId: {
    id: 'constants.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Search menu tracking id type'
  },
  name: {
    id: 'constants.name',
    defaultMessage: 'Name',
    description: 'Name label'
  },
  dob: {
    id: 'constants.dob',
    defaultMessage: 'D.o.B.',
    description: 'Date of birth label'
  },
  gender: {
    id: 'constants.gender',
    defaultMessage: 'Gender',
    description: 'Gender label'
  },
  dateOfApplication: {
    id: 'constants.dateOfApplication',
    defaultMessage: 'Date of application',
    description: 'Date of application label'
  },
  mother: {
    id: 'constants.mother',
    defaultMessage: 'Mother',
    description: 'Mother section label'
  },
  father: {
    id: 'constants.father',
    defaultMessage: 'Father',
    description: 'Father section label'
  },
  id: {
    id: 'constants.id',
    defaultMessage: 'ID',
    description: 'ID Label'
  },
  applicationState: {
    id: 'constants.applicationState',
    defaultMessage: 'Application {action} on',
    description: 'A label to describe when the application was actioned on'
  },
  by: {
    id: 'constants.by',
    defaultMessage: 'By',
    description: 'Label for By (the person who performed the action)'
  },
  reason: {
    id: 'constants.reason',
    defaultMessage: 'Reason',
    description: 'Label for Reason the application was rejected'
  },
  review: {
    id: 'constants.review',
    defaultMessage: 'Review',
    description: 'A label from the review button'
  },
  birth: {
    id: 'constants.birth',
    defaultMessage: 'Birth',
    description: 'A label from the birth event'
  },
  death: {
    id: 'constants.death',
    defaultMessage: 'Death',
    description: 'A label from the death event'
  },
  application: {
    id: 'constants.application',
    defaultMessage: 'application',
    description: 'A label for application'
  },
  declared: {
    id: 'constants.submitted',
    defaultMessage: 'submitted',
    description: 'A label for submitted'
  },
  rejected: {
    id: 'constants.rejected',
    defaultMessage: 'rejected',
    description: 'A label for rejected'
  },
  registered: {
    id: 'constants.registered',
    defaultMessage: 'registered',
    description: 'A label for registered'
  },
  certified: {
    id: 'constants.certified',
    defaultMessage: 'certified',
    description: 'A label for certified'
  }
}

export const constantsMessages: IConstantsMessages = defineMessages(
  messagesToDefine
)

interface IDynamicConstants {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
}

const dynamicMessagesToDefine: IDynamicConstants = {
  declared: {
    id: 'constants.submitted',
    defaultMessage: 'submitted',
    description: 'A label for submitted'
  },
  rejected: {
    id: 'constants.rejected',
    defaultMessage: 'rejected',
    description: 'A label for rejected'
  },
  registered: {
    id: 'constants.registered',
    defaultMessage: 'registered',
    description: 'A label for registered'
  },
  certified: {
    id: 'constants.certified',
    defaultMessage: 'certified',
    description: 'A label for certified'
  }
}

export const dynamicConstantsMessages: IDynamicConstants = defineMessages(
  dynamicMessagesToDefine
)
