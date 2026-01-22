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

import { Dashboard } from '@opencrvs/commons/client'

export function buildDashboardUrl({
  dashboard,
  token,
  locationId
}: {
  dashboard: Dashboard
  token: string
  locationId?: string
}) {
  const url = new URL(dashboard.url)
  const { context } = dashboard

  if (context?.forwardSearchParams && context.params?.includes('token')) {
    url.searchParams.set('token', token)
  }

  if (
    context?.forwardSearchParams &&
    context.params?.includes('locationId') &&
    locationId
  ) {
    url.searchParams.set('locationId', locationId)
  }

  return url.toString()
}
