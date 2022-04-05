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
  declarationSettings: MessageDescriptor
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
}

const messagesToDefine: IConfigMessages = {
  declarationSettings: {
    id: 'config.declarationSettings',
    defaultMessage: 'Declaration settings',
    description: 'Link Text for Config Declaration Settings'
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
  }
}

export const messages: IConfigMessages = defineMessages(messagesToDefine)
