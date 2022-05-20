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
import { MessageDescriptor, defineMessages } from 'react-intl'

interface IAssignmentMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  assignDesc: MessageDescriptor
  assignedDesc: MessageDescriptor
  assignedTitle: MessageDescriptor
  assignTitle: MessageDescriptor
  regUnassignDesc: MessageDescriptor
  selfUnassignDesc: MessageDescriptor
  unassignTitle: MessageDescriptor
}

const messagesToDefine: IAssignmentMessages = {
  assignDesc: {
    defaultMessage:
      'Please note you will have sole access to this record. Please make any updates promptly otherwise unassign the record.',
    id: 'conflicts.modal.assign.description',
    description: 'Description for modal when assign'
  },
  assignedDesc: {
    defaultMessage:
      '{name} at {officeName} has sole editable access to this record',
    id: 'conflicts.modal.assigned.description',
    description: 'Description for modal when record already assigned'
  },
  assignedTitle: {
    defaultMessage: 'Assigned record',
    id: 'conflicts.modal.assigned.title',
    description: 'Title for modal when record already assigned'
  },
  assignTitle: {
    defaultMessage: 'Assign record?',
    id: 'conflicts.modal.assign.title',
    description: 'Title for modal when assign'
  },
  regUnassignDesc: {
    defaultMessage:
      '{name} at {officeName} currently has sole editable access to this record. Unassigning this record will mean their current edits will be lost. Please confirm you wish to continue.',
    id: 'conflicts.modal.regUnassign.description',
    description:
      'Description for modal when registrar wants to unassign an assigned user'
  },
  selfUnassignDesc: {
    defaultMessage:
      'Unassigning this record will mean that any current edits will be lost. Please confirm you wish to continue.',
    id: 'conflicts.modal.selfUnassign.description',
    description: 'Description for modal when user wants to unassign him/herself'
  },
  unassignTitle: {
    defaultMessage: 'Unassign record?',
    id: 'conflicts.modal.unassign.title',
    description: 'Title for modal when unassign record'
  }
}

export const conflictsMessages: IAssignmentMessages =
  defineMessages(messagesToDefine)
