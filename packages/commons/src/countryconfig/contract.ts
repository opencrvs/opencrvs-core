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
import * as z from 'zod'
import { oc } from '@orpc/contract'
import { EventConfig } from '../events/EventConfig'
import { WorkqueueConfig } from '../events/WorkqueueConfig'
import { EventDocument } from '../events/EventDocument'
import { ActionTypes } from '../events/ActionType'
import { Roles } from '../roles'

export { implement } from '@orpc/server'

export const contract = {
  events: oc.output(z.array(EventConfig)),
  workqueue: oc.output(z.array(WorkqueueConfig)),
  roles: oc.output(Roles),
  application: {
    config: oc.output(z.any())
  },
  certificates: oc.output(z.any()),
  users: oc.output(z.any()),
  locations: oc.output(z.any()),
  trigger: oc
    .input(
      z.object({
        eventType: z.string(),
        actionType: ActionTypes,
        event: EventDocument
      })
    )
    .output(z.any()),
  content: oc.output(z.any())
}
