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
import { v4 as uuid } from 'uuid'
import { QuickActionConfig } from './useQuickActionModal'

export const revoke: QuickActionConfig = {
  modal: {
    label: {
      id: 'event.action.revokeRegistration.modal.title',
      defaultMessage: 'Revoke this registration',
      description: 'Title of the revoke registration confirmation modal'
    },
    supportingCopy: {
      id: 'event.action.revokeRegistration.modal.supportingCopy',
      defaultMessage:
        'The registration is withdrawn and any certificate issued from it stops being valid. This is recorded on the record permanently.',
      description:
        'Supporting copy of the revoke registration confirmation modal'
    },
    confirmButtonType: 'negative',
    confirmButtonLabel: {
      id: 'buttons.revoke',
      defaultMessage: 'Revoke',
      description: 'Revoke button text'
    }
  },
  onConfirm: ({ eventId, actions, formValues }) => {
    return actions.revocation.revoke.mutate({
      eventId,
      transactionId: uuid(),
      annotation: formValues
    })
  }
}
