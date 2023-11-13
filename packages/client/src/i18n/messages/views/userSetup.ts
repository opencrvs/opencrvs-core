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

interface IUserSetupMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  confirmPassword: MessageDescriptor
  hasCases: MessageDescriptor
  hasNumber: MessageDescriptor
  header: MessageDescriptor
  instruction: MessageDescriptor
  labelAssignedOffice: MessageDescriptor
  labelBanglaName: MessageDescriptor
  labelEnglishName: MessageDescriptor
  match: MessageDescriptor
  minLength: MessageDescriptor
  mismatch: MessageDescriptor
  newPassword: MessageDescriptor
  passwordRequired: MessageDescriptor
  setupCompleteTitle: MessageDescriptor
  userSetupInstruction: MessageDescriptor
  userSetupIntroduction: MessageDescriptor
  userSetupRevieTitle: MessageDescriptor
  userSetupReviewHeader: MessageDescriptor
  userSetupReviewInstruction: MessageDescriptor
  userSetupWelcomeTitle: MessageDescriptor
  validationMsg: MessageDescriptor
  waiting: MessageDescriptor
  assignedOffice: MessageDescriptor
  roleType: MessageDescriptor
  phoneNumber: MessageDescriptor
  userName: MessageDescriptor
  nid: MessageDescriptor
  startDate: MessageDescriptor
  auditSectionTitle: MessageDescriptor
  auditActionColumnTitle: MessageDescriptor
  auditTrackingIDColumnTitle: MessageDescriptor
  auditDeviceIpAddressColumnTitle: MessageDescriptor
  auditEventTypeColumnTitle: MessageDescriptor
  auditDateColumnTitle: MessageDescriptor
  noAuditFound: MessageDescriptor
  inProgressAuditAction: MessageDescriptor
  declaredAuditAction: MessageDescriptor
  validatedAuditAction: MessageDescriptor
  updatedAuditAction: MessageDescriptor
  registeredAuditAction: MessageDescriptor
  rejectedAuditAction: MessageDescriptor
  certifiedAuditAction: MessageDescriptor
  issuedAuditAction: MessageDescriptor
  showMoreAuditList: MessageDescriptor
  assignedAuditAction: MessageDescriptor
  unAssignedAuditAction: MessageDescriptor
  correctedAuditAction: MessageDescriptor
  requestedCorrectionAuditAction: MessageDescriptor
  approvedCorrectionAuditAction: MessageDescriptor
  rejectedCorrectedAuditAction: MessageDescriptor
  archivedAuditAction: MessageDescriptor
  loggedInAuditAction: MessageDescriptor
  loggedOutAuditAction: MessageDescriptor
  phoneNumberChangedAuditAction: MessageDescriptor
  emailAddressChangedAuditAction: MessageDescriptor
  passwordChangedAuditAction: MessageDescriptor
  reactivateAuditAction: MessageDescriptor
  deactivateAuditAction: MessageDescriptor
  createUserAuditAction: MessageDescriptor
  editUserAuditAction: MessageDescriptor
  passwordResetAuditAction: MessageDescriptor
  usernameReminderByAdmin: MessageDescriptor
  passwordResetByAdmin: MessageDescriptor
  userNameReminderAuditAction: MessageDescriptor
  retrievedAuditAction: MessageDescriptor
  viewedAuditAction: MessageDescriptor
  reInstatedInProgressAuditAction: MessageDescriptor
  reInstatedInReviewAuditAction: MessageDescriptor
  reInStatedRejectedAuditAction: MessageDescriptor
  sentForApprovalAuditAction: MessageDescriptor
  markedAsDuplicate: MessageDescriptor
  markedAsNotDuplicate: MessageDescriptor
}

const messagesToDefine: IUserSetupMessages = {
  confirmPassword: {
    defaultMessage: 'Confirm new password',
    description: 'Confirm password label',
    id: 'password.label.confirm'
  },
  hasCases: {
    defaultMessage: 'Contain upper and lower cases',
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
    defaultMessage:
      'We recommend you create a unique password - one that you don’t use for another website or app. Note. You can’t reuse your old password once you change it.',
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
  inProgressAuditAction: {
    defaultMessage: 'Sent incomplete',
    description: 'Description for incomplete declaration',
    id: 'user.profile.audit.description.inProgress'
  },
  declaredAuditAction: {
    defaultMessage: 'Declaration started',
    description: 'Description for complete declaration',
    id: 'user.profile.audit.description.declared'
  },
  validatedAuditAction: {
    defaultMessage: 'Sent for approval',
    description: 'Description for validated declaration',
    id: 'user.profile.audit.description.validated'
  },
  updatedAuditAction: {
    defaultMessage: 'Updated',
    description: 'Description for updated declaration',
    id: 'user.profile.audit.description.updated'
  },
  registeredAuditAction: {
    defaultMessage: 'Registered',
    description: 'Description for registered declaration',
    id: 'user.profile.audit.description.registered'
  },
  rejectedAuditAction: {
    defaultMessage: 'Rejected',
    description: 'Description for rejected declaration',
    id: 'user.profile.audit.description.rejected'
  },
  certifiedAuditAction: {
    defaultMessage: 'Certified',
    description: 'Description for certified declaration',
    id: 'user.profile.audit.description.certified'
  },
  issuedAuditAction: {
    defaultMessage: 'Issued',
    description: 'Description for Issued declaration',
    id: 'user.profile.audit.description.issued'
  },
  showMoreAuditList: {
    defaultMessage: 'Show next {pageSize} of {totalItems}',
    description: 'Label for show more link',
    id: 'user.profile.auditList.showMore'
  },
  assignedAuditAction: {
    defaultMessage: 'Assigned',
    description: 'Description for declaration assignment',
    id: 'user.profile.auditList.assigned'
  },
  unAssignedAuditAction: {
    defaultMessage: 'Unassigned',
    description: 'Description for declaration not assigned to self',
    id: 'user.profile.auditList.unAssigned'
  },
  correctedAuditAction: {
    defaultMessage: 'Corrected Record',
    description: 'Description for declaration corrected',
    id: 'user.profile.auditList.corrected'
  },
  requestedCorrectionAuditAction: {
    defaultMessage: 'Requested correction',
    description: 'Description for record correction being requested',
    id: 'user.profile.auditList.requestedCorrectionAuditAction'
  },
  approvedCorrectionAuditAction: {
    defaultMessage: 'Approved correction request',
    description: 'Description for record correction being approved',
    id: 'user.profile.auditList.approvedCorrectionAuditAction'
  },
  rejectedCorrectedAuditAction: {
    defaultMessage: 'Rejected correction request',
    description: 'Description for record correction being rejected',
    id: 'user.profile.auditList.rejectedCorrectedAuditAction'
  },
  archivedAuditAction: {
    defaultMessage: 'Archived',
    description: 'Description for declaration archived',
    id: 'user.profile.auditList.archived'
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
  },
  retrievedAuditAction: {
    defaultMessage: 'Retrieved',
    description: 'Description for declaration retrieved audit action',
    id: 'user.profile.auditList.retrieved'
  },
  viewedAuditAction: {
    defaultMessage: 'Viewed',
    description: 'Description for declaration viewed audit action',
    id: 'user.profile.auditList.viewed'
  },
  reInstatedInProgressAuditAction: {
    defaultMessage: 'Reinstated to in progress',
    description:
      'Description for sending registration from Reinstated to In progress audit action',
    id: 'user.profile.auditList.reInstatedToInProgress'
  },
  reInstatedInReviewAuditAction: {
    defaultMessage: 'Reinstated to ready for review',
    description:
      'Description for sending registration from Reinstated to In review audit action',
    id: 'user.profile.auditList.reInstatedToInReview'
  },
  reInStatedRejectedAuditAction: {
    defaultMessage: 'Reinstated to requires updates',
    description:
      'Description for sending registration from Reinstated to require updates audit action',
    id: 'user.profile.auditList.reInstatedToUpdate'
  },
  sentForApprovalAuditAction: {
    defaultMessage: 'Sent for approval',
    description:
      'Description for sending registration for approval audit action',
    id: 'user.profile.auditList.sentForApproval'
  },
  markedAsDuplicate: {
    defaultMessage: 'Marked as duplicate',
    description: 'Description for marked as duplicate in audit action',
    id: 'user.profile.auditList.markedAsDuplicate'
  },
  markedAsNotDuplicate: {
    defaultMessage: 'Marked as not duplicate',
    description: 'Description for marked as not duplicate in audit action',
    id: 'user.profile.auditList.markedAsNotDuplicate'
  }
}

export const messages: IUserSetupMessages = defineMessages(messagesToDefine)
