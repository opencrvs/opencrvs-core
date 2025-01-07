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
/* eslint-disable */

import { defineMessages, MessageDescriptor } from 'react-intl'

export const constantsMessages = defineMessages({
  action: {
    defaultMessage: 'Action',
    description: 'Action Label',
    id: 'constants.label.action'
  },
  address: {
    defaultMessage: 'Address',
    description: 'Label for address',
    id: 'constants.address'
  },
  allEvents: {
    defaultMessage: 'All events',
    description: 'Label for select option All events',
    id: 'constants.allEvents'
  },
  allStatuses: {
    defaultMessage: 'All statuses',
    description: 'Label for select option All statuses',
    id: 'constants.allStatuses'
  },
  applicationName: {
    defaultMessage: 'OpenCRVS',
    description: 'Declaration name of CRVS',
    id: 'constants.applicationName'
  },
  applicationTitle: {
    defaultMessage: 'Application',
    description: 'Application title',
    id: 'constants.application.title'
  },
  assignRecord: {
    defaultMessage: 'Assign record',
    description: 'A label for the Assign record -button',
    id: 'constants.assignRecord'
  },
  averageRateOfRegistrations: {
    defaultMessage: 'avg. {amount}%',
    description: 'A label for Average rate of registrations',
    id: 'constants.averageRateOfRegistrations'
  },
  birth: {
    defaultMessage: 'Birth',
    description: 'A label from the birth event',
    id: 'constants.birth'
  },
  births: {
    defaultMessage: 'Births',
    description: 'A label from the births event',
    id: 'constants.births'
  },
  by: {
    defaultMessage: 'By',
    description: 'Label for By (the person who performed the action)',
    id: 'constants.by'
  },
  certificateTitle: {
    defaultMessage: 'Certificate',
    description: 'Certificate title',
    id: 'constants.certificate.title'
  },
  certificationPaymentTitle: {
    defaultMessage:
      'Payment collected for {event, select, birth{birth} death{death} other{birth}} certificates',
    description: 'Label for certification payment performance reports',
    id: 'constants.certificationPaymentTitle'
  },
  certified: {
    defaultMessage: 'certified',
    description: 'A label for certified',
    id: 'constants.certified'
  },
  collected: {
    defaultMessage: 'collected',
    description: 'The status label for collected',
    id: 'constants.collected'
  },
  collectedBy: {
    defaultMessage: 'Collected by',
    description: 'The collected by sec text',
    id: 'constants.collectedBy'
  },
  comment: {
    defaultMessage: 'Comment',
    description: 'Label for rejection comment',
    id: 'constants.comment'
  },
  countryName: {
    defaultMessage: 'Farajaland',
    description: 'Name of the OpenCRVS implementation country',
    id: 'constants.countryName'
  },
  customTimePeriod: {
    defaultMessage: 'Custom time period',
    description: 'Label for Custom time period',
    id: 'constants.customTimePeriod'
  },
  date: {
    defaultMessage: 'Date',
    description: 'Date Label',
    id: 'constants.label.date'
  },
  dateOfDeclaration: {
    defaultMessage: 'Date of declaration',
    description: 'Date of declaration label',
    id: 'constants.dateOfDeclaration'
  },
  death: {
    defaultMessage: 'Death',
    description: 'A label from the death event',
    id: 'constants.death'
  },
  deaths: {
    defaultMessage: 'Deaths',
    description: 'A label from the deaths event',
    id: 'constants.deaths'
  },
  declaration: {
    defaultMessage: 'declaration',
    description: 'A label for declaration',
    id: 'constants.declaration'
  },
  declarationArchivedOn: {
    defaultMessage: 'Application archived on',
    description: 'Label for the workflow timestamp when the status is archived',
    id: 'constants.declrationArchivedOn'
  },
  declarationCollectedOn: {
    defaultMessage: 'Certificate collected on',
    description:
      'Label for the workflow timestamp when the status is collected',
    id: 'constants.declarationCollectedOn'
  },
  declarationFailedOn: {
    defaultMessage: 'Failed to send on',
    description: 'Label for the workflow timestamp when the status is failed',
    id: 'constants.declarationFailedOn'
  },
  declarationInformantLabel: {
    defaultMessage: 'Informant',
    description: 'Informant Label',
    id: 'constants.informant'
  },
  declarationRegisteredOn: {
    defaultMessage: 'Declaration registered on',
    description:
      'Label for the workflow timestamp when the status is registered',
    id: 'constants.declarationRegisteredOn'
  },
  declarationRejectedOn: {
    defaultMessage: 'Declaration sent for updates on',
    description: 'Label for the workflow timestamp when the status is rejected',
    id: 'constants.declarationRejectedOn'
  },
  declarationRequestedCorrectionOn: {
    defaultMessage: 'Declaration requested correction on',
    description:
      'Label for the workflow timestamp when the status is requested correction',
    id: 'constants.declarationRequestedCorrectionOn'
  },
  declarations: {
    defaultMessage: 'Declarations ({totalItems})',
    description: 'A label for declarations count',
    id: 'constants.declarationsCount'
  },
  declarationSentForExternalValidationOn: {
    defaultMessage: 'Declaration sent for external validation on',
    description:
      'Label for the workflow timestamp when the status is waiting_validation',
    id: 'constants.declarationSentForExternalValidationOn'
  },
  declarationStarted: {
    defaultMessage: 'Started',
    description: 'Label for table header column Declaration started',
    id: 'constants.declarationStarted'
  },
  declarationStartedBy: {
    defaultMessage: 'Started by',
    description: 'Label for table header column Started by',
    id: 'constants.declarationStartedBy'
  },
  declarationStartedOn: {
    defaultMessage: 'Started on',
    description:
      'Label for the workflow timestamp when the status is draft created',
    id: 'constants.declarationStartedOn'
  },
  declarationState: {
    defaultMessage: 'Declaration {action} on',
    description: 'A label to describe when the declaration was actioned on',
    id: 'constants.declarationState'
  },
  declarationSubmittedOn: {
    defaultMessage: 'Declaration submitted on',
    description:
      'Label for the workflow timestamp when the status is declaration',
    id: 'constants.declarationSubmittedOn'
  },
  declarationTitle: {
    defaultMessage: 'Declarations',
    description: 'Declaration title',
    id: 'constants.declarations'
  },
  declarationUpdatedOn: {
    defaultMessage: 'Updated on',
    description:
      'Label for the workflow timestamp when the status is draft updated',
    id: 'constants.declarationUpdatedOn'
  },
  declarationValidatedOn: {
    defaultMessage: 'Declaration reviewed on',
    description:
      'Label for the workflow timestamp when the status is validated',
    id: 'constants.declarationValidatedOn'
  },
  declared: {
    defaultMessage: 'submitted',
    description: 'A label for submitted',
    id: 'constants.submitted'
  },
  dob: {
    defaultMessage: 'D.o.B.',
    description: 'Date of birth label',
    id: 'constants.dob'
  },
  dod: {
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in work queue list item',
    id: 'constants.dod'
  },
  downloaded: {
    defaultMessage: 'Downloaded',
    description: 'Label for application download status Downloaded',
    id: 'constants.downloaded'
  },
  downloading: {
    defaultMessage: 'Downloading...',
    description: 'Label for declaration download status Downloading',
    id: 'constants.downloading'
  },
  duplicateOf: {
    defaultMessage: 'Duplicate of',
    description: 'table header for `duplicate of` in record audit',
    id: 'constants.duplicateOf'
  },
  emailBody: {
    defaultMessage: 'Message',
    description: 'Label for email body input',
    id: 'constants.emailBody'
  },
  emailSubject: {
    defaultMessage: 'Subject',
    description: 'Label for email subject input',
    id: 'constants.emailSubject'
  },
  estimatedNumberOfEvents: {
    defaultMessage:
      'Estimated no. of {eventType, select, birth {birth} death {death} other {birth}}s',
    description: 'A label for Estimated number of events',
    id: 'constants.estimatedNumberOfEvents'
  },
  estimatedNumberOfRegistartion: {
    defaultMessage: 'Estimated no. of registrations',
    description: 'A label for estimated no. of registrations',
    id: 'constants.estimatedNumberOfRegistartion'
  },
  estimatedTargetDaysRegistrationTitle: {
    defaultMessage: `Estimated vs total registered in {registrationTargetDays} days`,
    description: `A label for estimated vs total registered in {registrationTargetDays} days`,
    id: 'constants.estimatedTargetDaysRegistrationTitle'
  },
  event: {
    defaultMessage: 'Event',
    description: 'Label for Event of event in work queue list item',
    id: 'constants.event'
  },
  eventDate: {
    defaultMessage: 'Date of event',
    description: 'Label for event date in list item',
    id: 'constants.eventDate'
  },
  eventType: {
    defaultMessage: 'Event',
    description: 'Label for table header column Event type',
    id: 'constants.eventType'
  },
  export: {
    defaultMessage: 'Export',
    description: 'Label used for export',
    id: 'constants.export'
  },
  failedToSend: {
    defaultMessage: 'Failed to send',
    description: 'Label for declaration status Failed',
    id: 'constants.failedToSend'
  },
  femaleOver18: {
    defaultMessage: 'Female Over 18',
    description: 'Label for femaleOver18',
    id: 'constants.femaleOver18'
  },
  femaleUnder18: {
    defaultMessage: 'Female Under 18',
    description: 'Label for femaleUnder18',
    id: 'constants.femaleUnder18'
  },
  formDeclarationTitle: {
    defaultMessage: 'Declaration forms',
    description: 'Form Declaration title',
    id: 'constants.form.title'
  },
  from: {
    defaultMessage: 'From',
    description: 'Label for text From',
    id: 'constants.from'
  },
  gender: {
    defaultMessage: 'Gender',
    description: 'Gender label',
    id: 'constants.gender'
  },
  history: {
    defaultMessage: 'History',
    description: 'History heading',
    id: 'constants.history'
  },
  id: {
    defaultMessage: 'ID',
    description: 'ID Label',
    id: 'constants.id'
  },
  incompleteStatus: {
    defaultMessage: 'Incomplete',
    description: 'A label for Incomplete',
    id: 'constants.incomplete.status'
  },
  informantContactNumber: {
    defaultMessage: 'Informant contact number',
    description: 'The title of contact number label',
    id: 'constants.informantContactNumber'
  },
  inReviewStatus: {
    defaultMessage: 'In Review',
    description: 'A label for In Review',
    id: 'constants.inReview.status'
  },
  integrationTitle: {
    defaultMessage: 'Integrations',
    description: 'Integration title',
    id: 'constants.integrations'
  },
  issuedBy: {
    defaultMessage: 'Issued by',
    description: 'The issued by sec text',
    id: 'constants.issuedBy'
  },
  labelEmail: {
    defaultMessage: 'Email Address',
    description: 'Email label',
    id: 'constants.emailAddress'
  },
  labelLanguage: {
    defaultMessage: 'Language',
    description: 'language label',
    id: 'constants.language'
  },
  labelPassword: {
    defaultMessage: 'Password',
    description: 'Password label',
    id: 'constants.password'
  },
  labelPhone: {
    defaultMessage: 'Phone number',
    description: 'Phone label',
    id: 'constants.phoneNumber'
  },
  labelPin: {
    defaultMessage: 'PIN',
    description: 'PIN label',
    id: 'constants.PIN'
  },
  labelRole: {
    defaultMessage: 'Role',
    description: 'Role label',
    id: 'constants.role'
  },
  labelSystemRole: {
    defaultMessage: 'System Role',
    description: 'System Role label',
    id: 'constants.systemrole'
  },
  last12Months: {
    defaultMessage: 'Last 12 months',
    description: 'Label for preset date range Last 12 months',
    id: 'constants.last12Months'
  },
  last30Days: {
    defaultMessage: 'Last 30 days',
    description: 'Label for  preset date range Last 30 days',
    id: 'constants.last30Days'
  },
  lastEdited: {
    defaultMessage: 'Last edited',
    description: 'Label for rejection date in work queue list item',
    id: 'constants.lastEdited'
  },
  lastUpdated: {
    defaultMessage: 'Last updated',
    description: 'Label for Last updated in list item',
    id: 'constants.lastUpdated'
  },
  loadMore: {
    defaultMessage: 'Load more',
    description: 'A label for load more',
    id: 'constants.loadMore'
  },
  location: {
    defaultMessage: 'Location',
    description: 'Label for location',
    id: 'constants.location'
  },
  maleOver18: {
    defaultMessage: 'Male Over 18',
    description: 'Label for maleOver18',
    id: 'constants.maleOver18'
  },
  maleUnder18: {
    defaultMessage: 'Male Under 18',
    description: 'Label for maleUnder18',
    id: 'constants.maleUnder18'
  },
  marriage: {
    defaultMessage: 'Marriage',
    description: 'A label from the marriage event',
    id: 'constants.marriage'
  },
  marriages: {
    defaultMessage: 'Marriages',
    description: 'A label from the marriages event',
    id: 'constants.marriages'
  },
  matchedTo: {
    defaultMessage: 'Matched to',
    description: 'table header for `Matched to` in record audit',
    id: 'constants.matchedTo'
  },
  month: {
    defaultMessage: 'Month',
    description: 'Label for month',
    id: 'constants.month'
  },
  name: {
    defaultMessage: 'Name',
    description: 'Name label',
    id: 'constants.name'
  },
  newBirthRegistration: {
    defaultMessage: 'New birth declaration',
    description: 'The title that appears for new birth registrations',
    id: 'register.selectInformant.newBirthRegistration'
  },
  newDeathRegistration: {
    defaultMessage: 'New death declaration',
    description: 'The title that appears for new death registrations',
    id: 'register.selectInformant.newDeathRegistration'
  },
  newMarriageRegistration: {
    defaultMessage: 'New marriage declaration',
    description: 'The title that appears for new marriage registrations',
    id: 'register.selectInformant.newMarriageRegistration'
  },
  noConnection: {
    defaultMessage: 'No connection',
    description: 'No Connection hover text',
    id: 'constants.noConnection'
  },
  noNameProvided: {
    defaultMessage: 'No name provided',
    description: 'Label for empty title',
    id: 'constants.noNameProvided'
  },
  noResults: {
    defaultMessage: 'No result',
    description:
      'Text to display if the search return no results for the current filters',
    id: 'constants.noResults'
  },
  noResultsOutbox: {
    defaultMessage: 'No records require processing',
    description: 'Text to display if there is no items in outbox',
    id: 'constants.noResultsOutbox'
  },
  notificationSent: {
    defaultMessage: 'Notification sent',
    description: 'label for notification sent',
    id: 'constants.notificationSent'
  },
  over5Years: {
    defaultMessage: 'Over 5 years',
    description: 'Label for registrations over 5 years',
    id: 'constants.over5Years'
  },
  pendingConnection: {
    defaultMessage: 'Pending connection',
    description: 'Label for declaration status Pending Connection',
    id: 'constants.pendingConnection'
  },
  percentageOfEstimation: {
    defaultMessage: 'Percentage of estimate',
    description: 'A label for percentage of estimate',
    id: 'constants.percentageOfEstimation'
  },
  performanceTitle: {
    defaultMessage: 'Performance',
    description: 'Performance title',
    id: 'constants.performance'
  },
  reason: {
    defaultMessage: 'Reason',
    description: 'Label for Reason the declaration was rejected',
    id: 'constants.reason'
  },
  record: {
    defaultMessage: 'Record',
    description: 'Label for header table header Record',
    id: 'constants.record'
  },
  refresh: {
    defaultMessage: 'Refresh',
    description: 'label for refresh',
    id: 'constants.refresh'
  },
  registered: {
    defaultMessage: 'Registered',
    description: 'A label for registered',
    id: 'constants.registered'
  },
  registeredAt: {
    defaultMessage: 'Registered at',
    description: 'Label for comparison row registeredAt type',
    id: 'constants.registeredAt'
  },
  registeredBy: {
    defaultMessage: 'Registered by',
    description: 'Label for comparison row registeredBy type',
    id: 'constants.registeredBy'
  },
  registeredInTargetd: {
    defaultMessage: `Registered in {registrationTargetDays} days`,
    description: `A label for Registered in {registrationTargetDays} days`,
    id: 'constants.registeredInTargetd'
  },
  registeredStatus: {
    defaultMessage: 'Registered',
    description: 'A label for registered',
    id: 'constants.registered.status'
  },
  registeredWithinTargetd: {
    defaultMessage: `Registered within\n{registrationTargetDays} days of event`,
    description: `A label for Registered {registrationTargetDays} within  days of event`,
    id: 'constants.registeredWithinTargetd'
  },
  rejected: {
    defaultMessage: 'rejected',
    description: 'A label for rejected',
    id: 'constants.rejected'
  },
  rejectedDays: {
    defaultMessage: 'Sent for updates {text}',
    description: 'The title of rejected days of declaration',
    id: 'constants.rejectedDays'
  },
  relationship: {
    defaultMessage: 'Relationship',
    description: 'Relationship Label for death',
    id: 'constants.relationship'
  },
  requestedCorrection: {
    defaultMessage: 'requested correction',
    description: 'A label for requested correction',
    id: 'constants.requestedCorrection'
  },
  requestReason: {
    defaultMessage: 'Reason for request',
    description: 'Label for Reason the declaration was corrected',
    id: 'constants.requestReason'
  },
  requiresUpdatesStatus: {
    defaultMessage: 'Requires updates',
    description: 'A label for Requires updates',
    id: 'constants.requiresUpdates.status'
  },
  requireUpdatesLoading: {
    defaultMessage: 'Checking your declarations',
    description: 'The text when all rejected declarations are loading',
    id: 'constants.requireUpdatesLoading'
  },
  review: {
    defaultMessage: 'Review',
    description: 'A label from the review button',
    id: 'constants.review'
  },
  search: {
    defaultMessage: 'Search',
    description: 'The title of the page',
    id: 'constants.search'
  },
  sending: {
    defaultMessage: 'Sending...',
    description: 'Label for declaration status Submitting',
    id: 'constants.sending'
  },
  sentForApproval: {
    defaultMessage: 'Sent for approval',
    description: 'label for sent for approval',
    id: 'constants.sentForApproval'
  },
  sentForReview: {
    defaultMessage: 'Sent for review',
    description: 'label for sent for review',
    id: 'constants.sentForReview'
  },
  sentForUpdates: {
    defaultMessage: 'Sent for updates',
    description: 'label for sent for updates',
    id: 'constants.sentForUpdates'
  },
  sentForUpdatesOn: {
    defaultMessage: 'Sent for updates on',
    description: 'Label for rejection date in work queue list item',
    id: 'constants.sentForUpdatesOn'
  },
  sentForValidation: {
    defaultMessage: 'Sent for validation',
    description: 'label for sent for validation',
    id: 'constants.sentForValidation'
  },
  sentOn: {
    defaultMessage: 'Sent on',
    description: 'Label for rejection date in work queue list item',
    id: 'constants.sentOn'
  },
  showMore: {
    defaultMessage: 'Show next {pageSize}',
    description: 'Label for show more link',
    id: 'constants.showMore'
  },
  skipToMainContent: {
    defaultMessage: 'Skip to main content',
    description:
      'Label for a keyboard accessibility link which skips to the main content',
    id: 'constants.skipToMainContent'
  },
  startedAt: {
    defaultMessage: 'Started',
    description: 'Label for Started At in list item',
    id: 'constants.startedAt'
  },
  startedBy: {
    defaultMessage: 'Started by',
    description: 'Label for Started by in list item',
    id: 'constants.startedBy'
  },
  status: {
    defaultMessage: 'Status',
    description: 'Title for column',
    id: 'constants.status'
  },
  submissionStatus: {
    defaultMessage: 'Submission status',
    description: 'Label for table header of column Submission status',
    id: 'constants.submissionStatus'
  },
  timeFramesTitle: {
    defaultMessage:
      '{event, select, birth{Birth} death{Death} other{Birth}} registered by time period, from date of occurrence',
    description: 'Header for tabel performance timeframs',
    id: 'constants.timeFramesTitle'
  },
  timeInProgress: {
    defaultMessage: 'Time in progress',
    description: 'Label for column Time in progress',
    id: 'constants.timeInProgress'
  },
  timePeriod: {
    defaultMessage: 'Time period',
    description: 'A label for Time period',
    id: 'constants.timePeriod'
  },
  timeReadyForReview: {
    defaultMessage: 'Time in ready for review',
    description: 'Label for column Time in ready for review',
    id: 'constants.timeReadyForReview'
  },
  timeReadyToPrint: {
    defaultMessage: 'Time in ready to print',
    description: 'Label for column Time in ready to print',
    id: 'constants.timeReadyToPrint'
  },
  timeRequireUpdates: {
    defaultMessage: 'Time in require updates',
    description: 'Label for column Time in require updates',
    id: 'constants.timeRequireUpdates'
  },
  timeWaitingExternalValidation: {
    defaultMessage: 'Time in external validation',
    description: 'Label for column Time in external validation BRIS',
    id: 'constants.timeWaitingExternalValidation'
  },
  timeWatingApproval: {
    defaultMessage: 'Time in waiting for approval',
    description: 'Label for column Time in waiting for approval',
    id: 'constants.timeWatingApproval'
  },
  to: {
    defaultMessage: 'to',
    description: 'Used in sentence',
    id: 'constants.to'
  },
  toCapitalized: {
    defaultMessage: 'To',
    description: 'Label for To',
    id: 'constants.toCapitalized'
  },
  total: {
    defaultMessage: 'Total',
    description: 'Label for total',
    id: 'constants.total'
  },
  totalFileSizeExceed: {
    defaultMessage:
      'Total size of documents exceeds {fileSize}. Please reduce file size of your uploads',
    description: 'Accumulated File size exceed message',
    id: 'constants.totalFileSizeExceed'
  },
  totalRegistered: {
    defaultMessage: 'Total registered',
    description: 'A label for Total registered',
    id: 'constants.totalRegistered'
  },
  totalRegisteredInTargetDays: {
    defaultMessage: `Total registered in {registrationTargetDays} days`,
    description: `A label for total registered in {registrationTargetDays} days`,
    id: 'constants.totalRegisteredInTargetDays'
  },
  trackingId: {
    defaultMessage: 'Tracking ID',
    description: 'Search menu tracking id type',
    id: 'constants.trackingId'
  },
  type: {
    defaultMessage: 'Type',
    description: 'Label for type of event in work queue list item',
    id: 'constants.type'
  },
  update: {
    defaultMessage: 'Update',
    description: 'The title of reject button in list item actions',
    id: 'constants.update'
  },
  user: {
    defaultMessage: 'User',
    description: 'The name of the user form',
    id: 'constants.user'
  },
  username: {
    defaultMessage: 'Username',
    description: 'Username',
    id: 'constants.username'
  },
  validated: {
    defaultMessage: 'validated',
    description: 'A label for validated',
    id: 'constants.validated'
  },
  viewAll: {
    defaultMessage: 'View all',
    description: 'Label for view all link',
    id: 'constants.viewAll'
  },
  vsExportTitle: {
    defaultMessage: 'Vital statistics',
    description: 'Vital statistics title',
    id: 'config.application.vsexport'
  },
  waitingToSend: {
    defaultMessage: 'Waiting to send',
    description: 'Label for declaration status Ready to Submit',
    id: 'constants.waitingToSend'
  },
  waitingValidated: {
    defaultMessage: 'Waiting for validation',
    description: 'A label for waitingValidated',
    id: 'constants.waitingValidated'
  },
  week: {
    defaultMessage: 'Week',
    description: 'Label for week',
    id: 'constants.week'
  },
  within1YearTo5Years: {
    defaultMessage: '1 year - 5 years',
    description: 'Label for registrations within 1 year to 5 years',
    id: 'constants.within1YearTo5Years'
  },
  withinTargetDays: {
    defaultMessage: `Within {registrationTargetDays} days`,
    description: `Label for registrations within {registrationTargetDays} days`,
    id: 'constants.withinTargetDays'
  },
  withinTargetDaysTo1Year: {
    defaultMessage: `{registrationTargetDays} days - 1 year`,
    description: `Label for registrations within {registrationTargetDays} days to 1 year`,
    id: 'constants.withinTargetDaysTo1Year'
  }
})
