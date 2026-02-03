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

export const messages = defineMessages({
  confirmPassword: {
    defaultMessage: 'Confirm new password',
    description: 'Confirm password label',
    id: 'password.label.confirm'
  },
  hasCases: {
    defaultMessage: 'At least one upper and lower case character',
    description: 'Password validation',
    id: 'password.cases'
  },
  hasNumber: {
    defaultMessage: 'At least one number',
    description: 'Password validation',
    id: 'password.number'
  },
  header: {
    defaultMessage: 'Choose a new password',
    description: 'New Password header',
    id: 'misc.newPass.header'
  },
  instruction: {
    defaultMessage: `Create a unique password - one that you don't use for other websites or applications. A secure and easy to remember passphrase could include three random words, while avoiding the use of personal info.`,
    description: 'New Password instruction',
    id: 'misc.newPass.instruction'
  },
  labelAssignedOffice: {
    defaultMessage: 'Assigned office',
    description: 'Assigned office',
    id: 'settings.user.label.assignedOffice'
  },
  labelBanglaName: {
    defaultMessage: 'Bengali name',
    id: 'settings.user.label.nameBN'
  },
  labelEnglishName: {
    defaultMessage: 'Full name',
    id: 'settings.user.label.nameEN'
  },
  match: {
    defaultMessage: 'Passwords match',
    description: 'Password validation',
    id: 'password.match'
  },
  minLength: {
    defaultMessage: '{min} characters minimum',
    description: 'Password validation',
    id: 'password.minLength'
  },
  mismatch: {
    defaultMessage: 'Passwords do not match',
    description: 'Password validation',
    id: 'password.mismatch'
  },
  newPassword: {
    defaultMessage: 'New password:',
    description: 'New password label',
    id: 'password.label.new'
  },
  passwordRequired: {
    defaultMessage: 'New password is not valid',
    description: 'New password required',
    id: 'error.required.password'
  },
  setupCompleteTitle: {
    defaultMessage: 'Account setup complete',
    description: 'Title for the setup complete page',
    id: 'userSetup.complete.title'
  },
  userSetupInstruction: {
    defaultMessage:
      'Now login to your account with your username and newly created password',
    description: 'Instruction for the setup complete',
    id: 'userSetup.complete.instruction'
  },
  userSetupIntroduction: {
    defaultMessage:
      'You just a few steps away from completing your account set up.',
    description: 'Instruction for the account setup langing page',
    id: 'userSetup.landing.instruction'
  },
  userSetupRevieTitle: {
    defaultMessage: 'Your details',
    description: 'User setup review page title',
    id: 'userSetup.review.title'
  },
  userSetupReviewHeader: {
    defaultMessage: 'Confirm your details',
    description: 'User setup review page subtitle',
    id: 'userSetup.review.header'
  },
  userSetupReviewInstruction: {
    defaultMessage:
      'Check the details below to confirm your account details are correct. and make annecessary changes to confirm your account details are correct.',
    description: 'User setup review page instruction',
    id: 'userSetup.instruction'
  },
  userSetupWelcomeTitle: {
    defaultMessage: 'Welcome to {applicationName}',
    description: 'Title for the landing page',
    id: 'userSetup.landing.title'
  },
  validationMsg: {
    defaultMessage: 'Password must have:',
    description: 'Password validation message',
    id: 'password.validation.msg'
  },
  waiting: {
    defaultMessage: 'Setting up your account',
    description:
      'The message that displays when the user is waiting for the account to be created',
    id: 'userSetup.waiting'
  },
  assignedOffice: {
    defaultMessage: 'Assigned registration office',
    description: 'Title for assigned office field',
    id: 'user.profile.assignedOffice'
  },
  roleType: {
    defaultMessage: 'Role/Type',
    description: 'Title for roleType field',
    id: 'user.profile.roleType'
  },
  phoneNumber: {
    defaultMessage: 'Phone number',
    description: 'Title for phoneNumber field',
    id: 'user.profile.phoneNumber'
  },
  userName: {
    defaultMessage: 'Username',
    description: 'Title for userName field',
    id: 'user.profile.userName'
  },
  nid: {
    defaultMessage: 'National ID',
    description: 'Title for nid',
    id: 'user.profile.nid'
  },
  startDate: {
    defaultMessage: 'Start date',
    description: 'Title for startDate field',
    id: 'user.profile.startDate'
  },
  auditSectionTitle: {
    defaultMessage: 'History',
    description: 'Title for audit section',
    id: 'user.profile.sectionTitle.audit'
  },
  auditActionColumnTitle: {
    defaultMessage: 'Action',
    description: 'Title for audit action column',
    id: 'user.profile.audit.column.action'
  },
  auditTrackingIDColumnTitle: {
    defaultMessage: 'Record',
    description: 'Title for audit tracking id column',
    id: 'user.profile.audit.column.trackingId'
  },
  auditDeviceIpAddressColumnTitle: {
    defaultMessage: 'Device/IP Address',
    description: 'Title for audit Device/IP Address column',
    id: 'user.profile.audit.column.deviceIPAddress'
  },
  auditEventTypeColumnTitle: {
    defaultMessage: 'Event',
    description: 'Title for audit event type column',
    id: 'user.profile.audit.column.eventType'
  },
  auditDateColumnTitle: {
    defaultMessage: 'Date',
    description: 'Title for audit date column',
    id: 'user.profile.audit.column.date'
  },
  noAuditFound: {
    defaultMessage: 'No audits to display',
    description: 'Text for audit list',
    id: 'user.profile.audit.list.noDataFound'
  },
  showMoreAuditList: {
    defaultMessage: 'Show next {pageSize} of {totalItems}',
    description: 'Label for show more link',
    id: 'user.profile.auditList.showMore'
  },
  loggedInAuditAction: {
    defaultMessage: 'Logged in',
    description: 'Description for user logged in',
    id: 'user.profile.auditList.loggedIn'
  },
  loggedOutAuditAction: {
    defaultMessage: 'Logged out',
    description: 'Description for user logged out',
    id: 'user.profile.auditList.loggedOut'
  },
  phoneNumberChangedAuditAction: {
    defaultMessage: 'Phone number changed',
    description: 'Description for user change phoneNumber',
    id: 'user.profile.auditList.phoneNumberChanged'
  },
  emailAddressChangedAuditAction: {
    defaultMessage: 'Email Address changed',
    description: 'Description for user change email',
    id: 'user.profile.auditList.emailAddressChanged'
  },
  passwordChangedAuditAction: {
    defaultMessage: 'Changed Password',
    description: 'Description for user change password',
    id: 'user.profile.auditList.passwordChanged'
  },
  reactivateAuditAction: {
    defaultMessage: 'Reactivates User',
    description: 'Description for User reactivated',
    id: 'user.profile.auditList.userReactivated'
  },
  deactivateAuditAction: {
    defaultMessage: 'Deactivated User',
    description: 'Description for User deactivated',
    id: 'user.profile.auditList.userDeactivated'
  },
  createUserAuditAction: {
    defaultMessage: 'Created User',
    description: 'Description for User created action',
    id: 'user.profile.auditList.userCreated'
  },
  editUserAuditAction: {
    defaultMessage: 'Edit User',
    description: 'Description for User edited action',
    id: 'user.profile.auditList.userEdited'
  },
  passwordResetAuditAction: {
    defaultMessage: 'Reset password',
    description: 'Description for User reset password action',
    id: 'user.profile.auditList.passwordReset'
  },
  userNameReminderAuditAction: {
    defaultMessage: 'Username Reminder Requested',
    description: 'Description for User username requested audit action',
    id: 'user.profile.auditList.usernameRequested'
  },
  passwordResetByAdmin: {
    defaultMessage: 'Sent password',
    description: 'Description for sending temporal password action',
    id: 'user.profile.auditList.passwordResetByAdmin'
  },
  usernameReminderByAdmin: {
    defaultMessage: 'Sent username reminder',
    description: 'Description for send username reminder audit action',
    id: 'user.profile.auditList.usernameReminderByAdmin'
  }
})
