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
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { RECORD_DECLARE_SCOPES, usePermissions } from './useAuthorization'

export interface Tab {
  name: string
  scopes?: Scope[]
  denyScopes?: Scope[]
}

export interface Group {
  group: string
  scopes?: Scope[]
  tabs: Tab[]
}

export interface NavigationConfig {
  name: string
  scopes?: Scope[]
  tabs: Tab[]
}

// TODO Potentially get this from country config
const routeAccess: NavigationConfig[] = [
  {
    name: TAB_GROUPS.declarations,
    tabs: [
      {
        name: WORKQUEUE_TABS.myDrafts,
        scopes: RECORD_DECLARE_SCOPES
      },
      {
        name: WORKQUEUE_TABS.inProgress,
        scopes: [
          SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
          SCOPES.RECORD_SUBMIT_FOR_UPDATES,
          SCOPES.RECORD_REGISTER
        ]
      },
      {
        name: WORKQUEUE_TABS.sentForReview,
        scopes: [SCOPES.RECORD_SUBMIT_FOR_REVIEW]
      },
      {
        name: WORKQUEUE_TABS.sentForApproval,
        scopes: [
          SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
          SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
        ]
      },
      {
        name: WORKQUEUE_TABS.requiresUpdate,
        scopes: [SCOPES.RECORD_SUBMIT_FOR_UPDATES]
      },
      {
        name: WORKQUEUE_TABS.readyForReview,
        scopes: [
          SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
          SCOPES.RECORD_SUBMIT_FOR_UPDATES,
          SCOPES.RECORD_REGISTER
        ]
      },
      {
        name: WORKQUEUE_TABS.readyToPrint,
        scopes: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES]
      },
      {
        name: WORKQUEUE_TABS.externalValidation,
        scopes: [SCOPES.RECORD_REGISTER]
      },
      {
        name: WORKQUEUE_TABS.readyToIssue,
        scopes: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES]
      },
      {
        name: WORKQUEUE_TABS.outbox,
        scopes: [
          SCOPES.RECORD_SUBMIT_INCOMPLETE,
          SCOPES.RECORD_SUBMIT_FOR_REVIEW,
          SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
          SCOPES.RECORD_SUBMIT_FOR_UPDATES,
          SCOPES.RECORD_REVIEW_DUPLICATES,
          SCOPES.RECORD_REGISTER,
          SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
          SCOPES.RECORD_REGISTRATION_CORRECT,
          SCOPES.RECORD_DECLARATION_ARCHIVE,
          SCOPES.RECORD_DECLARATION_REINSTATE
        ]
      }
    ]
  },
  {
    name: TAB_GROUPS.organisations,
    scopes: [
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      SCOPES.CONFIG_UPDATE_ALL
    ],
    tabs: [
      {
        name: WORKQUEUE_TABS.organisation,
        scopes: [
          SCOPES.ORGANISATION_READ_LOCATIONS,
          SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
          SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
        ]
      },
      {
        name: WORKQUEUE_TABS.team,
        scopes: [
          SCOPES.ORGANISATION_READ_LOCATIONS,
          SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
          SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
        ]
      },
      {
        name: WORKQUEUE_TABS.config,
        scopes: [SCOPES.CONFIG_UPDATE_ALL]
      },
      {
        name: WORKQUEUE_TABS.systems,
        scopes: [SCOPES.CONFIG_UPDATE_ALL]
      },
      {
        name: WORKQUEUE_TABS.communications,
        scopes: [SCOPES.CONFIG_UPDATE_ALL]
      },
      {
        name: WORKQUEUE_TABS.emailAllUsers,
        scopes: [SCOPES.CONFIG_UPDATE_ALL]
      }
    ]
  },
  {
    name: TAB_GROUPS.performance,
    scopes: [
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
      SCOPES.PERFORMANCE_READ_DASHBOARDS
    ],
    tabs: [
      {
        name: WORKQUEUE_TABS.dashboard,
        scopes: [SCOPES.PERFORMANCE_READ_DASHBOARDS]
      },
      {
        name: WORKQUEUE_TABS.statistics,
        scopes: [SCOPES.PERFORMANCE_READ]
      },
      {
        name: WORKQUEUE_TABS.leaderboards,
        scopes: [SCOPES.PERFORMANCE_READ]
      },
      {
        name: WORKQUEUE_TABS.performance,
        scopes: [SCOPES.PERFORMANCE_READ]
      },
      {
        name: WORKQUEUE_TABS.vsexports,
        scopes: [SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS]
      }
    ]
  }
]

export function useNavigation() {
  const { hasAnyScope } = usePermissions()

  const hasAccess = (scopes?: Scope[], denyScopes?: Scope[]): boolean => {
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
