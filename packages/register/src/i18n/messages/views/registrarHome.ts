import { defineMessages, MessageDescriptor } from 'react-intl'

interface IregistrationHomeMessages {
  dataTableResults: MessageDescriptor
  inProgress: MessageDescriptor
  inProgressFieldAgents: MessageDescriptor
  inProgressOwnDrafts: MessageDescriptor
  listItemAction: MessageDescriptor
  listItemApplicationDate: MessageDescriptor
  listItemRegisteredDate: MessageDescriptor
  readyForReview: MessageDescriptor
  readyToPrint: MessageDescriptor
  registrationNumber: MessageDescriptor
  sentForApprovals: MessageDescriptor
  sentForUpdates: MessageDescriptor
  validatedApplicationTooltipForRegistrar: MessageDescriptor
  validatedApplicationTooltipForRegistrationAgent: MessageDescriptor
}

const messagesToDefine: IregistrationHomeMessages = {
  dataTableResults: {
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component',
    id: 'register.registrationHome.table.label'
  },
  inProgress: {
    defaultMessage: 'In progress',
    description: 'The title of In progress',
    id: 'register.registrationHome.inProgress'
  },
  inProgressFieldAgents: {
    defaultMessage: 'Field agents',
    description: 'The title of In progress field agents',
    id: 'tab.inProgress.selector.field.agents'
  },
  inProgressOwnDrafts: {
    defaultMessage: 'Yours',
    description: 'The title of In progress own drafts',
    id: 'tab.inProgress.selector.own.drafts'
  },
  listItemAction: {
    defaultMessage: 'Action',
    description: 'Label for action in work queue list item',
    id: 'register.registrationHome.table.label.action'
  },
  listItemApplicationDate: {
    defaultMessage: 'Application sent',
    description: 'Label for application date in work queue list item',
    id: 'register.registrationHome.table.label.applicationDate'
  },
  listItemRegisteredDate: {
    defaultMessage: 'Application registered',
    description: 'Label for date of registration in work queue list item',
    id: 'register.registrationHome.table.label.registeredDate'
  },
  readyForReview: {
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review',
    id: 'register.registrationHome.readyForReview'
  },
  readyToPrint: {
    defaultMessage: 'Ready to print',
    description: 'The title of ready to print tab',
    id: 'register.registrationHome.readyToPrint'
  },
  registrationNumber: {
    defaultMessage: 'Registration no.',
    description: 'The heading of registration no. column',
    id: 'register.registrationHome.registrationNumber'
  },
  sentForApprovals: {
    defaultMessage: 'Sent for approval',
    description: 'The title of sent for approvals tab',
    id: 'register.registrationHome.sentForApprovals'
  },
  sentForUpdates: {
    defaultMessage: 'Sent for updates',
    description: 'The title of sent for updates tab',
    id: 'register.registrationHome.sentForUpdates'
  },
  validatedApplicationTooltipForRegistrar: {
    defaultMessage: 'Application has been validated by a registration agent',
    description: 'Text to display for validated application as tooltip',
    id: 'register.registrationHome.validated.registrar.tooltip'
  },
  validatedApplicationTooltipForRegistrationAgent: {
    defaultMessage: 'Application has been validated and waiting for approval',
    description: 'Text to display for validated application as tooltip',
    id: 'register.registrationHome.validated.registrationAgent.tooltip'
  }
}

export const messages: IregistrationHomeMessages = defineMessages(
  messagesToDefine
)
