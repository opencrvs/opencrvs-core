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
import { useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { stringify } from 'query-string'
import { Icon } from '@opencrvs/components/lib/Icon'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { NavigationSubItem } from '@opencrvs/components'
import {
  TAB_GROUPS,
  WORKQUEUE_TABS
} from '@client/components/interface/WorkQueueTabs'
import * as routes from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { useHasAccessToNavigationItem } from '@client/components/interface/useHasAccessToNavigationItem'

const conmmunicationTab: string[] = [
  WORKQUEUE_TABS.informantNotification,
  WORKQUEUE_TABS.emailAllUsers
]

/**
 * Based on packages/client/src/components/interface/Navigation.tsx
 *
 * @returns Navigation group for organisation-related tabs which link back to V1 organisation features.
 * */
export function OrganisationNavigationGroup({
  currentWorkqueueSlug,
  primaryOfficeId
}: {
  currentWorkqueueSlug?: string
  primaryOfficeId: string | undefined
}) {
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  const [isCommunicationExpanded, setIsCommunicationExpanded] =
    React.useState(false)

  const navigate = useNavigate()
  const intl = useIntl()

  const { hasAccess } = useHasAccessToNavigationItem()

  return (
    <>
      {hasAccess(TAB_GROUPS.organisations) && (
        <NavigationGroup>
          <NavigationItem
            icon={() => <Icon name="Buildings" size="small" />}
            id={`navigation_${WORKQUEUE_TABS.organisation}`}
            isSelected={currentWorkqueueSlug === WORKQUEUE_TABS.organisation}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.organisation]
            )}
            onClick={() =>
              navigate(
                formatUrl(routes.ORGANISATIONS_INDEX, {
                  locationId: '' // NOTE: Empty string is required
                })
              )
            }
          />
          {hasAccess(WORKQUEUE_TABS.team) && (
            <NavigationItem
              icon={() => <Icon name="Users" size="small" />}
              id={`navigation_${WORKQUEUE_TABS.team}`}
              isSelected={currentWorkqueueSlug === WORKQUEUE_TABS.team}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.team]
              )}
              onClick={() => {
                if (primaryOfficeId) {
                  navigate({
                    pathname: routes.TEAM_USER_LIST,
                    search: stringify({
                      locationId: primaryOfficeId
                    })
                  })
                }
              }}
            />
          )}

          {hasAccess(WORKQUEUE_TABS.config) && (
            <>
              <NavigationItem
                expandableIcon={() =>
                  isConfigExpanded ||
                  currentWorkqueueSlug === WORKQUEUE_TABS.systems ? (
                    <Expandable selected={true} />
                  ) : (
                    <Expandable />
                  )
                }
                icon={() => <Icon name="Compass" size="small" />}
                id={`navigation_${WORKQUEUE_TABS.config}_main`}
                isSelected={currentWorkqueueSlug === WORKQUEUE_TABS.systems}
                label={intl.formatMessage(
                  navigationMessages[WORKQUEUE_TABS.config]
                )}
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              />
              {(isConfigExpanded ||
                currentWorkqueueSlug === WORKQUEUE_TABS.systems) && (
                <NavigationSubItem
                  id={`navigation_${WORKQUEUE_TABS.systems}`}
                  isSelected={currentWorkqueueSlug === WORKQUEUE_TABS.systems}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.systems]
                  )}
                  onClick={() => navigate(routes.SYSTEM_LIST)}
                />
              )}
            </>
          )}
          {hasAccess(WORKQUEUE_TABS.config) && (
            <>
              <NavigationItem
                expandableIcon={() =>
                  isCommunicationExpanded ||
                  conmmunicationTab.some(
                    (tab) => tab === currentWorkqueueSlug
                  ) ? (
                    <Expandable selected={true} />
                  ) : (
                    <Expandable />
                  )
                }
                icon={() => <Icon name="ChatCircle" size="small" />}
                id={`navigation_${WORKQUEUE_TABS.communications}_main`}
                isSelected={conmmunicationTab.some(
                  (tab) => tab === currentWorkqueueSlug
                )}
                label={intl.formatMessage(
                  navigationMessages[WORKQUEUE_TABS.communications]
                )}
                onClick={() =>
                  setIsCommunicationExpanded(!isCommunicationExpanded)
                }
              />
              {(isCommunicationExpanded ||
                conmmunicationTab.some(
                  (tab) => tab === currentWorkqueueSlug
                )) && (
                <NavigationSubItem
                  id={`navigation_${WORKQUEUE_TABS.emailAllUsers}`}
                  isSelected={
                    currentWorkqueueSlug === WORKQUEUE_TABS.emailAllUsers
                  }
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.emailAllUsers]
                  )}
                  onClick={() => navigate(routes.ALL_USER_EMAIL)}
                />
              )}
            </>
          )}
        </NavigationGroup>
      )}
    </>
  )
}
