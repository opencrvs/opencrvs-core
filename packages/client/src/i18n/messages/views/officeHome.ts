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

interface IOfficeHomeMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  progress: MessageDescriptor
  readyForReview: MessageDescriptor
  sentForReview: MessageDescriptor
  requiresUpdate: MessageDescriptor
  sentForUpdates: MessageDescriptor
  approvals: MessageDescriptor
  waitingValidation: MessageDescriptor
  print: MessageDescriptor
}
const messagesToDefine: IOfficeHomeMessages = {
  progress: {
    defaultMessage: 'No records in progress',
    description: 'No Application in In progress tab in officeHome',
    id: 'officeHome.progress'
  },
  readyForReview: {
    defaultMessage: 'No records ready for review',
    description: 'No Application in Ready for review tab in officeHome',
    id: 'officeHome.readyForReview'
  },
  sentForReview: {
    defaultMessage: 'No records sent for review',
    description: 'No Application in Sent for review tab in officeHome',
    id: 'officeHome.sentForReview'
  },
  requiresUpdate: {
    defaultMessage: 'No records requires update',
    description: 'No Application in Requires update tab in officeHome',
    id: 'officeHome.requiresUpdate'
  },
  sentForUpdates: {
    defaultMessage: 'No records sent for updates',
    description: 'No Application in Sent for updates tab in officeHome',
    id: 'officeHome.sentForUpdates'
  },
  approvals: {
    defaultMessage: 'No records sent for approval',
    description: 'No Application in Sent for approval tab in officeHome',
    id: 'officeHome.approvals'
  },
  waitingValidation: {
    defaultMessage: 'No records waiting for validation',
    description: 'No Application in Waiting for validation tab in officeHome',
    id: 'officeHome.waitingValidation'
  },
  print: {
    defaultMessage: 'No records ready to print',
    description: 'No Application in Ready to print tab in officeHome',
    id: 'officeHome.print'
  }
}
export const officeHomeMessages: IOfficeHomeMessages =
  defineMessages(messagesToDefine)
