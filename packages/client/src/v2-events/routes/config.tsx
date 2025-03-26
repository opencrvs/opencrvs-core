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
import { Outlet, RouteObject } from 'react-router-dom'

import { ActionType } from '@opencrvs/commons/client'
import { Debug } from '@client/v2-events/features/debug/debug'
import { router as correctionRouter } from '@client/v2-events/features/events/actions/correct/request/router'
import * as Declare from '@client/v2-events/features/events/actions/declare'
import { DeleteEventIndex } from '@client/v2-events/features/events/actions/delete'
import * as PrintCertificate from '@client/v2-events/features/events/actions/print-certificate'
import * as Register from '@client/v2-events/features/events/actions/register'
import * as Validate from '@client/v2-events/features/events/actions/validate'
import { AdvancedSearch, SearchResult } from '@client/v2-events/features/events/AdvancedSearch'
import { EventSelectionIndex } from '@client/v2-events/features/events/EventSelection'
import { EventOverviewIndex } from '@client/v2-events/features/workqueues/EventOverview/EventOverview'
import { router as workqueueRouter } from '@client/v2-events/features/workqueues/router'
import { EventOverviewLayout, WorkqueueLayout } from '@client/v2-events/layouts'
import { TRPCErrorBoundary } from '@client/v2-events/routes/TRPCErrorBoundary'
import { TRPCProvider } from '@client/v2-events/trpc'
import { Action } from '@client/v2-events/features/events/components/Action'
import { NavigationHistoryProvider } from '@client/v2-events/components/NavigationStack'
import { ReadOnlyView } from '@client/v2-events/features/events/ReadOnlyView'
import { ROUTES } from './routes'

/**
 * Configuration for the routes of the v2-events feature.
 *
 * Each route is defined as a child of the `ROUTES.V2` route.
 */

export const routesConfig = {
  path: ROUTES.V2.path,
  element: (
    <NavigationHistoryProvider>
      <TRPCErrorBoundary>
        <TRPCProvider>
          <Outlet />
          <Debug />
        </TRPCProvider>
      </TRPCErrorBoundary>
    </NavigationHistoryProvider>
  ),
  children: [
    workqueueRouter,
    {
      path: ROUTES.V2.EVENTS.VIEW.path,
      element: <ReadOnlyView />
    },
    {
      path: ROUTES.V2.EVENTS.OVERVIEW.path,
      element: (
        <EventOverviewLayout>
          <EventOverviewIndex />
        </EventOverviewLayout>
      )
    },
    {
      path: ROUTES.V2.EVENTS.CREATE.path,
      element: <EventSelectionIndex />
    },
    {
      path: ROUTES.V2.EVENTS.DELETE.path,
      element: <DeleteEventIndex />
    },
    {
      path: ROUTES.V2.EVENTS.DECLARE.path,
      element: (
        <Action type={ActionType.DECLARE}>
          <Outlet />
        </Action>
      ),
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
      path: ROUTES.V2.EVENTS.VALIDATE.path,
      element: (
        <Action type={ActionType.VALIDATE}>
          <Outlet />
        </Action>
      ),
      children: [
        {
          index: true,
          element: <Validate.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.VALIDATE.PAGES.path,
          element: <Validate.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.VALIDATE.REVIEW.path,
          element: <Validate.Review />
        }
      ]
    },
    correctionRouter,
    {
      path: ROUTES.V2.EVENTS.REGISTER.path,
      element: (
        <Action type={ActionType.REGISTER}>
          <Outlet />
        </Action>
      ),
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
    },
    {
      path: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.path,
      element: (
        <Action type={ActionType.PRINT_CERTIFICATE}>
          <Outlet />
        </Action>
      ),
      children: [
        {
          index: true,
          element: <PrintCertificate.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.path,
          element: <PrintCertificate.Pages />
        },
        {
          path: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.path,
          element: <PrintCertificate.Review />
        }
      ]
    },
    {
      path: ROUTES.V2.ADVANCED_SEARCH.path,
      element: <AdvancedSearch />
    },
    {
      path: ROUTES.V2.SEARCH_RESULT.path,
      element: (
        <WorkqueueLayout>
          <SearchResult />
        </WorkqueueLayout>
      )
    }
  ]
} satisfies RouteObject
