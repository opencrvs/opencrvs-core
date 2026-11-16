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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  draftsSaved: {
    defaultMessage: 'Your draft has been saved',
    description:
      'The message that appears in notification when save drafts button is clicked',
    id: 'misc.notif.draftsSaved'
  },
  updatePINSuccess: {
    defaultMessage: 'Your pin has been successfully updated',
    description: 'Label for update PIN success notification toast',
    id: 'misc.notif.updatePINSuccess'
  },
  retry: {
    id: 'regHome.outbox.retry',
    defaultMessage: 'Retry',
    description:
      'Copy for "Retry" button in Outbox shown for records that failed to send'
  },
  userAuditSuccess: {
    defaultMessage:
      '{name} was {action, select, DEACTIVATE {deactivated} REACTIVATE {reactivated} other {deactivated}}',
    description: 'Label for user audit success notification',
    id: 'misc.notif.userAuditSuccess'
  },
  userFormFail: {
    defaultMessage: 'Sorry! Something went wrong',
    description:
      'The message that appears in notification when a new user creation fails',
    id: 'misc.notif.sorryError'
  },
  userFormFailForOffline: {
    defaultMessage: 'Offline. Try again when reconnected',
    description:
      'The message that appears in notification when a new user creation fails in offline mode',
    id: 'misc.notif.offlineError'
  },
  userFormSuccess: {
    defaultMessage: 'New user created',
    description:
      'The message that appears in notification when a new user is created',
    id: 'misc.notif.userFormSuccess'
  },
  userFormUpdateSuccess: {
    defaultMessage: 'User details have been updated',
    description:
      'The message that appears in notification when user details have been updated',
    id: 'misc.notif.userFormUpdateSuccess'
  },
  failed: {
    defaultMessage: 'Failed to send',
    description: 'Label for declaration status failed',
    id: 'regHome.outbox.failed'
  },
  downloadDeclarationFailed: {
    defaultMessage: 'Failed to download declaration. Please try again',
    description: 'Label for declaration downloading failed',
    id: 'regHome.workqueue.downloadDeclarationFailed'
  },
  unassigned: {
    defaultMessage: 'You were unassigned from {trackingId}',
    id: 'misc.notif.unassign',
    description: 'Label for unassigned toast notification'
  },
  onlineUserStatus: {
    defaultMessage: 'You are back online',
    id: 'misc.notif.onlineUserStatus',
    description: 'Label for online user status toast notification'
  },
  duplicateRecord: {
    defaultMessage:
      '{trackingId} is a potential duplicate. Record is ready for review.',
    id: 'misc.notif.duplicateRecord',
    description:
      'Label for when a duplicate record is detected when registering a record.'
  },
  emailAllUsersSuccess: {
    id: 'misc.notif.emailAllUsersSuccess',
    defaultMessage: 'Email sent to all users',
    description: 'Label for Email all users success toast'
  },
  emailAllUsersError: {
    id: 'misc.notif.emailAllUsersError',
    defaultMessage: 'Only one email can be sent per day',
    description: 'Label for Email all users error toast'
  }
}

export const messages = defineMessages(messagesToDefine)
