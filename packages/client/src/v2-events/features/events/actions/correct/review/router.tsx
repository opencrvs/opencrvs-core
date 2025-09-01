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

import React from 'react'
import { ActionType } from '@opencrvs/commons/client'
import { DeclarationAction } from '@client/v2-events/features/events/components/Action/DeclarationAction'
import * as RequestCorrection from '@client/v2-events/features/events/actions/correct/request'
import { ROUTES } from '@client/v2-events/routes'

export const router = {
  path: ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW.path,
  element: (
    <DeclarationAction actionType={ActionType.APPROVE_CORRECTION}>
      <RequestCorrection.Review />
    </DeclarationAction>
  )
}
