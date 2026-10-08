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
import { buttonMessages } from '@client/i18n/messages'
import { QuickActionConfig } from './useQuickActionModal'

export const reinstate: QuickActionConfig = {
  modal: {
    supportingCopy: {
      id: 'event.action.reinstateRegistration.modal.supportingCopy',
      defaultMessage:
        'This will restore a previously revoked registration to active status.',
      description:
        'Supporting copy of the reinstate registration confirmation modal'
    },
    confirmButtonType: 'primary',
    confirmButtonLabel: buttonMessages.reinstate
  },
  onConfirm: ({ eventId, actions, formValues }) => {
    return actions.revocation.reinstate.mutate({
      eventId,
      transactionId: uuid(),
      annotation: formValues
    })
  }
}
