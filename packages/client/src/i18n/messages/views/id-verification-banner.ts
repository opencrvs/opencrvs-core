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
import { MessageDescriptor } from 'react-intl'

const pending: Record<string, MessageDescriptor> = {
  title: {
    id: 'views.idVerification.banner.pending.title',
    defaultMessage: 'ID Pending Verification'
  },
  description: {
    id: 'views.idVerification.banner.pending.description',
    defaultMessage:
      'The data has been pre-filled from the notifier’s ID card and can be edited. It will be authenticated after submission'
  }
}

const success: Record<string, MessageDescriptor> = {
  title: {
    id: 'views.idVerification.banner.success.title',
    defaultMessage: 'ID Verified'
  },
  description: {
    id: 'views.idVerification.banner.success.description',
    defaultMessage:
      'This identity data has been successfully verified with the Farajaland’s National ID System. Please note that their identity has not been authenticated using the individuals biometrics. To make edits, please remove the verification first.'
  }
}

const failed: Record<string, MessageDescriptor> = {
  title: {
    id: 'views.idVerification.banner.failed.title',
    defaultMessage: 'ID Verification Failed'
  },
  description: {
    id: 'views.idVerification.banner.pending.description',
    defaultMessage:
      'The identity card scanned has not be successfully authenticated'
  }
}

const actions: Record<string, MessageDescriptor> = {
  revoke: {
    id: 'views.idVerification.banner.actions.revoke',
    defaultMessage: 'Revoke'
  },
  reset: {
    id: 'views.idVerification.banner.actions.reset',
    defaultMessage: 'Reset'
  }
}

export const messages = {
  pending,
  success,
  failed,
  actions
}
