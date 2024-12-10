import React from 'react'
import { Outlet } from 'react-router-dom'
import { EventSelection } from '@client/v2-events/features/events/EventSelection'
import { EventFormWizardIndex } from '@client/v2-events/features/events/EventFormWizard'
import { TRPCProvider } from '@client/v2-events/trpc'
import { WorkqueueIndex } from '@client/v2-events/features/workqueues/Workqueue'
import { Workqueues } from '@client/v2-events/features/workqueues'
import { ROUTES } from './routes'
import { EventOverviewIndex } from '@client/v2-events/features/workqueues/EventOverview/EventOverview'

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
      path: ROUTES.V2.EVENTS.DECLARE.EVENT.path,
      element: <EventFormWizardIndex />
    }
  ]
}
