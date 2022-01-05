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
  deathDefaultTempDesc: MessageDescriptor
  listDetailsQsn: MessageDescriptor
}

const messagesToDefine: IConfigMessages = {
  applicationSettings: {
    id: 'config.applicationSettings',
    defaultMessage: 'Application settings',
    description: 'Link Text for Config Application Settings'
  },
  certificateConfiguration: {
    id: 'config.certificateConfiguration',
    defaultMessage: 'Certificate configuration',
    description: 'Link Text for Config Application Settings'
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
  deathDefaultTempDesc: {
    id: 'config.deathDefaultTempDesc',
    defaultMessage: 'Default death certificate template',
    description: 'Label for default death certificate template'
  }
}

export const messages: IConfigMessages = defineMessages(messagesToDefine)
