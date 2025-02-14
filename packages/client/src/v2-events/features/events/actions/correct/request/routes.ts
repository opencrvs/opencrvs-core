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

export const routes = route(
  'request-correction/:eventId',
  {
    params: { eventId: string().defined() }
  },
  {
    ONBOARDING: route('onboarding/:pageId', {
      params: { pageId: string() },
      hash: hashValues()
    }),
    PAGES: route('pages/:pageId', {
      params: { pageId: string() },
      searchParams: {
        from: string()
      },
      hash: hashValues()
    }),
    REVIEW: route('review'),
    ADDITIONAL_DETAILS_INDEX: route('details', {
      params: { pageId: string() },
      hash: hashValues()
    }),
    ADDITIONAL_DETAILS: route('details/:pageId', {
      params: { pageId: string() },
      hash: hashValues()
    }),
    SUMMARY: route('summary', {
      hash: hashValues()
    })
  }
)
