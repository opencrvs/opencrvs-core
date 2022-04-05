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
import { Message } from 'typescript-react-intl'
import { Description } from '@client/views/SysAdmin/Performance/utils'

interface IConfigMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  applicationSettings: MessageDescriptor
  applicationNameChangeMessage: MessageDescriptor
  govtLogoChangeMessage: MessageDescriptor
  govtLogoChangeNotification: MessageDescriptor
  govtLogoChangeError: MessageDescriptor
  govtLogoFileLimitError: MessageDescriptor
  applicationConfigChangeError: MessageDescriptor
  certificateConfiguration: MessageDescriptor
  declarationForms: MessageDescriptor
  previewTemplate: MessageDescriptor
  printTemplate: MessageDescriptor
  downloadTemplate: MessageDescriptor
  uploadTemplate: MessageDescriptor
  listTitle: MessageDescriptor
  listDetails: MessageDescriptor
  birthTemplate: MessageDescriptor
  deathTemplate: MessageDescriptor
  birthDefaultTempDesc: MessageDescriptor
  birthUpdatedTempDesc: MessageDescriptor
  deathDefaultTempDesc: MessageDescriptor
  deathUpdatedTempDesc: MessageDescriptor
  listDetailsQsn: MessageDescriptor
  formConfigPageTitle: MessageDescriptor
  birthFormConfigLabel: MessageDescriptor
  deathFormConfigLabel: MessageDescriptor
  formConfigPublishedTabLabel: MessageDescriptor
  formConfigDraftsTabLabel: MessageDescriptor
  formConfigInPreviewTabLabel: MessageDescriptor
  formConfigPageSubTitle: MessageDescriptor
  formConfigDefaultConfig: MessageDescriptor
  formConfigureButtonLabel: MessageDescriptor
  formConfigPublishButtonLabel: MessageDescriptor
  formConfigEditButtonLabel: MessageDescriptor
  previewFormConfiguration: MessageDescriptor
  finalizeFormConfiguration: MessageDescriptor
  deleteDraftMenuButton: MessageDescriptor
  applicationNameLabel: MessageDescriptor
  govermentLogoLabel: MessageDescriptor
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
  applicationCurrencyChangeMessage: MessageDescriptor
  phoneNumberLabel: MessageDescriptor
  birthLegallySpecifiedDialogTitle: MessageDescriptor
  birthDelayedDialogTitle: MessageDescriptor
  deathLegallySpecifiedDialogTitle: MessageDescriptor
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
  deathTabTitle: MessageDescriptor
  registrationTimePeriodsGroupTitle: MessageDescriptor
  registrationFeesGroupTitle: MessageDescriptor
  eventTargetInputLabel: MessageDescriptor
  pattern: MessageDescriptor
  example: MessageDescriptor
  testNumber: MessageDescriptor
  validExample: MessageDescriptor
  invalidExample: MessageDescriptor
}

const messagesToDefine: IConfigMessages = {
  applicationSettings: {
    id: 'config.application.settings',
    defaultMessage: 'Application',
    description: 'Link Text for Config Application Settings'
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
      'Upload the Government logo to be used on the login and form decalation. Note certificate logo is uploaded as part of the certificate template.',
    description: 'Message for government logo change modal'
  },
  govtLogoChangeNotification: {
    id: 'config.application.govtLogoChangeNotification',
    defaultMessage: 'Government logo updated',
    description: 'Message for government logo change notification'
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
  declarationForms: {
    id: 'config.declarationForms',
    defaultMessage: 'Declaration forms',
    description: 'Link Text for Config Declaration Forms'
  },
  formConfigPageTitle: {
    id: 'config.formConfigPageTitle',
    defaultMessage: 'Declaration Forms',
    description: 'Title for Form Configuration Page'
  },
  birthFormConfigLabel: {
    id: 'config.birthFormConfigLabel',
    defaultMessage: 'Birth',
    description: 'Label for birth form config template'
  },
  deathFormConfigLabel: {
    id: 'config.deathFormConfigLabel',
    defaultMessage: 'Death',
    description: 'Label for death form config template'
  },
  formConfigPublishedTabLabel: {
    id: 'config.formConfigPublishedTabLabel',
    defaultMessage: 'Published',
    description: 'Label for published tab of form config page'
  },
  formConfigDraftsTabLabel: {
    id: 'config.formConfigDraftsTabLabel',
    defaultMessage: 'Drafts',
    description: 'Label for drafts tab of form config page'
  },
  formConfigInPreviewTabLabel: {
    id: 'config.formConfigInPreviewTabLabel',
    defaultMessage: 'In preview',
    description: 'Label for in preview tab of form config page'
  },
  formConfigPublishButtonLabel: {
    id: 'config.formConfigPublishButtonLabel',
    defaultMessage: 'Publish',
    description: 'Label for publish button form config page'
  },
  formConfigEditButtonLabel: {
    id: 'config.formConfigEditButtonLabel',
    defaultMessage: 'Edit',
    description: 'Label for edit button form config page'
  },
  formConfigPageSubTitle: {
    id: 'config.formConfigPageSubtitle',
    defaultMessage: 'This is some supporting copy',
    description: 'Sub title of form configuration page'
  },
  formConfigDefaultConfig: {
    id: 'config.formConfigDefaultConfig',
    defaultMessage: 'Default configuration',
    description: 'Label for default form config template'
  },
  formConfigureButtonLabel: {
    id: 'config.formConfigureButtonLabel',
    defaultMessage: 'Configure',
    description: 'Label of configure button of form config page'
  },
  previewFormConfiguration: {
    id: 'config.previewFormConfiguration',
    defaultMessage: 'Preview',
    description: 'Label of preview button of form config page menu'
  },
  finalizeFormConfiguration: {
    id: 'config.finalizeFormConfiguration',
    defaultMessage: 'Finalize',
    description: 'Label of finalise button of form config page menu'
  },
  deleteDraftMenuButton: {
    id: 'config.deleteDraftMenuButton',
    defaultMessage: 'Delete',
    description: 'Label of delete button of form config page menu'
  },
  previewTemplate: {
    id: 'config.previewTemplate',
    defaultMessage: 'Preview',
    description: 'Preview action in certificate config action menu'
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
    defaultMessage: 'Certificates templates',
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
  birthDefaultTempDesc: {
    id: 'config.birthDefaultTempDesc',
    defaultMessage: 'Default birth certificate template',
    description: 'Label for default birth certificate template'
  },
  birthUpdatedTempDesc: {
    id: 'config.birthUpdatedTempDesc',
    defaultMessage: 'Updated {birthLongDate}',
    description: 'Label for updated birth certificate template'
  },
  deathDefaultTempDesc: {
    id: 'config.deathDefaultTempDesc',
    defaultMessage: 'Default death certificate template',
    description: 'Label for default death certificate template'
  },
  deathUpdatedTempDesc: {
    id: 'config.deathUpdatedTempDesc',
    defaultMessage: 'Updated {deathLongDate}',
    description: 'Label for updated death certificate template'
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
  applicationCurrencyChangeMessage: {
    id: 'config.application.currencyChangeMessage',
    defaultMessage: 'Select your currency for your CRVS system',
    description: 'Message for application currency change modal'
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
  deathTabTitle: {
    id: 'config.application.deathTabTitle',
    defaultMessage: 'Death',
    description: 'The title for death tab'
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
  }
}

export const messages: IConfigMessages = defineMessages(messagesToDefine)
