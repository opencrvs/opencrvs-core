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
import { markEventAsRegisteredCallbackHandler } from '@workflow/features/registration/handler'
import { certifyRoute } from '@workflow/records/handler/certify'
import { archiveRoute } from '@workflow/records/handler/archive'
import createRecordHandler from '@workflow/records/handler/create'
import { unassignRecordHandler } from '@workflow/records/handler/unassign'
import { downloadRecordHandler } from '@workflow/records/handler/download'
import { issueRoute } from '@workflow/records/handler/issue'
import { duplicateRecordHandler } from '@workflow/records/handler/duplicate'
import { registerRoute } from '@workflow/records/handler/register'
import { rejectRoute } from '@workflow/records/handler/reject'
import { reinstateRoute } from '@workflow/records/handler/reinstate'
import { updateRoute } from '@workflow/records/handler/update'
import { validateRoute } from '@workflow/records/handler/validate'
import { viewRecordHandler } from '@workflow/records/handler/view'
import { verifyRecordHandler } from '@workflow/records/handler/verify'
import { markAsNotDuplicateHandler } from '@workflow/records/handler/not-duplicate'

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
    {
      method: 'POST',
      path: '/records/{id}/view',
      handler: viewRecordHandler,
      config: {
        tags: ['api'],
        description: 'View record endpoint'
      }
    },
    ...validateRoute,
    ...updateRoute,
    ...registerRoute,
    certifyRoute,
    issueRoute,
    ...archiveRoute,
    rejectRoute,
    reinstateRoute,
    {
      method: 'POST',
      path: '/records/{id}/duplicate',
      handler: duplicateRecordHandler,
      config: {
        tags: ['api'],
        description: 'Unassign record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/{id}/verify',
      handler: verifyRecordHandler,
      config: {
        tags: ['api'],
        description: 'Verify record endpoint'
      }
    },
    {
      method: 'POST',
      path: '/records/{id}/not-duplicate',
      handler: markAsNotDuplicateHandler,
      config: {
        tags: ['api'],
        description: 'Mark as not-duplicate record endpoint'
      }
    }
  ]

  return routes
}
