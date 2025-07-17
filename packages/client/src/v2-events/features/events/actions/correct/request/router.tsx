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
import { Outlet } from 'react-router-dom'
import { ActionType } from '@opencrvs/commons/client'
import { DeclarationAction } from '@client/v2-events/features/events/components/Action/DeclarationAction'
import * as RequestCorrection from '@client/v2-events/features/events/actions/correct/request'
import { ROUTES } from '@client/v2-events/routes'

export const router = {
  path: ROUTES.V2.EVENTS.REQUEST_CORRECTION.path,
  element: (
    <DeclarationAction actionType={ActionType.REQUEST_CORRECTION}>
      <Outlet />
    </DeclarationAction>
  ),
  children: [
    {
      index: true,
      element: <RequestCorrection.Onboarding />
    },
    {
      path: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.path,
      element: <RequestCorrection.Onboarding />
    },
    {
      path: ROUTES.V2.EVENTS.REQUEST_CORRECTION.PAGES.path,
      element: <RequestCorrection.Pages />
    },
    {
      path: ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.path,
      element: <RequestCorrection.Review />
    },
    {
      path: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ADDITIONAL_DETAILS_INDEX.path,
      element: <RequestCorrection.AdditionalDetails />
    },
    {
      path: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ADDITIONAL_DETAILS.path,
      element: <RequestCorrection.AdditionalDetails />
    },
    {
      path: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.path,
      element: <RequestCorrection.Summary />
    }
  ]
}
