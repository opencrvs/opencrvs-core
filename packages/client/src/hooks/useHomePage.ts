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
import {
  REGISTRAR_HOME,
  ORGANISATIONS_INDEX,
  TEAM_USER_LIST,
  SYSTEM_LIST,
  ALL_USER_EMAIL,
  DASHBOARD
} from '@client/navigation/routes'
import { Path, useLocation } from 'react-router'
import { useNavigation } from './useNavigation'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generatePerformanceHomeUrl
} from '@client/navigation'
import { stringify } from 'querystring'
import { useSelector } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'

export const useHomePage = () => {
  const { pathname } = useLocation()
  const { routes } = useNavigation()
  const userDetails = useSelector(getUserDetails)

  const firstDashboard = window.config.DASHBOARDS?.at(0)?.id

  const tabs = routes.flatMap((navigationGroup) => navigationGroup.tabs)

  const firstNavItem = tabs
    .filter((tab) => {
      if (
        tab.name === WORKQUEUE_TABS.dashboard &&
        window.config.DASHBOARDS.length === 0
      ) {
        // ignores dashboard tab when no dashboard is configured
        return false
      }
      return true
    })
    .at(0)?.name

  let path: string | Partial<Path> = REGISTRAR_HOME

  switch (firstNavItem) {
    case WORKQUEUE_TABS.myDrafts:
    case WORKQUEUE_TABS.inProgress:
    case WORKQUEUE_TABS.sentForReview:
    case WORKQUEUE_TABS.readyForReview:
    case WORKQUEUE_TABS.requiresUpdate:
    case WORKQUEUE_TABS.sentForApproval:
    case WORKQUEUE_TABS.externalValidation:
    case WORKQUEUE_TABS.readyToPrint:
    case WORKQUEUE_TABS.readyToIssue:
    case WORKQUEUE_TABS.outbox:
      path = generateGoToHomeTabUrl({
        tabId: firstNavItem
      })
      break
    case WORKQUEUE_TABS.organisation:
      path = formatUrl(ORGANISATIONS_INDEX, {
        locationId: '' // NOTE: Empty string is required
      })
      break
    case WORKQUEUE_TABS.team:
      path = {
        pathname: TEAM_USER_LIST,
        search: stringify({
          locationId: userDetails?.primaryOffice.id
        })
      }
      break
    case WORKQUEUE_TABS.config:
    case WORKQUEUE_TABS.systems:
      path = SYSTEM_LIST
      break
    case WORKQUEUE_TABS.communications:
    case WORKQUEUE_TABS.emailAllUsers:
      path = ALL_USER_EMAIL
      break
    case WORKQUEUE_TABS.dashboard:
      path = formatUrl(DASHBOARD, { id: firstDashboard! })
      break
    case WORKQUEUE_TABS.performance:
      path = generatePerformanceHomeUrl({
        locationId: userDetails?.primaryOffice.id
      })
      break
  }

  return {
    path,
    isCurrentPageHome:
      typeof path === 'string'
        ? pathname.startsWith(path)
        : path.pathname
          ? pathname.startsWith(path.pathname)
          : false
  }
}
