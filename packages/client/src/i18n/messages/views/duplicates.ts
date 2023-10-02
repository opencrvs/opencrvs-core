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

interface IDuplicateDeclarationMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  duplicateDeclarationDetails: MessageDescriptor
  duplicateReviewHeader: MessageDescriptor
  duplicateContentTitle: MessageDescriptor
  duplicateContentSubtitle: MessageDescriptor
  notDuplicateButton: MessageDescriptor
  markAsDuplicateButton: MessageDescriptor
  notDuplicateContentConfirmationTitle: MessageDescriptor
  duplicateComparePageTitle: MessageDescriptor
}

const messagesToDefine: IDuplicateDeclarationMessages = {
  duplicateDeclarationDetails: {
    id: 'duplicates.content.header',
    defaultMessage: 'Declaration Details',
    description: 'Declaration details header of two duplicate ones'
  },
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
      'This record was flagged as a potential duplicate of: {trackingIds}. Please review these by clicking on each tracking ID in the tab section to view a side-by-side comparison below, and confirm if this record is a duplicate.',
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
  notDuplicateContentConfirmationTitle: {
    id: 'duplicates.content.notDuplicateConfirmationTitle',
    defaultMessage: 'Are you sure {name} ({trackingId}) is not duplicate?',
    description: 'Not a duplicate content confirmation title message'
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
