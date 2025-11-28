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
import {
  ActionStatus,
  EventConfig,
  EventDocument,
  MarkAsDuplicateActionInput
} from '@opencrvs/commons/events'
import { TokenWithBearer } from '@opencrvs/commons'
import { processAction } from '@events/service/events/events'
import { TrpcUserContext } from '@events/context'

export async function markAsDuplicate(
  event: EventDocument,
  input: MarkAsDuplicateActionInput,
  user: TrpcUserContext,
  token: TokenWithBearer,
  configuration: EventConfig
) {
  return processAction(input, {
    event,
    user,
    token,
    status: ActionStatus.Accepted,
    configuration
  })
}
