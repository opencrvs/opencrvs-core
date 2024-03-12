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
interface IConfigMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  applicationSettings: MessageDescriptor
  advancedSearch: MessageDescriptor
  advancedSearchInstruction: MessageDescriptor
  vsexport: MessageDescriptor
  vitalStatisticsExport: MessageDescriptor
  export: MessageDescriptor
  vsEmptyStateText: MessageDescriptor
  vsExportDownloadFailed: MessageDescriptor
  applicationNameChangeMessage: MessageDescriptor
  applicationNameChangeNotification: MessageDescriptor
  govtLogoChangeMessage: MessageDescriptor
  govtLogoChangeNotification: MessageDescriptor
  backgroundImageChangeNotification: MessageDescriptor
  backgroundImageFileLimitError: MessageDescriptor
  govtLogoChangeError: MessageDescriptor
  govtLogoFileLimitError: MessageDescriptor
  applicationConfigChangeError: MessageDescriptor
  certificateConfiguration: MessageDescriptor
  printTemplate: MessageDescriptor
  downloadTemplate: MessageDescriptor
  uploadTemplate: MessageDescriptor
  listTitle: MessageDescriptor
  listDetails: MessageDescriptor
  birthTemplate: MessageDescriptor
  deathTemplate: MessageDescriptor
  certificateTemplate: MessageDescriptor
  template: MessageDescriptor
  options: MessageDescriptor
  allowPrinting: MessageDescriptor
  allowPrintingDescription: MessageDescriptor
  marriageTemplate: MessageDescriptor
  birthDefaultTempDesc: MessageDescriptor
  eventUpdatedTempDesc: MessageDescriptor
  deathDefaultTempDesc: MessageDescriptor
  marriageDefaultTempDesc: MessageDescriptor
  certificateUploading: MessageDescriptor
  certificateUpdated: MessageDescriptor
  certificateValidationError: MessageDescriptor
  uploadCertificateDialogTitle: MessageDescriptor
  uploadCertificateDialogDescription: MessageDescriptor
  uploadCertificateDialogConfirm: MessageDescriptor
  uploadCertificateDialogCancel: MessageDescriptor
  listDetailsQsn: MessageDescriptor
  applicationNameLabel: MessageDescriptor
  govermentLogoLabel: MessageDescriptor
  loginBackgroundLabel: MessageDescriptor
  loginImageText: MessageDescriptor
  backgroundImageError: MessageDescriptor
  currencyLabel: MessageDescriptor
  applicationCurrencyChangeNotification: MessageDescriptor
  applicationBirthRegTargetChangeNotification: MessageDescriptor
  applicationBirthLateRegTargetChangeNotification: MessageDescriptor
  applicationDeathRegTargetChangeNotification: MessageDescriptor
  applicationBirthOnTimeFeeChangeNotification: MessageDescriptor
  applicationBirthLateFeeChangeNotification: MessageDescriptor
  applicationBirthDelayedFeeChangeNotification: MessageDescriptor
  applicationDeathOnTimeFeeChangeNotification: MessageDescriptor
  applicationDeathDelayedFeeChangeNotification: MessageDescriptor
  applicationMarriageRegTargetChangeNotification: MessageDescriptor
  applicationMarriageOnTimeFeeChangeNotification: MessageDescriptor
  applicationMarriageDelayedFeeChangeNotification: MessageDescriptor
  applicationCurrencyChangeMessage: MessageDescriptor
  applicationConfigUpdatingMessage: MessageDescriptor
  phoneNumberLabel: MessageDescriptor
  birthLegallySpecifiedDialogTitle: MessageDescriptor
  birthDelayedDialogTitle: MessageDescriptor
  deathLegallySpecifiedDialogTitle: MessageDescriptor
  marriageLegallySpecifiedDialogTitle: MessageDescriptor
  onTimeFeeDialogTitle: MessageDescriptor
  lateFeeDialogTitle: MessageDescriptor
  delayedFeeDialogTitle: MessageDescriptor
  nidPatternTitle: MessageDescriptor
  nidPatternChangeMessage: MessageDescriptor
  nidPatternChangeError: MessageDescriptor
  nidPatternChangeNotification: MessageDescriptor
  phoneNumberPatternTitle: MessageDescriptor
  phoneNumberChangeMessage: MessageDescriptor
  phoneNumberChangeError: MessageDescriptor
  phoneNumberChangeNotification: MessageDescriptor
  legallySpecifiedLabel: MessageDescriptor
  legallySpecifiedValue: MessageDescriptor
  lateRegistrationLabel: MessageDescriptor
  lateRegistrationValue: MessageDescriptor
  delayedRegistrationLabel: MessageDescriptor
  delayedRegistrationValue: MessageDescriptor
  withinLegallySpecifiedTimeLabel: MessageDescriptor
  generalTabTitle: MessageDescriptor
  birthTabTitle: MessageDescriptor
  birthTabTitleExport: MessageDescriptor
  deathTabTitle: MessageDescriptor
  marriageTabTitle: MessageDescriptor
  imageTabTitle: MessageDescriptor
  colourTabTitle: MessageDescriptor
  colourTabText: MessageDescriptor
  deathTabTitleExport: MessageDescriptor
  registrationTimePeriodsGroupTitle: MessageDescriptor
  registrationFeesGroupTitle: MessageDescriptor
  eventTargetInputLabel: MessageDescriptor
  pattern: MessageDescriptor
  example: MessageDescriptor
  testNumber: MessageDescriptor
  validExample: MessageDescriptor
  invalidExample: MessageDescriptor
  informantNotifications: MessageDescriptor
  informantNotificationSubtitle: MessageDescriptor
  inProgressSMS: MessageDescriptor
  declarationSMS: MessageDescriptor
  registrationSMS: MessageDescriptor
  rejectionSMS: MessageDescriptor
  informantNotificationUpdatingMessage: MessageDescriptor
  userRoles: MessageDescriptor
  userRolesSubtitle: MessageDescriptor
  systemRoles: MessageDescriptor
  role: MessageDescriptor
  roleUpdateInstruction: MessageDescriptor
  systemRoleSuccessMsg: MessageDescriptor
}

const messagesToDefine: IConfigMessages = {
  applicationSettings: {
    id: 'config.application.settings',
    defaultMessage: 'Application',
    description: 'Link Text for Config Application Settings'
  },
  advancedSearch: {
    id: 'config.advanced.search',
    defaultMessage: 'Advanced Search',
    description: 'This is used for the advanced search'
  },
  advancedSearchInstruction: {
    id: 'config.advanced.search.instruction',
    defaultMessage:
      'Select the options to build an advanced search. A minimum of two search parameters is required.',
    description: 'This is used for the advanced search'
  },
  vsexport: {
    id: 'config.application.vsexport',
    defaultMessage: 'Vital statistics',
    description: 'VS Export tab'
  },
  vitalStatisticsExport: {
    id: 'config.application.vitalStatistics',
    defaultMessage:
      'Month-{month}-Farajaland-{event, select, birth{birth} death{death} other{birth}}-event-statistics.csv {fileSize}',
    description: 'Vital Statistics Export'
  },
  export: {
    id: 'config.application.export',
    defaultMessage: 'Export',
    description: 'Download Export CSV'
  },
  vsEmptyStateText: {
    id: 'config.application.emptystate',
    defaultMessage:
      "The previous month's vital statistics data (based on vital event registrations occurring within that month) will become available for you to export as of the 1st of every month. Large CSV files cannot be opened in Excel and should therefore be opened in a statistical program such as {posit}.",
    description: 'Vital Statistics Export Empty State Text'
  },
  vsExportDownloadFailed: {
    id: 'config.application.vsExportDownloadFailed',
    defaultMessage: 'Sorry! Something went wrong',
    description: 'Vital Statistics Export Empty State Text'
  },
  applicationNameChangeMessage: {
    id: 'config.application.nameChangeMessage',
    defaultMessage: 'Choose a name for your CRVS system',
    description: 'Message for application name change modal'
  },
  applicationNameChangeNotification: {
    id: 'config.application.applicationNameChangeNotification',
    defaultMessage: 'Name of application updated',
    description: 'Message for application name change notification'
  },
  applicationConfigChangeError: {
    id: 'config.application.configChangeError',
    defaultMessage: 'Unable to make change. Please try again',
    description: 'Error message for application config change'
  },
  govtLogoChangeMessage: {
    id: 'config.application.govtLogoChangeMessage',
    defaultMessage:
      'Upload the Government logo to be used on the login and form declaration. Note certificate logo is uploaded as part of the certificate template.',
    description: 'Message for government logo change modal'
  },
  backgroundImageError: {
    id: 'config.application.backgroundImageError',
    defaultMessage: 'Unable to change image. Please try again.',
    description: 'Error message for background image change'
  },
  govtLogoChangeNotification: {
    id: 'config.application.govtLogoChangeNotification',
    defaultMessage: 'Government logo updated',
    description: 'Message for government logo change notification'
  },
  backgroundImageChangeNotification: {
    id: 'config.application.backgroundImageChangeNotification',
    defaultMessage: 'Background updated successfully',
    description: 'Message for background image change notification'
  },
  backgroundImageFileLimitError: {
    id: 'config.application.backgroundImageFileLimitError',
    defaultMessage: 'Background image file must be less than 2mb',
    description: 'Error message for large Background file'
  },
  govtLogoFileLimitError: {
    id: 'config.application.govtLogoFileLimitError',
    defaultMessage: 'Logo image file must be less than 2mb',
    description: 'Error message for large country logo file'
  },
  govtLogoChangeError: {
    id: 'config.application.govtLogoChangeError',
    defaultMessage: 'Unable to change logo. Please try again.',
    description: 'Error message for country logo change'
  },
  certificateConfiguration: {
    id: 'config.certificateConfiguration',
    defaultMessage: 'Certificate configuration',
    description: 'Link Text for Config Declaration Settings'
  },
  printTemplate: {
    id: 'config.printTemplate',
    defaultMessage: 'Print',
    description: 'Print action in certificate config action menu'
  },
  downloadTemplate: {
    id: 'config.downloadTemplate',
    defaultMessage: 'Download',
    description: 'Download action in certificate config action menu'
  },
  uploadTemplate: {
    id: 'config.uploadTemplate',
    defaultMessage: 'Upload',
    description: 'Upload action in certificate config action menu'
  },
  listTitle: {
    id: 'config.listTitle',
    defaultMessage: 'Certification',
    description: 'Title for certificates templates list'
  },
  listDetails: {
    id: 'config.listDetails',
    defaultMessage:
      'To learn how to edit an SVG and upload a certificate to suite your country requirements please refer to this detailed guide. ',
    description: 'Details for certificates templates list'
  },
  listDetailsQsn: {
    id: 'config.listDetailsQsn',
    defaultMessage: 'How to configure a certificate?',
    description: 'Details question for certificates templates list'
  },
  birthTemplate: {
    id: 'config.birthTemplate',
    defaultMessage: 'Birth certificate',
    description: 'Label for birth certificate template'
  },
  deathTemplate: {
    id: 'config.deathTemplate',
    defaultMessage: 'Death certificate',
    description: 'Label for death certificate template'
  },
  certificateTemplate: {
    id: 'config.certTemplate',
    defaultMessage: 'Certificate Template',
    description: 'Label for certificate templates'
  },
  marriageTemplate: {
    id: 'config.marriageTemplate',
    defaultMessage: 'Marriage certificate',
    description: 'Label for marriage certificate template'
  },
  birthDefaultTempDesc: {
    id: 'config.birthDefaultTempDesc',
    defaultMessage: 'Default birth certificate template',
    description: 'Label for default birth certificate template'
  },
  eventUpdatedTempDesc: {
    id: 'config.eventUpdatedTempDesc',
    defaultMessage: 'Updated {lastModified, date, ::MMMMddyyyy}',
    description: 'Label for updated birth certificate template'
  },
  deathDefaultTempDesc: {
    id: 'config.deathDefaultTempDesc',
    defaultMessage: 'Default death certificate template',
    description: 'Label for default death certificate template'
  },
  marriageDefaultTempDesc: {
    id: 'config.marriageDefaultTempDesc',
    defaultMessage: 'Default marriage certificate template',
    description: 'Label for default marriage certificate template'
  },
  certificateUploading: {
    id: 'config.certificate.certificateUploading',
    defaultMessage: 'Uploading and validating {eventName} certificate.',
    description: 'Certificate template message when uploading SVG'
  },
  certificateUpdated: {
    id: 'config.certificate.certificateUpdated',
    defaultMessage: '{eventName} certificate has been updated',
    description: 'Certificate template change message on success'
  },
  certificateValidationError: {
    id: 'config.certificate.certificateValidationError',
    defaultMessage: 'Unable to read SVG. Please check',
    description: 'Certificate template error message on failed'
  },
  uploadCertificateDialogTitle: {
    id: 'config.certificate.uploadCertificateDialogTitle',
    defaultMessage: 'Upload new certificate?',
    description: 'Upload certificate template modal title'
  },
  uploadCertificateDialogDescription: {
    id: 'config.certificate.uploadCertificateDialogDescription',
    defaultMessage:
      'This will replace the current certificate template. We recommend downloading the existing certificate template as a reference.',
    description:
      'The description for the dialog when upload new certificate template'
  },
  uploadCertificateDialogConfirm: {
    id: 'config.certificate.uploadCertificateDialogConfirm',
    defaultMessage: 'Upload',
    description: 'Confirm new certificate template upload button'
  },
  uploadCertificateDialogCancel: {
    id: 'config.certificate.uploadCertificateDialogCancel',
    defaultMessage: 'Cancel',
    description: 'Cancel new certificate template upload button'
  },
  applicationNameLabel: {
    id: 'config.application.applicationNameLabel',
    defaultMessage: 'Name of application',
    description: 'Application name config label'
  },
  govermentLogoLabel: {
    id: 'config.application.govermentLogoLabel',
    defaultMessage: 'Government logo',
    description: 'Government logo config label'
  },
  loginBackgroundLabel: {
    id: 'config.application.loginBackgroundLabel',
    defaultMessage: 'Login Background',
    description: 'Login Background config label'
  },
  loginImageText: {
    id: 'config.application.loginImageText',
    defaultMessage:
      'Upload an image and set how you would like it to display in the background',
    description: 'Login Image config label'
  },
  currencyLabel: {
    id: 'config.application.currencyLabel',
    defaultMessage: 'Currency',
    description: 'Currency config label'
  },
  applicationCurrencyChangeNotification: {
    id: 'config.application.currencyChangeNotification',
    defaultMessage: 'Currency updated',
    description: 'Message for application currency change notification'
  },
  applicationBirthRegTargetChangeNotification: {
    id: 'config.application.birthRegTargetChangeNotification',
    defaultMessage: 'Birth registration target days updated',
    description:
      'Message for application birth registration target change notification'
  },
  applicationBirthLateRegTargetChangeNotification: {
    id: 'config.application.birthLateRegTargetChangeNotification',
    defaultMessage: 'Birth late registration target days updated',
    description:
      'Message for application birth late registration target change notification'
  },
  applicationDeathRegTargetChangeNotification: {
    id: 'config.application.deathRegTargetChangeNotification',
    defaultMessage: 'Death registration target days updated',
    description:
      'Message for application death registration target change notification'
  },
  applicationBirthOnTimeFeeChangeNotification: {
    id: 'config.application.birthOnTimeFeeChangeNotification',
    defaultMessage: 'Birth on time fee updated',
    description: 'Message for application birth on time fee change notification'
  },
  applicationBirthLateFeeChangeNotification: {
    id: 'config.application.birthLateFeeChangeNotification',
    defaultMessage: 'Birth late fee updated',
    description: 'Message for application birth late fee change notification'
  },
  applicationBirthDelayedFeeChangeNotification: {
    id: 'config.application.birthDelayedFeeChangeNotification',
    defaultMessage: 'Birth delayed fee updated',
    description: 'Message for application birth delayed fee change notification'
  },
  applicationDeathOnTimeFeeChangeNotification: {
    id: 'config.application.deathOnTimeFeeChangeNotification',
    defaultMessage: 'Death on time fee updated',
    description: 'Message for application death on time fee change notification'
  },
  applicationDeathDelayedFeeChangeNotification: {
    id: 'config.application.deathDelayedFeeChangeNotification',
    defaultMessage: 'Death delayed fee updated',
    description: 'Message for application death delayed fee change notification'
  },
  applicationMarriageOnTimeFeeChangeNotification: {
    id: 'config.application.marriageOnTimeFeeChangeNotification',
    defaultMessage: 'Marriage on time fee updated',
    description:
      'Message for application marriage on time fee change notification'
  },
  applicationMarriageRegTargetChangeNotification: {
    id: 'config.application.marriageRegTargetChangeNotification',
    defaultMessage: 'Marriage registration target days updated',
    description:
      'Message for application marriage registration target change notification'
  },
  applicationMarriageDelayedFeeChangeNotification: {
    id: 'config.application.marriageDelayedFeeChangeNotification',
    defaultMessage: 'Marriage delayed fee updated',
    description:
      'Message for application marriage delayed fee change notification'
  },
  applicationCurrencyChangeMessage: {
    id: 'config.application.currencyChangeMessage',
    defaultMessage: 'Select your currency for your CRVS system',
    description: 'Message for application currency change modal'
  },
  applicationConfigUpdatingMessage: {
    id: 'config.application.updatingeMessage',
    defaultMessage: 'Updating...',
    description: 'Message for application config updated modal'
  },
  phoneNumberLabel: {
    id: 'config.application.phoneNumberLabel',
    defaultMessage: 'Phone number',
    description: 'Phone number config label'
  },
  nidPatternTitle: {
    id: 'config.application.nidPatternTitle',
    defaultMessage: 'Unique Identification Number (UIN) e.g. National ID',
    description: 'Unique Identification Number (UIN) config title'
  },
  nidPatternChangeMessage: {
    id: 'config.application.nidPatternChangeMessage',
    defaultMessage:
      'Set the regex pattern for your national ID. For guidance please refer to www.regex101.com',
    description: 'Unique Identification Number (UIN) config message'
  },
  nidPatternChangeError: {
    id: 'config.application.nidPatternChangeError',
    defaultMessage: 'Invalid regular expression for a National ID Number',
    description: 'Error message for invalid regular expression for NID number'
  },
  birthLegallySpecifiedDialogTitle: {
    id: 'config.application.birthLegallySpecifiedDialogTitle',
    defaultMessage: 'Legally specified time period for birth registration',
    description: 'Legally specified dialog title for brith'
  },
  birthDelayedDialogTitle: {
    id: 'config.application.birthDelayedDialogTitle',
    defaultMessage: 'Delayed registration time period for birth registration',
    description: 'Delayed dialog title for brith'
  },
  deathLegallySpecifiedDialogTitle: {
    id: 'config.application.deathLegallySpecifiedDialogTitle',
    defaultMessage: 'Legally specified time period for death registration',
    description: 'Legally specified dialog title for death'
  },
  marriageLegallySpecifiedDialogTitle: {
    id: 'config.application.marriageLegallySpecifiedDialogTitle',
    defaultMessage: 'Legally specified time period for marriage registration',
    description: 'Legally specified dialog title for marriage'
  },
  onTimeFeeDialogTitle: {
    id: 'config.application.onTimeFeeDialogTitle',
    defaultMessage: 'Registration fees within legally specified time',
    description: 'On time fee dialog title'
  },
  lateFeeDialogTitle: {
    id: 'config.application.lateFeeDialogTitle',
    defaultMessage: 'Registration fees for late registrations',
    description: 'Date fee dialog title'
  },
  delayedFeeDialogTitle: {
    id: 'config.application.delayedFeeDialogTitle',
    defaultMessage: 'Registration fees for delayed registrations',
    description: 'Delayed fee dialog title'
  },
  legallySpecifiedLabel: {
    id: 'config.application.legallySpecifiedLabel',
    defaultMessage: 'Legally specified',
    description: 'Legally specified config label'
  },
  legallySpecifiedValue: {
    id: 'config.application.legallySpecifiedValue',
    defaultMessage: 'Within {onTime} days',
    description: 'Legally specified config value'
  },
  lateRegistrationLabel: {
    id: 'config.application.lateRegistrationLabel',
    defaultMessage: 'Late registration',
    description: 'Late registration config label'
  },
  lateRegistrationValue: {
    id: 'config.application.lateRegistrationValue',
    defaultMessage: 'Between {onTime} days and {lateTime} days',
    description: 'Late registration config value'
  },
  delayedRegistrationLabel: {
    id: 'config.application.delayedRegistrationLabel',
    defaultMessage: 'Delayed registration',
    description: 'Delayed registration config label'
  },
  delayedRegistrationValue: {
    id: 'config.application.delayedRegistrationValue',
    defaultMessage: 'After {lateTime} days',
    description: 'Delayed registration config value'
  },
  withinLegallySpecifiedTimeLabel: {
    id: 'config.application.withinLegallySpecifiedTimeLabel',
    defaultMessage: 'Within legally specified time',
    description: 'Within legally specified time config label'
  },
  generalTabTitle: {
    id: 'config.application.generalTabTitle',
    defaultMessage: 'General',
    description: 'The title for general tab'
  },
  birthTabTitle: {
    id: 'config.application.birthTabTitle',
    defaultMessage: 'Birth',
    description: 'The title for birth tab'
  },
  birthTabTitleExport: {
    id: 'config.application.birthTabTitleExport',
    defaultMessage: 'Births',
    description: 'The title for birth tab for VSExport'
  },
  deathTabTitle: {
    id: 'config.application.deathTabTitle',
    defaultMessage: 'Death',
    description: 'The title for death tab'
  },
  marriageTabTitle: {
    id: 'config.application.marriageTabTitle',
    defaultMessage: 'Marriage',
    description: 'The title for marriage tab'
  },
  imageTabTitle: {
    id: 'config.application.imageTabTitle',
    defaultMessage: 'Image',
    description: 'The title for image tab'
  },
  colourTabTitle: {
    id: 'config.application.colourTabTitle',
    defaultMessage: 'Colour',
    description: 'The title for colour tab'
  },
  colourTabText: {
    id: 'config.application.colourTabText',
    defaultMessage: 'Hex code',
    description: 'The title for colour tab text'
  },
  deathTabTitleExport: {
    id: 'config.application.deathTabTitleExport',
    defaultMessage: 'Deaths',
    description: 'The title for death tab for VSExport'
  },
  registrationTimePeriodsGroupTitle: {
    id: 'config.application.registrationTimePeriodsGroupTitle',
    defaultMessage: 'Registration time periods',
    description: 'The title for registration time periods group'
  },
  registrationFeesGroupTitle: {
    id: 'config.application.registrationFeesGroupTitle',
    defaultMessage: 'Registration fees',
    description: 'The title for registration fee group'
  },
  eventTargetInputLabel: {
    id: 'config.application.eventTargetInputLabel',
    defaultMessage: 'days',
    description: 'The label for event target label'
  },
  pattern: {
    id: 'config.application.pattern',
    defaultMessage: 'Pattern',
    description: 'Label for Pattern'
  },
  example: {
    id: 'config.application.example',
    defaultMessage: 'Example',
    description: 'Label for Example'
  },
  testNumber: {
    id: 'config.application.testNumber',
    defaultMessage: 'Test number',
    description: 'Label for test number'
  },
  validExample: {
    id: 'config.application.validExample',
    defaultMessage: 'Valid',
    description: 'Label for valid example'
  },
  invalidExample: {
    id: 'config.application.invalidExample',
    defaultMessage: 'Invalid',
    description: 'Label for Invalid example'
  },
  nidPatternChangeNotification: {
    id: 'config.application.nidPatternChangeNotification',
    defaultMessage: 'NID Pattern of application updated',
    description: 'Message for NID Pattern change modal'
  },
  phoneNumberPatternTitle: {
    id: 'config.application.phoneNumberPatternTitle',
    defaultMessage: 'Phone number regex',
    description: 'Phone number config title'
  },
  phoneNumberChangeMessage: {
    id: 'config.application.phoneNumberChangeMessage',
    defaultMessage:
      'Set the regex pattern for your country phone number. For guidance please refer to www.regex101.com',
    description: 'phone number config config message'
  },
  phoneNumberChangeError: {
    id: 'config.application.phoneNumberChangeError',
    defaultMessage: 'Invalid regular expression for a phone number Number',
    description:
      'Error message for invalid regular expression for phone number number'
  },
  phoneNumberChangeNotification: {
    id: 'config.application.phoneNumberChangeNotification',
    defaultMessage: 'Phone Number Pattern Pattern of application updated',
    description: 'Message for phone number  Pattern change modal'
  },
  informantNotifications: {
    id: 'config.informantNotification.title',
    defaultMessage: 'Informant notifications',
    description: 'The title for Informant notifications'
  },
  informantNotificationSubtitle: {
    id: 'config.informantNotification.subtitle',
    defaultMessage:
      'Select the notifications to send to the informant to keep them informed of the progress to their declaration. Your system is configured to send {communicationType}.',
    description: 'Subtile for informant sms notification'
  },
  inProgressSMS: {
    id: 'config.informantNotification.inProgressSMS',
    defaultMessage: 'Notification sent to Office',
    description: 'Title for informant inProgressSMS notification'
  },
  declarationSMS: {
    id: 'config.informantNotification.declarationSMS',
    defaultMessage: 'Declaration sent for review',
    description: 'Title for informant declarationSMS notification'
  },
  registrationSMS: {
    id: 'config.informantNotification.registrationSMS',
    defaultMessage: 'Declaration registered',
    description: 'Title for informant registrationSMS notification'
  },
  rejectionSMS: {
    id: 'config.informantNotification.rejectionSMS',
    defaultMessage: 'Declaration rejected',
    description: 'Title for informant rejectionSMS notification'
  },
  informantNotificationUpdatingMessage: {
    id: 'config.informantNotification.success',
    defaultMessage: 'Informant notifications updated',
    description: 'Notification for informant update success'
  },
  template: {
    id: 'config.certificate.template',
    defaultMessage: 'Template',
    description: 'Template for certificates'
  },
  allowPrinting: {
    id: 'config.certificate.allowPrinting',
    defaultMessage: 'Allow printing in advanced of issuance',
    description: 'To allow printing in advanced of issuance'
  },
  options: {
    id: 'config.certificate.options',
    defaultMessage: 'Options',
    description: 'Show options'
  },
  allowPrintingDescription: {
    id: 'config.certificate.printDescription',
    defaultMessage:
      'Records printed off in advance of collections will be added to the ready to issue work-queue',
    description: 'Allowing printing'
  },
  updateAllowPrintingNotification: {
    id: 'config.certificate.allowPrintingNotification',
    defaultMessage: 'Allow printing in advance of issuance updated',
    description: 'Message for allowing printing notification'
  },
  userRoles: {
    id: 'config.userRoles.title',
    defaultMessage: 'User roles',
    description: 'The title for user roles'
  },
  userRolesSubtitle: {
    id: 'config.userRoles.subtitle',
    defaultMessage:
      'Map user roles to each system role so that specific permissions and privileges are correctly assigned. To learn more about the different system roles see ... {link}',
    description: 'Subtile for informant sms notification'
  },
  systemRoles: {
    id: 'config.userRoles.systemRoles',
    defaultMessage: 'SYSTEM ROLES',
    description: 'ListViewSimplified header for system roles'
  },
  systemRoleSuccessMsg: {
    id: 'config.userRoles.systemRoleSuccessMsg',
    defaultMessage: 'System role updated successfully',
    description: 'Label for System role updated success message'
  },
  role: {
    id: 'config.userRoles.role',
    defaultMessage: 'ROLE',
    description: 'ListViewSimplified header for role'
  },
  roleUpdateInstruction: {
    id: 'config.userRoles.roleUpdateInstruction',
    defaultMessage:
      'Add the roles to be assigned the system role of {systemRole}',
    description: 'Instruction for adding/updating role in role management modal'
  },
  language: {
    id: 'config.userRoles.language',
    defaultMessage: '{language}'
  }
}

export const messages: IConfigMessages = defineMessages(messagesToDefine)
