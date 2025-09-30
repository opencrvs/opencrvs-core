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
import { uuid } from '@client/v2-events/routes/utils'

export const requestRoutes = route(
  'request-correction/:eventId',
  {
    params: { eventId: uuid().defined() },
    searchParams: {
      workqueue: string()
    }
  },
  {
    ONBOARDING: route('onboarding/:pageId', {
      params: { pageId: string() },
      searchParams: {
        workqueue: string()
      },
      hash: hashValues()
    }),
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
        workqueue: string()
      }
    }),
    SUMMARY: route('summary', {
      searchParams: {
        workqueue: string()
      },
      hash: hashValues()
    })
  }
)

export const reviewRoutes = route(
  'review-correction/:eventId',
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
    })
  }
)
