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

import { DeclareIndex } from '@client/v2-events//features/events/actions/declare/Declare'
import { EventSelection } from '@client/v2-events/features/events/EventSelection'
import { Workqueues } from '@client/v2-events/features/workqueues'
import { EventOverviewIndex } from '@client/v2-events/features/workqueues/EventOverview/EventOverview'
import { WorkqueueIndex } from '@client/v2-events/features/workqueues/Workqueue'
import { TRPCProvider } from '@client/v2-events/trpc'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { ROUTES } from './routes'
import { ReviewSection } from '@client/v2-events/features/events/actions/declare/Review'

/**
 * Configuration for the routes of the v2-events feature.
 *
 * Each route is defined as a child of the `ROUTES.V2` route.
 */
export const routesConfig = {
  path: ROUTES.V2.path,
  element: (
    <TRPCProvider>
      <Outlet />
    </TRPCProvider>
  ),
  children: [
    {
      path: ROUTES.V2.path,
      // Alternative would be to create a navigation component that would be used here.
      element: (
        <Workqueues>
          <WorkqueueIndex />
        </Workqueues>
      ),
      children: [
        {
          index: true,
          path: ROUTES.V2.WORKQUEUE.path,
          element: <WorkqueueIndex />
        }
      ]
    },
    {
      path: ROUTES.V2.EVENTS.path,
      element: (
        <Workqueues>
          <Outlet />
        </Workqueues>
      ),
      children: [
        {
          path: ROUTES.V2.EVENTS.EVENT.path,
          element: <EventOverviewIndex />
        }
      ]
    },
    {
      path: ROUTES.V2.EVENTS.CREATE.path,
      element: <EventSelection />
    },
    {
      path: ROUTES.V2.EVENTS.DECLARE.EVENT.REVIEW.path,
      element: <ReviewSection />
    },
    {
      path: ROUTES.V2.EVENTS.DECLARE.EVENT.path,
      element: <DeclareIndex />
    },
    {
      path: ROUTES.V2.EVENTS.DECLARE.EVENT.PAGE.path,
      element: <DeclareIndex />
    }
  ]
}
