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

interface IRecordAuditMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  status: MessageDescriptor
  type: MessageDescriptor
  trackingId: MessageDescriptor
  dateOfBirth: MessageDescriptor
  dateOfDeath: MessageDescriptor
  placeOfBirth: MessageDescriptor
  placeOfDeath: MessageDescriptor
  informant: MessageDescriptor
  brn: MessageDescriptor
  drn: MessageDescriptor
  noStatus: MessageDescriptor
  noType: MessageDescriptor
  noTrackingId: MessageDescriptor
  noDateOfBirth: MessageDescriptor
  noDateOfDeath: MessageDescriptor
  noPlaceOfBirth: MessageDescriptor
  noPlaceOfDeath: MessageDescriptor
  noInformant: MessageDescriptor
}

interface IDynamicUserMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  [key: string]: MessageDescriptor
}

const messagesToDefine: IRecordAuditMessages = {
  status: {
    id: 'recordAudit.status',
    defaultMessage: 'Status',
    description: 'Label for status'
  },
  type: {
    id: 'recordAudit.type',
    defaultMessage: 'Event',
    description: 'Label for event type'
  },
  trackingId: {
    id: 'recordAudit.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking id'
  },
  dateOfBirth: {
    id: 'recordAudit.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for date of birth'
  },
  dateOfDeath: {
    id: 'recordAudit.dateOfDeath',
    defaultMessage: 'Date of death',
    description: 'Label for date of death'
  },
  placeOfBirth: {
    id: 'recordAudit.placeOfBirth',
    defaultMessage: 'Place of birth',
    description: 'Label for place of birth'
  },
  placeOfDeath: {
    id: 'recordAudit.placeOfDeath',
    defaultMessage: 'Place of death',
    description: 'Label for place of death'
  },
  informant: {
    id: 'recordAudit.informant',
    defaultMessage: 'Informant',
    description: 'Label for informant'
  },
  brn: {
    id: 'recordAudit.brn',
    defaultMessage: 'BRN',
    description: 'Label for Birth Registration Number'
  },
  drn: {
    id: 'recordAudit.drn',
    defaultMessage: 'DRN',
    description: 'Label for Death Registration Number'
  },
  noStatus: {
    id: 'recordAudit.noStatus',
    defaultMessage: 'No status',
    description: 'Label for status not available'
  },
  noType: {
    id: 'recordAudit.noType',
    defaultMessage: 'No event',
    description: 'Label for type of event not available'
  },
  noTrackingId: {
    id: 'recordAudit.noTrackingId',
    defaultMessage: 'No tracking id',
    description: 'Label for tracking id not available'
  },
  noDateOfBirth: {
    id: 'recordAudit.noDateOfBirth',
    defaultMessage: 'No date of birth',
    description: 'Label for date of birth not available'
  },
  noDateOfDeath: {
    id: 'recordAudit.noDateOfDeath',
    defaultMessage: 'No date of death',
    description: 'Label for date of death not available'
  },
  noPlaceOfBirth: {
    id: 'recordAudit.noPlaceOfBirth',
    defaultMessage: 'No place of birth',
    description: 'Label for place of birth not available'
  },
  noPlaceOfDeath: {
    id: 'recordAudit.noPlaceOfDeath',
    defaultMessage: 'No place of death',
    description: 'Label for place of death not availale'
  },
  noInformant: {
    id: 'recordAudit.noInformant',
    defaultMessage: 'No Informant',
    description: 'Label for informant not available'
  }
}
export const recordAuditMessages: IRecordAuditMessages | IDynamicUserMessages =
  defineMessages(messagesToDefine)
