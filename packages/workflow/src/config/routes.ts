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
import { routes as correctionRoutes } from '@workflow/features/correction/routes'
import { fhirWorkflowEventHandler } from '@workflow/features/events/handler'
import { markEventAsRegisteredCallbackHandler } from '@workflow/features/registration/handler'
import createRecordHandler from '@workflow/records/handler/create'
import { unassignRecordHandler } from '@workflow/records/handler/unassign'
import { downloadRecordHandler } from '@workflow/records/handler/download'
import { updateRoute } from '@workflow/records/handler/update'
import { validateRoute } from '@workflow/records/handler/validate'

export const getRoutes = () => {
  const routes = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      config: {
        tags: ['api']
      }
    },
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      config: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    {
      method: 'POST',
      path: '/confirm/registration',
      handler: markEventAsRegisteredCallbackHandler,
      config: {
        tags: ['api'],
        description:
          'Register event based on tracking id and registration number.'
      }
    },
    ...correctionRoutes,
    {
      method: '*',
      path: '/fhir/{path*}',
      handler: fhirWorkflowEventHandler,
      config: {
        tags: ['api'],
        description:
          'Mimics the fhir API, detects OpenCRVS event and calls the correct workflow handler. Else, just forwards the request to Hearth.'
      }
    },
    {
      method: 'POST',
      path: '/create-record',
      handler: createRecordHandler,
      config: {
        tags: ['api'],
        description: 'Create record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/download-record',
      handler: downloadRecordHandler,
      config: {
        tags: ['api'],
        description: 'Create record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/unassign-record',
      handler: unassignRecordHandler,
      config: {
        tags: ['api'],
        description: 'Unassign record endpoint'
      }
    },
    ...validateRoute,
    ...updateRoute
  ]

  return routes
}
