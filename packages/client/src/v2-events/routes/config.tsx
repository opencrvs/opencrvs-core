import React from 'react'
import { Outlet } from 'react-router-dom'
import { EventSelection } from '@client/v2-events/features/events/EventSelection'
import { EventFormWizardIndex } from '@client/v2-events/features/events/EventFormWizard'
import { TRPCProvider } from '@client/v2-events/trcp'
import { WorkqueueIndex } from '@client/v2-events/features/workqueues/Workqueue'
import { Workqueues } from '@client/v2-events/features/workqueues'
import { ROUTES } from './routes'

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
          path: ROUTES.V2.EVENTS.VIEW.path,
          element: <WorkqueueIndex />
        }
      ]
    },
    {
      path: ROUTES.V2.EVENTS.CREATE.path,
      element: <EventSelection />
    },
    {
      path: ROUTES.V2.EVENTS.CREATE.EVENT.path,
      element: <EventFormWizardIndex />
    }
  ]
}
