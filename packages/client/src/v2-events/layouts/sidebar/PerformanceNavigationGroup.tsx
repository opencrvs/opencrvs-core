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

import * as React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { SCOPES } from '@opencrvs/commons/client'
import { Icon } from '@opencrvs/components/lib/Icon'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { usePermissions } from '@client/hooks/useAuthorization'
import { ROUTES } from '@client/v2-events/routes'

/**
 * Based on packages/client/src/components/interface/Navigation.tsx
 *
 * @returns Navigation group for performance-related tabs which link back to V1 performance features.
 */
export function PerformanceNavigationGroup({
  currentWorkqueueSlug
}: {
  currentWorkqueueSlug?: string
}) {
  const intl = useIntl()
  const navigate = useNavigate()
  const { hasScope } = usePermissions()
  return (
    <>
      {hasScope(SCOPES.PERFORMANCE_READ_DASHBOARDS) && (
        <NavigationGroup>
          {
            <>
              {window.config.DASHBOARDS.map((config) => {
                return (
                  <NavigationItem
                    key={config.id}
                    icon={() => <Icon name="ChartLine" size="small" />}
                    id={`navigation_dashboard_${config.id}`}
                    isSelected={currentWorkqueueSlug === 'dashboard'}
                    label={intl.formatMessage(config.title)}
                    onClick={() => {
                      navigate(
                        `${ROUTES.V2.DASHBOARD.buildPath({ id: config.id })}`
                      )
                    }}
                  />
                )
              })}
            </>
          }
        </NavigationGroup>
      )}
    </>
  )
}
