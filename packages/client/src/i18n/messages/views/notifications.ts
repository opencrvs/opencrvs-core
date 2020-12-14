/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { defineMessages, MessageDescriptor } from 'react-intl'

interface INotificationsMessages {
  declarationsSynced: MessageDescriptor
  draftsSaved: MessageDescriptor
  outboxText: MessageDescriptor
  processingText: MessageDescriptor
  statusRegistering: MessageDescriptor
  statusRejecting: MessageDescriptor
  statusSubmitting: MessageDescriptor
  statusWaitingToRegister: MessageDescriptor
  statusWaitingToReject: MessageDescriptor
  statusWaitingToSubmit: MessageDescriptor
  userAuditSuccess: MessageDescriptor
  userFormFail: MessageDescriptor
  userFormSuccess: MessageDescriptor
  userFormUpdateSuccess: MessageDescriptor
  waitingToRetry: MessageDescriptor
}

const messagesToDefine: INotificationsMessages = {
  declarationsSynced: {
    defaultMessage:
      'As you have connectivity, we can synchronize your applications.',
    description:
      'The message that appears in notification when background sync takes place',
    id: 'notification.declarationsSynced'
  },
  draftsSaved: {
    defaultMessage: 'Your draft has been saved',
    description:
      'The message that appears in notification when save drafts button is clicked',
    id: 'notification.draftsSaved'
  },
  outboxText: {
    defaultMessage: 'Outbox({num})',
    description: 'Application outbox text',
    id: 'notification.outboxText'
  },
  processingText: {
    defaultMessage: '{num} application processing...',
    description: 'Application processing text',
    id: 'notification.processingText'
  },
  statusRegistering: {
    defaultMessage: 'Registering...',
    description: 'Label for application status Registering',
    id: 'regHome.outbox.statusRegistering'
  },
  statusRejecting: {
    defaultMessage: 'Rejecting...',
    description: 'Label for application status Rejecting',
    id: 'regHome.outbox.statusRejecting'
  },
  statusSubmitting: {
    defaultMessage: 'Submitting...',
    description: 'Label for application status submitting',
    id: 'regHome.outbox.statusSubmitting'
  },
  statusWaitingToRegister: {
    defaultMessage: 'Waiting to register',
    description: 'Label for application status waiting for register',
    id: 'regHome.outbox.statusWaitingToRegister'
  },
  statusWaitingToReject: {
    defaultMessage: 'Waiting to reject',
    description: 'Label for application status waiting for reject',
    id: 'regHome.outbox.statusWaitingToReject'
  },
  statusWaitingToSubmit: {
    defaultMessage: 'Waiting to submit',
    description: 'Label for application status waiting for reject',
    id: 'regHome.outbox.statusWaitingToSubmit'
  },
  userAuditSuccess: {
    defaultMessage:
      '{name} was {action, select, DEACTIVATE {deactivated} REACTIVATE {reactivated}}',
    description: 'Label for user audit success notification',
    id: 'notification.userAuditSuccess'
  },
  userFormFail: {
    defaultMessage: 'Sorry! Something went wrong',
    description:
      'The message that appears in notification when a new user creation fails',
    id: 'notification.sorryError'
  },
  userFormSuccess: {
    defaultMessage: 'New user created',
    description:
      'The message that appears in notification when a new user is created',
    id: 'notification.userFormSuccess'
  },
  userFormUpdateSuccess: {
    defaultMessage: 'User details have been updated',
    description:
      'The message that appears in notification when user details have been updated',
    id: 'notification.userFormUpdateSuccess'
  },
  waitingToRetry: {
    defaultMessage: 'Waiting to retry',
    description: 'Label for application status waiting for connection',
    id: 'regHome.outbox.waitingToRetry'
  }
}

export const messages: INotificationsMessages = defineMessages(messagesToDefine)
