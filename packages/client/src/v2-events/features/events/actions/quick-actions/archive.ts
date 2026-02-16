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

export const archive: QuickActionConfig = {
  modal: {
    confirmButtonType: 'danger',
    confirmButtonLabel: {
      id: 'buttons.archive',
      defaultMessage: 'Archive',
      description: 'Archive button text'
    }
  },
  onConfirm: ({ eventId, actions }) => {
    return actions.archive.mutate({
      eventId,
      transactionId: uuid(),
      content: { reason: 'Archived from action menu' }
    })
  }
}
