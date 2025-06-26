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

import React, { useEffect } from 'react'
import { Outlet, RouteObject, Routes } from 'react-router-dom'

import { ActionType } from '@opencrvs/commons/client'
import { Debug } from '@client/v2-events/features/debug/debug'
import { router as correctionRouter } from '@client/v2-events/features/events/actions/correct/request/router'
import * as Declare from '@client/v2-events/features/events/actions/declare'
import { DeleteEventIndex } from '@client/v2-events/features/events/actions/delete'
import * as PrintCertificate from '@client/v2-events/features/events/actions/print-certificate'
import * as Register from '@client/v2-events/features/events/actions/register'
import * as Validate from '@client/v2-events/features/events/actions/validate'
import {
  AdvancedSearch,
  SearchResult
} from '@client/v2-events/features/events/Search'
import { EventSelectionIndex } from '@client/v2-events/features/events/EventSelection'
import { EventOverviewIndex } from '@client/v2-events/features/workqueues/EventOverview/EventOverview'
import { router as workqueueRouter } from '@client/v2-events/features/workqueues/router'
import { EventOverviewLayout, WorkqueueLayout } from '@client/v2-events/layouts'
import { TRPCErrorBoundary } from '@client/v2-events/routes/TRPCErrorBoundary'
import {
  queryClient,
  trpcOptionsProxy,
  TRPCProvider
} from '@client/v2-events/trpc'
import { DeclarationAction } from '@client/v2-events/features/events/components/Action/DeclarationAction'
import { NavigationHistoryProvider } from '@client/v2-events/components/NavigationStack'
import { ReadonlyViewIndex } from '@client/v2-events/features/events/ReadOnlyView'
import { AnnotationAction } from '@client/v2-events/features/events/components/Action/AnnotationAction'
import { QuickSearchIndex } from '@client/v2-events/features/events/Search/QuickSearchIndex'
import { RedirectToWorkqueue } from '../layouts/redirectToWorkqueue'
import { ROUTES } from './routes'
import { Toaster } from './Toaster'

function PrefetchQueries() {
  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: trpcOptionsProxy.locations.get.queryKey()
    })
  }, [])

  return null
}

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
          <Toaster />
          <PrefetchQueries />
        </TRPCProvider>
      </TRPCErrorBoundary>
    </NavigationHistoryProvider>
  ),
  children: [
    {
      element: <RedirectToWorkqueue />,
      index: true
    },
    workqueueRouter,
    {
      path: ROUTES.V2.EVENTS.VIEW.path,
      element: <ReadonlyViewIndex />
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
        <DeclarationAction actionType={ActionType.DECLARE}>
          <Outlet />
        </DeclarationAction>
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
        <DeclarationAction actionType={ActionType.VALIDATE}>
          <Outlet />
        </DeclarationAction>
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
        <DeclarationAction actionType={ActionType.REGISTER}>
          <Outlet />
        </DeclarationAction>
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
        <AnnotationAction actionType={ActionType.PRINT_CERTIFICATE}>
          <Outlet />
        </AnnotationAction>
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
      element: (
        <WorkqueueLayout>
          <AdvancedSearch />
        </WorkqueueLayout>
      )
    },
    {
      path: ROUTES.V2.SEARCH_RESULT.path,
      element: (
        <WorkqueueLayout>
          <SearchResult />
        </WorkqueueLayout>
      )
    },
    {
      path: ROUTES.V2.SEARCH.path,
      element: (
        <WorkqueueLayout>
          <QuickSearchIndex />
        </WorkqueueLayout>
      )
    }
  ]
} satisfies RouteObject
