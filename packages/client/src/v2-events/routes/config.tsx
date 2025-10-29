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
import { Outlet, RouteObject } from 'react-router-dom'

import { useSelector } from 'react-redux'
import { ActionType, SCOPES } from '@opencrvs/commons/client'
import * as V1_LEGACY_ROUTES from '@client/navigation/routes'
import { Debug } from '@client/v2-events/features/debug/debug'
import { router as correctionRequestRouter } from '@client/v2-events/features/events/actions/correct/request/router'
import { router as correctionReviewRouter } from '@client/v2-events/features/events/actions/correct/review/router'
import * as Declare from '@client/v2-events/features/events/actions/declare'
import { DeleteEventIndex } from '@client/v2-events/features/events/actions/delete'
import * as PrintCertificate from '@client/v2-events/features/events/actions/print-certificate'
import * as Register from '@client/v2-events/features/events/actions/register'
import * as Validate from '@client/v2-events/features/events/actions/validate'
import {
  AdvancedSearch,
  SearchResult
} from '@client/v2-events/features/events/Search'
import { EventSelectionIndex } from '@client/v2-events/features/events/index'
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
import { getUserDetails } from '@client/profile/profileSelectors'
import { SettingsPage } from '@client/v2-events/features/settings/Settings'
import { TeamPage } from '@client/v2-events/features/team/Team'
import { OrganisationPage } from '@client/v2-events/features/organisation/Organisation'
import { RedirectToWorkqueue } from '../layouts/redirectToWorkqueue'
import { SearchLayout } from '../layouts/search'
import { useWorkqueues } from '../hooks/useWorkqueue'
import { ReviewDuplicateIndex } from '../features/events/actions/dedup/ReviewDuplicate'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { UserAudit } from '../../views/UserAudit/UserAudit'
import { SystemList } from '../../views/SysAdmin/Config/Systems/Systems'
import AllUserEmail from '../../views/SysAdmin/Communications/AllUserEmail/AllUserEmail'
import { ROUTES } from './routes'
import { Toaster } from './Toaster'

function PrefetchQueries() {
  const workqueues = useWorkqueues()
  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: trpcOptionsProxy.locations.list.queryKey()
    })

    function prefetch() {
      void workqueues.prefetch()
    }

    prefetch()
  }, [workqueues])

  return null
}

/**
 * Configuration for the routes of the v2-events feature.
 *
 * Each route is defined as a child of the `ROUTES.V2` route.
 */

export const routesConfig = {
  path: ROUTES.V2.path,
  Component: () => {
    const currentUser = useSelector(getUserDetails)

    if (!currentUser) {
      throw new Error(
        'V2 routes cannot be initialised without user details. Make sure user details are fetched before the routes are rendered'
      )
    }
    return (
      <NavigationHistoryProvider>
        <TRPCErrorBoundary>
          <TRPCProvider storeIdentifier={currentUser.id}>
            <Outlet />
            <Debug />
            <Toaster />
            <PrefetchQueries />
          </TRPCProvider>
        </TRPCErrorBoundary>
      </NavigationHistoryProvider>
    )
  },
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
    correctionRequestRouter,
    correctionReviewRouter,
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
      path: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.path,
      element: <ReviewDuplicateIndex />
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
        <SearchLayout>
          <AdvancedSearch />
        </SearchLayout>
      )
    },
    {
      path: ROUTES.V2.SEARCH_RESULT.path,
      element: (
        <SearchLayout>
          <SearchResult />
        </SearchLayout>
      )
    },
    {
      path: ROUTES.V2.SEARCH.path,
      element: (
        <SearchLayout>
          <QuickSearchIndex />
        </SearchLayout>
      )
    },
    {
      path: ROUTES.V2.SETTINGS.path,
      element: <SettingsPage />
    },
    /** LEGACY ROUTES
     * During regression testing QA discovered that we were still using old workqueues on some components.
     *  New 'WorkqueueLayout' requires TRPCProvider so we need to wrap these legacy routes inside V2 for minimal risk.
     */
    {
      path: ROUTES.V2.path + V1_LEGACY_ROUTES.TEAM_USER_LIST,
      element: (
        <ProtectedRoute
          scopes={[
            SCOPES.ORGANISATION_READ_LOCATIONS,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
          ]}
        >
          <TeamPage />
        </ProtectedRoute>
      )
    },
    {
      path: ROUTES.V2.path + V1_LEGACY_ROUTES.USER_PROFILE,
      element: (
        <WorkqueueLayout>
          <UserAudit hideNavigation={true} />
        </WorkqueueLayout>
      )
    },
    {
      path: ROUTES.V2.path + V1_LEGACY_ROUTES.ORGANISATIONS_INDEX,
      element: (
        <ProtectedRoute
          scopes={[
            SCOPES.ORGANISATION_READ_LOCATIONS,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
          ]}
        >
          <OrganisationPage />
        </ProtectedRoute>
      )
    },
    {
      path: ROUTES.V2.path + V1_LEGACY_ROUTES.SYSTEM_LIST,
      element: (
        <ProtectedRoute scopes={[SCOPES.CONFIG_UPDATE_ALL]}>
          <WorkqueueLayout>
            <SystemList hideNavigation={true} />
          </WorkqueueLayout>
        </ProtectedRoute>
      )
    },
    {
      path: ROUTES.V2.path + V1_LEGACY_ROUTES.ALL_USER_EMAIL,
      element: (
        <ProtectedRoute scopes={[SCOPES.CONFIG_UPDATE_ALL]}>
          <WorkqueueLayout>
            <AllUserEmail hideNavigation={true} />
          </WorkqueueLayout>
        </ProtectedRoute>
      )
    }
  ]
} satisfies RouteObject
