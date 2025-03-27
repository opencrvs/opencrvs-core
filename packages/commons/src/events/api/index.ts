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
export enum ActionConfirmationResponse {
  UnexpectedFailure, // Endpoint fails in an uncontrolled manner
  Rejected, // Synchronous flow failed
  Success, // Synchronous flow succeeded
  RequiresProcessing // Asynchronous flow succeeded, this expects that either the confirm or reject callback is called
}

export const ActionConfirmationResponseCodes = {
  400: ActionConfirmationResponse.Rejected,
  200: ActionConfirmationResponse.Success,
  202: ActionConfirmationResponse.RequiresProcessing
} as const
