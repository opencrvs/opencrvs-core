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

export const register: QuickActionConfig = {
  description: {
    id: 'review.register.description.complete',
    defaultMessage:
      "By clicking 'Confirm', you confirm that the information entered is correct and the event can be registered."
  },
  onConfirm: ({ event, actions }) => {
    return actions.register.mutate({
      eventId: event.id,
      declaration: event.declaration,
      // @TODO Annotation is currently not used for this action. As part of custom actions work, we will add support for configuring annotation fields to the validate & register modals.
      annotation: {},
      transactionId: uuid()
    })
  }
}
