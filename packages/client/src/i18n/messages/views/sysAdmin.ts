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

interface ISysAdminMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  auditReason: MessageDescriptor
  auditReasonOther: MessageDescriptor
  overviewTab: MessageDescriptor
  officesTab: MessageDescriptor
  usersTab: MessageDescriptor
  comments: MessageDescriptor
  deactivate: MessageDescriptor
  deactivateReasonNotEmployee: MessageDescriptor
  deactivateReasonInvestigated: MessageDescriptor
  deactivateUserTitle: MessageDescriptor
  deactivateUserSubtitle: MessageDescriptor
  devicesTab: MessageDescriptor
  formError: MessageDescriptor
  networkTab: MessageDescriptor
  configTab: MessageDescriptor
  systemTitle: MessageDescriptor
  editUserDetailsTitle: MessageDescriptor
  editUserCommonTitle: MessageDescriptor
  reactivate: MessageDescriptor
  reactivateUserTitle: MessageDescriptor
  resetUserPasswordTitle: MessageDescriptor
  resetUserPasswordModalTitle: MessageDescriptor
  resetUserPasswordModalMessage: MessageDescriptor
  reactivateUserSubtitle: MessageDescriptor
  reactivateReasonReturnedToRole: MessageDescriptor
  reactivateReasonNoLongerInvestigated: MessageDescriptor
  resendInvite: MessageDescriptor
  resendInviteSuccess: MessageDescriptor
  resendInviteError: MessageDescriptor
  sendUsernameReminderInvite: MessageDescriptor
  sendUsernameReminderInviteSuccess: MessageDescriptor
  sendUsernameReminderInviteError: MessageDescriptor
  sendUsernameReminderInviteModalMessage: MessageDescriptor
  sendUsernameReminderInviteModalTitle: MessageDescriptor
  resetPasswordSuccess: MessageDescriptor
  resetPasswordError: MessageDescriptor
  newUser: MessageDescriptor
  active: MessageDescriptor
  pending: MessageDescriptor
  disabled: MessageDescriptor
  deactivated: MessageDescriptor
  totalUsers: MessageDescriptor
}

const messagesToDefine: ISysAdminMessages = {
  auditReason: {
    id: 'sysAdHome.user.audit.reason',
    defaultMessage: 'Please provide a reason: ',
    description: 'The label for form field deactivate reason'
  },
  auditReasonOther: {
    id: 'sysAdHome.user.audit.reasonOther',
    defaultMessage: 'Other (please provide a reason in the comments)',
    description: 'The label for radio option other'
  },
  overviewTab: {
    id: 'sysAdHome.overview',
    defaultMessage: 'Overview',
    description: 'The title of overview tab'
  },
  officesTab: {
    id: 'sysAdHome.offices',
    defaultMessage: 'Offices',
    description: 'The title of offices tab'
  },
  usersTab: {
    id: 'sysAdHome.users',
    defaultMessage: 'Users',
    description: 'The title of users tab'
  },
  comments: {
    id: 'sysAdHome.user.audit.comments',
    defaultMessage: 'Comments: ',
    description: 'The label for form field deactivate comments'
  },
  deactivate: {
    defaultMessage: 'Deactivate',
    description: 'Label for toggle menu option deactivate',
    id: 'sysAdHome.user.deactivate'
  },
  deactivateReasonNotEmployee: {
    id: 'sysAdHome.user.audit.deactiv.reasonNotEmp',
    defaultMessage: 'No longer an employee',
    description: 'The label for radio option not employee'
  },
  deactivateReasonInvestigated: {
    id: 'sysAdHome.user.audit.deactiv.reasonInv',
    defaultMessage:
      'Being investigated due to suspicious activity on their account',
    description: 'The label for radio option being investigated'
  },
  deactivateUserTitle: {
    id: 'sysAdHome.user.audit.deactivation.title',
    defaultMessage: 'Deactivate {name}?',
    description: 'The title of user deactivation confirmation modal'
  },
  deactivateUserSubtitle: {
    id: 'sysAdHome.user.audit.deactivation.subtitle',
    defaultMessage:
      'This will revoke {name}’s ability to login and access the system. The account can be reactivated at a later date.',
    description: 'The subtitle of user deactivation confirmation modal'
  },
  devicesTab: {
    id: 'sysAdHome.devices',
    defaultMessage: 'Devices',
    description: 'The title of devices tab'
  },
  formError: {
    id: 'sysAdHome.user.audit.form.error',
    defaultMessage: 'A reason is required for {auditAction} this user',
    description: 'The label for form error'
  },
  networkTab: {
    id: 'sysAdHome.network',
    defaultMessage: 'Network',
    description: 'The title of network tab'
  },
  configTab: {
    id: 'sysAdHome.config',
    defaultMessage: 'Config',
    description: 'The title of config tab'
  },
  systemTitle: {
    id: 'home.header.systemTitle',
    defaultMessage: 'System',
    description: 'System title'
  },
  editUserDetailsTitle: {
    defaultMessage: 'Edit details',
    description: 'Title for edit user details',
    id: 'sysAdHome.user.header'
  },
  editUserCommonTitle: {
    defaultMessage: 'Edit user',
    description: 'Common title of form view groups when edit user',
    id: 'sysAdHome.user.edit.commonGroupTitle'
  },
  resetUserPasswordTitle: {
    defaultMessage: 'Reset Password',
    description: 'Title for reset user password',
    id: 'sysAdHome.user.resetpassword.title'
  },
  resetUserPasswordModalTitle: {
    defaultMessage: 'Reset password?',
    description: 'Title for reset user password modal',
    id: 'sysAdHome.user.resetPasswordModal.title'
  },
  resetUserPasswordModalMessage: {
    id: 'sysAdHome.user.resetPasswordModal.message',
    defaultMessage:
      'The user will receive a temporary password via {deliveryMethod} sent to {recipient}. They will then be prompted to create a new password on successful login',
    description: 'Message for reset password modal'
  },
  reactivateUserTitle: {
    id: 'sysAdHome.user.audit.reactivation.title',
    defaultMessage: 'Reactivate {name}?',
    description: 'The title of user reactivation confirmation modal'
  },
  reactivateUserSubtitle: {
    id: 'sysAdHome.user.audit.reactivation.subtitle',
    defaultMessage:
      'This will reactivate {name}’s ability to login and access the system.',
    description: 'The subtitle of user reactivation confirmation modal'
  },
  reactivate: {
    defaultMessage: 'Reactivate',
    description: 'Label for toggle menu option reactivate',
    id: 'sysAdHome.user.reactivate'
  },
  reactivateReasonReturnedToRole: {
    defaultMessage: 'Returned to their role',
    description: 'The label for radio option Returned to role',
    id: 'sysAdHome.user.audit.reactiv.returned'
  },
  reactivateReasonNoLongerInvestigated: {
    defaultMessage: 'No longer being investigated for suspicious activity',
    description: 'The label for radio option no longer investigated',
    id: 'sysAdHome.user.audit.reactiv.noLongerInv'
  },
  resendInvite: {
    defaultMessage: 'Resend invite',
    description: 'The label for menu option resend invitation',
    id: 'sysAdHome.resendInvite'
  },
  resendInviteSuccess: {
    defaultMessage: 'Invite sent',
    description: 'The label for success notification of resend invite',
    id: 'sysAdHome.resendInviteSuccess'
  },
  resendInviteError: {
    defaultMessage: 'Invite could not be sent',
    description: 'The label for error notification of resend invite',
    id: 'sysAdHome.resendInviteError'
  },
  sendUsernameReminderInvite: {
    defaultMessage: 'Send username reminder',
    description: 'The label for menu option to send username reminder',
    id: 'sysAdHome.sendUsernameReminderInvite'
  },
  sendUsernameReminderInviteSuccess: {
    defaultMessage: 'Username reminder sent to {name}',
    description: 'The label for success notification of send username reminder',
    id: 'sysAdHome.sendUsernameReminderInviteSuccess'
  },
  sendUsernameReminderInviteError: {
    defaultMessage: 'Username reminder could not be sent',
    description: 'The label for error notification of send username reminder',
    id: 'sysAdHome.sendUsernameReminderInviteError'
  },
  sendUsernameReminderInviteModalTitle: {
    defaultMessage: 'Send username reminder?',
    description: 'Title for send username reminder',
    id: 'sysAdHome.sendUsernameReminderInviteModalTitle'
  },
  sendUsernameReminderInviteModalMessage: {
    defaultMessage:
      'The user will receive a username reminder via an {deliveryMethod} sent to {recipient}',
    description: 'Message for send username reminder',
    id: 'sysAdHome.sendUsernameReminderInviteModalMessage'
  },
  resetPasswordSuccess: {
    defaultMessage: 'Temporary password sent to {username}',
    description:
      'The label for success notification of reset password sms invite',
    id: 'sysAdHome.resentPasswordSuccess'
  },
  resetPasswordError: {
    defaultMessage: 'Temporary password could not be sent',
    description:
      'The label for error notification of reset password sms invite',
    id: 'sysAdHome.resentPasswordError'
  },
  newUser: {
    defaultMessage: 'New User',
    description: 'This text will show to create new user button',
    id: 'system.user.newUser'
  },
  active: {
    defaultMessage: 'Active',
    description: 'Pill label for active user',
    id: 'system.user.active'
  },
  pending: {
    defaultMessage: 'Pending',
    description: 'Pill label for pending user',
    id: 'system.user.pending'
  },
  disabled: {
    defaultMessage: 'Disabled',
    description: 'Pill label for disabled user',
    id: 'system.user.disabled'
  },
  deactivated: {
    defaultMessage: 'Deactivated',
    description: 'Pill label for deactivated user',
    id: 'system.user.deactivated'
  },
  totalUsers: {
    id: 'system.user.total',
    defaultMessage: '{totalUser} users',
    description: 'User list table header text'
  }
}

export const messages: ISysAdminMessages = defineMessages(messagesToDefine)
