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
import { WorkqueueIndex } from '@client/v2-events/features/workqueues/Workqueue'
import { WorkqueueLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { TRPCProvider } from '@client/v2-events/trpc'

/**
 * Configuration for the routes of the v2-events feature.
 *
 * Each route is defined as a child of the `ROUTES.V2` route.
 */
export const router = {
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
    }
  ]
}
