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

interface IWorkQueueMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  noRecordsDraft: MessageDescriptor
  noRecordsFieldAgents: MessageDescriptor
  noRecordsHealthSystem: MessageDescriptor
  noRecordsExternalValidation: MessageDescriptor
  noRecordsReadyForReview: MessageDescriptor
  noRecordsReadyToPrint: MessageDescriptor
  noRecordReadyToIssue: MessageDescriptor
  noRecordsRequireUpdates: MessageDescriptor
  noRecordsSentForApproval: MessageDescriptor
  noRecordsSentForReview: MessageDescriptor
}

const messagesToDefine: IWorkQueueMessages = {
  noRecordsDraft: {
    id: 'wq.noRecords.draft',
    defaultMessage: 'No records in progress',
    description: 'No records messages for empty draft tab'
  },
  noRecordsFieldAgents: {
    id: 'wq.noRecords.fieldAgents',
    defaultMessage: 'No records from field agents',
    description: 'No records messages for empty field agents tab'
  },
  noRecordsHealthSystem: {
    id: 'wq.noRecords.healthSystem',
    defaultMessage: 'No records from health system',
    description: 'No records messages for empty health system tab'
  },
  noRecordsExternalValidation: {
    id: 'wq.noRecords.externalValidation',
    defaultMessage: 'No records in external validation',
    description: 'No records messages for empty external validation tab'
  },
  noRecordsReadyForReview: {
    id: 'wq.noRecords.readyForReview',
    defaultMessage: 'No records ready for review',
    description: 'No records messages for ready for review tab'
  },
  noRecordsReadyToPrint: {
    id: 'wq.noRecords.readyToPrint',
    defaultMessage: 'No records ready to print',
    description: 'No records messages for ready to print tab'
  },
  noRecordReadyToIssue: {
    id: 'wq.noRecords.readyToIssue',
    defaultMessage: 'No records ready to issue',
    description: 'No records messages for ready to issue tab'
  },
  noRecordsRequireUpdates: {
    id: 'wq.noRecords.requiresUpdate',
    defaultMessage: 'No records require updates',
    description: 'No records messages for require updates tab'
  },
  noRecordsSentForApproval: {
    id: 'wq.noRecords.sentForApproval',
    defaultMessage: 'No records sent for approval',
    description: 'No records messages for sent for approval tab'
  },
  noRecordsSentForReview: {
    id: 'wq.noRecords.sentForReview',
    defaultMessage: 'No records sent for review',
    description: 'No records messages for sent for review tab'
  }
}

export const wqMessages: IWorkQueueMessages = defineMessages(messagesToDefine)
