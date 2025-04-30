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
import { Debug } from '@client/v2-events/features/debug/debug'
import * as Declare from '@client/v2-events/features/events/actions/declare'
import { DeleteEvent } from '@client/v2-events/features/events/actions/delete'
import * as Register from '@client/v2-events/features/events/actions/register'
import { ValidateEvent } from '@client/v2-events/features/events/actions/validate'
import { EventSelection } from '@client/v2-events/features/events/EventSelection'
import { EventOverviewIndex } from '@client/v2-events/features/workqueues/EventOverview/EventOverview'
import { WorkqueueIndex } from '@client/v2-events/features/workqueues/Workqueue'
import { WorkqueueLayout } from '@client/v2-events/layouts'
import { TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES } from './routes'

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
      <Debug />
    </TRPCProvider>
  ),
  children: [
    {
      path: ROUTES.V2.path,
      // Alternative would be to create a navigation component that would be used here.
      element: (
        <WorkqueueLayout>
          <WorkqueueIndex />
        </WorkqueueLayout>
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
      path: ROUTES.V2.EVENTS.OVERVIEW.path,
      element: (
        <WorkqueueLayout>
          <EventOverviewIndex />
        </WorkqueueLayout>
      )
    },
    {
      path: ROUTES.V2.EVENTS.CREATE.path,
      element: <EventSelection />
    },
    {
      path: ROUTES.V2.EVENTS.DELETE.path,
      element: <DeleteEvent />
    },
    {
      path: ROUTES.V2.EVENTS.VALIDATE.path,
      element: <ValidateEvent />
    },
    {
      path: ROUTES.V2.EVENTS.DECLARE.path,
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <Declare.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.DECLARE.PAGES.path,
          element: <Declare.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.DECLARE.REVIEW.path,
          element: <Declare.Review />
        }
      ]
    },
    {
      path: ROUTES.V2.EVENTS.REGISTER.path,
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <Register.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.REGISTER.PAGES.path,
          element: <Register.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.REGISTER.REVIEW.path,
          element: <Register.Review />
        }
      ]
    }
  ]
}
