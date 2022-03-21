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

interface IConfigMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  applicationSettings: MessageDescriptor
  applicationNameChangeMessage: MessageDescriptor
  applicationConfigChangeError: MessageDescriptor
  certificateConfiguration: MessageDescriptor
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
  applicationNameLabel: MessageDescriptor
  govermentLogoLabel: MessageDescriptor
  currencyLable: MessageDescriptor
  applicationCurrencyChangeNotification: MessageDescriptor
  applicationCurrencyChangeMessage: MessageDescriptor
  phoneNumberLabel: MessageDescriptor
  uniqueIdentificationNumberLabel: MessageDescriptor
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
  certificateConfiguration: {
    id: 'config.certificateConfiguration',
    defaultMessage: 'Certificate configuration',
    description: 'Link Text for Config Declaration Settings'
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
    defaultMessage: 'Goverment logo',
    description: 'Goverment logo config label'
  },
  currencyLable: {
    id: 'config.application.currencyLable',
    defaultMessage: 'Currency',
    description: 'Currency config label'
  },
  applicationCurrencyChangeNotification: {
    id: 'config.application.currencyChangeNotification',
    defaultMessage: 'Currency updated',
    description: 'Message for application currency change notification'
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
  uniqueIdentificationNumberLabel: {
    id: 'config.application.uniqueIdentificationNumberLabel',
    defaultMessage: 'Unique Identification Number (UIN) e.g. National ID',
    description: 'Unique Identification Number (UIN) config label'
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
  }
}

export const messages: IConfigMessages = defineMessages(messagesToDefine)
