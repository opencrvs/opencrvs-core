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

import { hashValues, route, string } from 'react-router-typesafe-routes/dom'
import { zod } from 'react-router-typesafe-routes/zod'
import { z } from 'zod'
import { config } from '@client/config'
import {
  requestRoutes as correctionRequestRoutes,
  reviewRoutes as correctionReviewRoutes
} from '@client/v2-events/features/events/actions/correct/request/routes'
import { routes as workqueueRoutes } from '@client/v2-events/features/workqueues/routes'
import { uuid } from './utils'

export const ROUTES = {
  V2: route(
    '',
    {},
    {
      EVENTS: route(
        'events',
        {},
        {
          VIEW: route('view/:eventId', {
            params: { eventId: uuid().defined() },
            searchParams: {
              workqueue: string()
            }
          }),
          OVERVIEW: route('overview/:eventId', {
            params: { eventId: uuid().defined() },
            searchParams: {
              workqueue: string()
            }
          }),
          CREATE: route('create', {
            searchParams: {
              workqueue: string()
            }
          }),
          DELETE: route('delete/:eventId', {
            searchParams: {
              workqueue: string()
            }
          }),
          DECLARE: route(
            'declare/:eventId',
            {
              params: { eventId: uuid().defined() },
              searchParams: {
                workqueue: string()
              }
            },
            {
              REVIEW: route('review', {
                searchParams: {
                  workqueue: string()
                }
              }),
              PAGES: route('pages/:pageId', {
                params: { pageId: string() },
                searchParams: {
                  from: string(),
                  workqueue: string()
                },
                hash: hashValues()
              })
            }
          ),
          VALIDATE: route(
            'validate/:eventId',
            {
              params: { eventId: uuid().defined() },
              searchParams: {
                workqueue: string()
              }
            },
            {
              REVIEW: route('review', {
                searchParams: {
                  workqueue: string()
                }
              }),
              PAGES: route('pages/:pageId', {
                params: { pageId: string() },
                searchParams: {
                  from: string(),
                  workqueue: string()
                },
                hash: hashValues()
              })
            }
          ),
          REGISTER: route(
            'register/:eventId',
            {
              params: { eventId: uuid().defined() },
              searchParams: {
                workqueue: string()
              }
            },
            {
              REVIEW: route('review', {
                searchParams: {
                  workqueue: string()
                }
              }),
              PAGES: route('pages/:pageId', {
                params: { pageId: string() },
                searchParams: {
                  from: string(),
                  workqueue: string()
                },
                hash: hashValues()
              })
            }
          ),
          PRINT_CERTIFICATE: route(
            'print-certificate/:eventId',
            {
              params: { eventId: uuid().defined() },
              searchParams: {
                workqueue: string()
              }
            },
            {
              PAGES: route('pages/:pageId', {
                params: { pageId: string() },
                searchParams: {
                  from: string(),
                  workqueue: string()
                },
                hash: hashValues()
              }),
              REVIEW: route('review', {
                searchParams: {
                  templateId: string(),
                  workqueue: string()
                }
              })
            }
          ),
          REVIEW_POTENTIAL_DUPLICATE: route('review-duplicate/:eventId', {
            params: { eventId: uuid().defined() },
            searchParams: {
              workqueue: string()
            }
          }),
          REQUEST_CORRECTION: correctionRequestRoutes,
          REVIEW_CORRECTION: correctionReviewRoutes
        }
      ),
      WORKQUEUES: workqueueRoutes,
      ADVANCED_SEARCH: route('advanced-search'),
      SEARCH_RESULT: route('search-result/:eventType', {
        params: { eventType: string().defined() },
        searchParams: {
          limit: zod(z.number().min(1).max(100)).default(10),
          offset: zod(z.number().min(0)).default(0)
        }
      }),
      SEARCH: route('search', {
        searchParams: {
          limit: zod(z.number().min(1).max(100)).default(10),
          offset: zod(z.number().min(0)).default(0)
        }
      }),
      SETTINGS: route('settings', {})
    }
  )
}
