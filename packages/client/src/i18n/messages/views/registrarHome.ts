/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IOfficeHomeMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  dataTableResults: MessageDescriptor
  inProgress: MessageDescriptor
  inProgressFieldAgents: MessageDescriptor
  inProgressOwnDrafts: MessageDescriptor
  hospitalDrafts: MessageDescriptor
  listItemAction: MessageDescriptor
  listItemDeclarationDate: MessageDescriptor
  listItemRegisteredDate: MessageDescriptor
  readyForReview: MessageDescriptor
  readyToPrint: MessageDescriptor
  registrationNumber: MessageDescriptor
  sentForApprovals: MessageDescriptor
  sentForUpdates: MessageDescriptor
  validatedDeclarationTooltipForRegistrar: MessageDescriptor
  validatedDeclarationTooltipForRegistrationAgent: MessageDescriptor
}

const messagesToDefine: IOfficeHomeMessages = {
  dataTableResults: {
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component',
    id: 'regHome.table.label'
  },
  inProgress: {
    defaultMessage: 'In progress',
    description: 'The title of In progress',
    id: 'regHome.inProgress'
  },
  inProgressFieldAgents: {
    defaultMessage: 'Field agents',
    description: 'The title of In progress field agents',
    id: 'regHome.inPro.selector.field.agents'
  },
  inProgressOwnDrafts: {
    defaultMessage: 'My Drafts',
    description: 'The title of In progress own drafts',
    id: 'regHome.inPro.selector.own.drafts'
  },
  hospitalDrafts: {
    defaultMessage: 'Health System',
    description: 'The title of In progress Hospitals',
    id: 'regHome.inPro.selector.hospital.drafts'
  },
  listItemAction: {
    defaultMessage: 'Action',
    description: 'Label for action in work queue list item',
    id: 'regHome.table.label.action'
  },
  listItemDeclarationDate: {
    defaultMessage: 'Declaration sent',
    description: 'Label for declaration date in work queue list item',
    id: 'regHome.table.label.declarationDate'
  },
  listItemRegisteredDate: {
    defaultMessage: 'Declaration registered',
    description: 'Label for date of registration in work queue list item',
    id: 'regHome.table.label.registeredDate'
  },
  readyForReview: {
    defaultMessage: 'Ready for review',
    description: 'The title of ready for review',
    id: 'regHome.readyForReview'
  },
  readyToPrint: {
    defaultMessage: 'Ready to print',
    description: 'The title of ready to print tab',
    id: 'regHome.readyToPrint'
  },
  registrationNumber: {
    defaultMessage: 'Registration no.',
    description: 'The heading of registration no. column',
    id: 'regHome.registrationNumber'
  },
  sentForApprovals: {
    defaultMessage: 'Sent for approval',
    description: 'The title of sent for approvals tab',
    id: 'regHome.sentForApprovals'
  },
  sentForUpdates: {
    defaultMessage: 'Sent for updates',
    description: 'The title of sent for updates tab',
    id: 'regHome.sentForUpdates'
  },
  validatedDeclarationTooltipForRegistrar: {
    defaultMessage: 'Declaration has been validated by a registration agent',
    description: 'Text to display for validated declaration as tooltip',
    id: 'regHome.validated.registrar.tooltip'
  },
  validatedDeclarationTooltipForRegistrationAgent: {
    defaultMessage: 'Declaration has been validated and waiting for approval',
    description: 'Text to display for validated declaration as tooltip',
    id: 'regHome.val.regAgent.tooltip'
  },
}

export const messages: IOfficeHomeMessages = defineMessages(messagesToDefine)
