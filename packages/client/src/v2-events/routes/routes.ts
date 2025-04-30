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

export const ROUTES = {
  V2: route(
    'v2',
    {},
    {
      EVENTS: route(
        'events',
        {},
        {
          OVERVIEW: route('overview/:eventId', {
            params: { eventId: string().defined() }
          }),
          CREATE: route('create'),
          DELETE: route('delete/:eventId'),
          DECLARE: route(
            'declare/:eventId',
            {
              params: { eventId: string().defined() }
            },
            {
              REVIEW: route('review'),
              PAGES: route('pages/:pageId', {
                params: { pageId: string() },
                searchParams: {
                  from: string()
                },
                hash: hashValues()
              })
            }
          ),
          REGISTER: route(
            'register/:eventId',
            {
              params: { eventId: string().defined() }
            },
            {
              REVIEW: route('review'),
              PAGES: route('pages/:pageId', {
                params: { pageId: string() },
                searchParams: {
                  from: string()
                },
                hash: hashValues()
              })
            }
          ),
          VALIDATE: route('validate/:eventId', {
            params: { eventId: string().defined() }
          })
        }
      ),
      WORKQUEUE: route('workqueue', {
        searchParams: {
          id: string(),
          limit: zod(z.number().min(1).max(100)).default(10),
          offset: zod(z.number().min(0)).default(0)
        }
      })
    }
  )
}
