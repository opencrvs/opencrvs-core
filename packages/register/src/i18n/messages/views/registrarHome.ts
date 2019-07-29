import { defineMessages } from 'react-intl'

interface IRegistrarHomeMessages {
  dataTableResults: ReactIntl.FormattedMessage.MessageDescriptor
  inProgress: ReactIntl.FormattedMessage.MessageDescriptor
  readyForReview: ReactIntl.FormattedMessage.MessageDescriptor
  sentForUpdates: ReactIntl.FormattedMessage.MessageDescriptor
  listItemApplicationDate: ReactIntl.FormattedMessage.MessageDescriptor
  listItemAction: ReactIntl.FormattedMessage.MessageDescriptor
  readyToPrint: ReactIntl.FormattedMessage.MessageDescriptor
  registrationNumber: ReactIntl.FormattedMessage.MessageDescriptor
  listItemRegisteredDate: ReactIntl.FormattedMessage.MessageDescriptor
  sentForApprovals: ReactIntl.FormattedMessage.MessageDescriptor
  validatedApplicationTooltipForRegistrationAgent: ReactIntl.FormattedMessage.MessageDescriptor
  validatedApplicationTooltipForRegistrar: ReactIntl.FormattedMessage.MessageDescriptor
  inProgressOwnDrafts: ReactIntl.FormattedMessage.MessageDescriptor
  inProgressFieldAgents: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IRegistrarHomeMessages = {
  validatedApplicationTooltipForRegistrar: {
    id: 'register.registrarHome.validated.registrar.tooltip',
    defaultMessage: 'Application has been validated by a registration agent',
    description: 'Text to display for validated application as tooltip'
  },
  inProgressFieldAgents: {
    id: 'tab.inProgress.selector.field.agents',
    defaultMessage: 'Field agents',
    description: 'The title of In progress field agents'
  },
  inProgressOwnDrafts: {
    id: 'tab.inProgress.selector.own.drafts',
    defaultMessage: 'Yours',
    description: 'The title of In progress own drafts'
  },
  validatedApplicationTooltipForRegistrationAgent: {
    id: 'register.registrarHome.validated.registrationAgent.tooltip',
    defaultMessage: 'Application has been validated and waiting for approval',
    description: 'Text to display for validated application as tooltip'
  },
  sentForApprovals: {
    id: 'register.registrarHome.sentForApprovals',
    defaultMessage: 'Sent for approval',
    description: 'The title of sent for approvals tab'
  },
  dataTableResults: {
    id: 'register.registrationHome.table.label',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  inProgress: {
    id: 'register.registrationHome.inProgress',
    defaultMessage: 'In progress',
    description: 'The title of In progress'
  },
  readyForReview: {
    id: 'register.registrationHome.readyForReview',
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review'
  },
  sentForUpdates: {
    id: 'register.registrationHome.sentForUpdates',
    defaultMessage: 'Sent for updates',
    description: 'The title of sent for updates tab'
  },
  listItemApplicationDate: {
    id: 'register.registrationHome.table.label.applicationDate',
    defaultMessage: 'Application sent',
    description: 'Label for application date in work queue list item'
  },
  listItemAction: {
    id: 'register.registrationHome.table.label.action',
    defaultMessage: 'Action',
    description: 'Label for action in work queue list item'
  },
  readyToPrint: {
    id: 'register.registrationHome.readyToPrint',
    defaultMessage: 'Ready to print',
    description: 'The title of ready to print tab'
  },
  registrationNumber: {
    id: 'register.registrationHome.registrationNumber',
    defaultMessage: 'Registration no.',
    description: 'The heading of registration no. column'
  },
  listItemRegisteredDate: {
    id: 'register.registrationHome.table.label.registeredDate',
    defaultMessage: 'Application registered',
    description: 'Label for date of registration in work queue list item'
  }
}

export const messages: IRegistrarHomeMessages = defineMessages(messagesToDefine)
