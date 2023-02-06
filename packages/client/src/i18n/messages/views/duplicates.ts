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

interface IDuplicateDeclarationMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  duplicateReviewHeader: MessageDescriptor
  duplicateContentTitle: MessageDescriptor
  duplicateContentSubtitle: MessageDescriptor
  notDuplicateButton: MessageDescriptor
  markAsDuplicateButton: MessageDescriptor
  duplicateComparePageTitle: MessageDescriptor
}

const messagesToDefine: IDuplicateDeclarationMessages = {
  duplicateReviewHeader: {
    id: 'duplicates.review.header',
    defaultMessage: 'Potential {event} duplicate review',
    description: 'Review page header for duplicates declarations'
  },
  duplicateContentTitle: {
    id: 'duplicates.content.title',
    defaultMessage: 'Is {name} ({trackingId}) a duplicate?',
    description: 'Duplicates content title message'
  },
  duplicateContentSubtitle: {
    id: 'duplicates.content.subtitle',
    defaultMessage:
      'This record was flagged as a potential duplicate with: {trackingIds}. Please review these existing records and confirm if this record is a duplicate',
    description: 'Duplicates content subtitle message'
  },
  notDuplicateButton: {
    id: 'duplicates.button.notDuplicate',
    defaultMessage: 'Not a duplicate',
    description: 'Not a duplicate button text'
  },
  markAsDuplicateButton: {
    id: 'duplicates.button.markAsDuplicate',
    defaultMessage: 'Mark as duplicate',
    description: 'Mark as duplicate button text'
  },
  markAsDuplicateConfirmationTitle: {
    id: 'duplicates.content.markAsDuplicate',
    defaultMessage: 'Mark {trackingId} as duplicate?',
    description: 'Mark as duplicate content confirmation title message'
  },
  duplicateDropdownMessage: {
    id: 'duplicates.content.duplicateDropdownMessage',
    defaultMessage: 'Duplicate of',
    description: 'Selecting from the duplicate trackingIds'
  },
  markAsDuplicateReason: {
    id: 'duplicates.content.markAsDuplicateReason',
    defaultMessage: 'Please describe your reason',
    description: 'Review page header for duplicates declarations'
  },
  duplicateComparePageTitle: {
    id: 'duplicates.compare.title',
    defaultMessage: 'Review {actualTrackingId} against {duplicateTrackingId}',
    description: 'Duplicate compare page title message'
  },
  duplicateComparePageSupportingDocuments: {
    id: 'duplicates.compare.supportingDocuments',
    defaultMessage: 'Supporting documents',
    description: 'Supporting documents header for duplicates comparison'
  }
}

export const duplicateMessages: IDuplicateDeclarationMessages =
  defineMessages(messagesToDefine)
