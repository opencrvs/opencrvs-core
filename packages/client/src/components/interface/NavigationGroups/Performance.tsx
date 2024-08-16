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
import { usePermissions } from '@client/hooks/useAuthorization'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { IS_PROD_ENVIRONMENT } from '@client/utils/constants'
import { UserDetails } from '@client/utils/userUtils'
import { Icon, NavigationGroup, NavigationItem } from '@opencrvs/components'
import React from 'react'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import {
  goToDashboardView,
  goToLeaderBoardsView,
  goToPerformanceStatistics,
  goToPerformanceView,
  goToVSExport
} from '@client/navigation'

interface IPerformanceProps {
  activeMenuItem: string
  enableMenuSelection: boolean
  userDetails: UserDetails | null
}

const Performance = ({
  activeMenuItem,
  enableMenuSelection,
  userDetails
}: IPerformanceProps) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { hasScope, hasAnyScope } = usePermissions()
  const hasAnyPerformance = hasAnyScope([
    'performance.read',
    'performance.export-vital-statistics',
    'performance.read-dashboards'
  ])
  const hasPerformanceDashboards = hasScope('performance.read-dashboards')
  const hasPerformanceStatistics = hasScope('performance.read')
  const hasPerformanceLeaderboards = hasScope('performance.read')
  const hasPerformanceVitalStatisticsExports = hasScope(
    'performance.export-vital-statistics'
  )
  const hasPerformance = hasScope('performance.read')

  const showRegDashboard =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.REGISTRATIONS_DASHBOARD_URL)
  const showLeaderboard =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.LEADERBOARDS_DASHBOARD_URL)
  const showStatistics =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.STATISTICS_DASHBOARD_URL)

  return (
    <>
      {hasAnyPerformance && (
        <NavigationGroup>
          {
            <>
              {showRegDashboard && hasPerformanceDashboards && (
                <NavigationItem
                  icon={() => <Icon name="ChartLine" size="medium" />}
                  label={intl.formatMessage(navigationMessages['dashboard'])}
                  onClick={() => dispatch(goToDashboardView())}
                  id="navigation_dashboard"
                  isSelected={
                    enableMenuSelection && activeMenuItem === 'dashboard'
                  }
                />
              )}
              {showStatistics && hasPerformanceStatistics && (
                <NavigationItem
                  icon={() => <Icon name="Activity" size="medium" />}
                  label={intl.formatMessage(navigationMessages['statistics'])}
                  onClick={() => dispatch(goToPerformanceStatistics())}
                  id="navigation_statistics"
                  isSelected={
                    enableMenuSelection && activeMenuItem === 'statistics'
                  }
                />
              )}
              {showLeaderboard && hasPerformanceLeaderboards && (
                <NavigationItem
                  icon={() => <Icon name="Medal" size="medium" />}
                  label={intl.formatMessage(navigationMessages['leaderboards'])}
                  onClick={() => dispatch(goToLeaderBoardsView())}
                  id="navigation_leaderboards"
                  isSelected={
                    enableMenuSelection && activeMenuItem === 'leaderboards'
                  }
                />
              )}
              {hasPerformance && userDetails && (
                <NavigationItem
                  icon={() => <Icon name="ChartBar" size="medium" />}
                  label={intl.formatMessage(navigationMessages['performance'])}
                  onClick={() => dispatch(goToPerformanceView())}
                  id="navigation_report"
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.performance
                  }
                />
              )}
            </>
          }
          {hasPerformanceVitalStatisticsExports && (
            <NavigationItem
              icon={() => <Icon name="Export" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.vsexports}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.vsexports]
              )}
              onClick={() => dispatch(goToVSExport())}
              isSelected={
                enableMenuSelection &&
                activeMenuItem === WORKQUEUE_TABS.vsexports
              }
            />
          )}
        </NavigationGroup>
      )}
    </>
  )
}

export default Performance
