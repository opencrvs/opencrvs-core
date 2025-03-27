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
export const ActionConfirmationResponseCodes = {
  FailInUncontrolledManner: 500, // Endpoint fails in an uncontrolled manner
  ActionRejected: 400, // Synchronous flow failed
  Success: 200, // Synchronous flow succeeded
  RequiresProcessing: 202 // Asynchronous flow succeeded, this expects that either the confirm or reject callback is called
} as const
