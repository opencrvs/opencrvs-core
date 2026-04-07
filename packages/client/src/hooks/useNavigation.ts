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
  TAB_GROUPS,
  WORKQUEUE_TABS
} from '@client/components/interface/WorkQueueTabs'
import { ScopeType } from '@opencrvs/commons/client'
import { usePermissions } from './useAuthorization'

interface Tab {
  name: string
  scopes?: ScopeType[]
  denyScopes?: string[]
}

interface NavigationConfig {
  name: string
  scopes?: ScopeType[]
  tabs: Tab[]
}

// TODO Potentially get this from country config
const routeAccess: NavigationConfig[] = [
  {
    name: TAB_GROUPS.organisations,
    scopes: ['organisation.read-locations', 'config.update-all'],
    tabs: [
      {
        name: WORKQUEUE_TABS.organisation,
        scopes: ['organisation.read-locations']
      },
      {
        name: WORKQUEUE_TABS.team,
        scopes: ['organisation.read-locations']
      },
      {
        name: WORKQUEUE_TABS.config,
        scopes: ['config.update-all']
      },
      {
        name: WORKQUEUE_TABS.systems,
        scopes: ['integration.create']
      },
      {
        name: WORKQUEUE_TABS.communications,
        scopes: ['config.update-all']
      },
      {
        name: WORKQUEUE_TABS.emailAllUsers,
        scopes: ['config.update-all']
      }
    ]
  },
  {
    name: TAB_GROUPS.performance,
    scopes: [
      'performance.read',
      'performance.read-dashboards',
      'performance.vital-statistics-export'
    ],
    tabs: [
      {
        name: WORKQUEUE_TABS.dashboard,
        scopes: ['performance.read-dashboards']
      },
      {
        name: WORKQUEUE_TABS.performance,
        scopes: ['performance.read']
      },
      {
        name: WORKQUEUE_TABS.vsexports,
        scopes: ['performance.vital-statistics-export']
      }
    ]
  }
]

export function useNavigation() {
  const { hasAnyScope } = usePermissions()

  const hasAccess = (scopes?: string[], denyScopes?: string[]): boolean => {
    const hasRequiredScope =
      !scopes || scopes.length === 0 || hasAnyScope(scopes)
    const hasDeniedScope = denyScopes && hasAnyScope(denyScopes)

    return hasRequiredScope && !hasDeniedScope
  }

  const routes = routeAccess.reduce((acc, group) => {
    if (!hasAccess(group.scopes)) {
      return acc
    }
    const groupAccess = {
      name: group.name,
      tabs: group.tabs
        .filter((tab) => hasAccess(tab.scopes, tab.denyScopes))
        .map((filteredTab) => ({
          name: filteredTab.name
        }))
    }
    acc.push(groupAccess)
    return acc
  }, [] as NavigationConfig[])
  return { routes }
}
