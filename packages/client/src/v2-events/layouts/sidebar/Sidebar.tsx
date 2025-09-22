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
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { Icon } from '@opencrvs/components/lib/Icon'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LeftNavigation } from '@opencrvs/components/lib/SideNavigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { joinValues, WorkqueueConfig } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'
import { storage } from '@client/storage'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { useCountryConfigWorkqueueConfigurations } from '@client/v2-events/features/events/useCountryConfigWorkqueueConfigurations'
import { ROUTES } from '@client/v2-events/routes'
import { removeToken } from '@client/utils/authUtils'
import * as routes from '@client/navigation/routes'
import {
  getIndividualNameObj,
  removeUserDetails
} from '@client/utils/userUtils'
import { getOfflineData } from '@client/offline/selectors'
import { useWorkqueue } from '@client/v2-events/hooks/useWorkqueue'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { getLanguage } from '@client/i18n/selectors'
import { Avatar } from '@client/components/Avatar'
import { hasDraftWorkqueue, WORKQUEUE_DRAFT } from '@client/v2-events/utils'
import { hasOutboxWorkqueue, WORKQUEUE_OUTBOX } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { OrganisationNavigationGroup } from './OrganisationNavigationGroup'
import { PerformanceNavigationGroup } from './PerformanceNavigationGroup'

const SCREEN_LOCK = 'screenLock'

export function Workqueues({
  workqueues,
  currentWorkqueueSlug,
  menuCollapse
}: {
  workqueues: WorkqueueConfig[]
  currentWorkqueueSlug?: string
  menuCollapse?: () => void /* Only relevant for mobile view */
}) {
  const intl = useIntl()
  const navigate = useNavigate()
  const { getCount } = useWorkqueue(currentWorkqueueSlug ?? '')
  const counts = getCount.useSuspenseQuery()

  return workqueues.map(({ name: label, slug, icon }) => (
    <NavigationItem
      key={slug}
      count={counts[slug] || 0}
      data-testid={`navigation_workqueue_${slug}`}
      icon={() => <Icon name={icon} size="small" />}
      id={`navigation_workqueue_${slug}`}
      isSelected={slug === currentWorkqueueSlug}
      label={intl.formatMessage(label)}
      onClick={() => {
        navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: slug }))
        menuCollapse?.()
      }}
    />
  ))
}

export const Sidebar = ({
  menuCollapse,
  navigationWidth,
  isMobileView = false
}: {
  menuCollapse?: () => void // Only relevant for mobile view
  navigationWidth?: number
  isMobileView?: boolean
}) => {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const intl = useIntl()
  const scopes = useSelector(getScope)

  const { getOutbox } = useEvents()
  const outbox = getOutbox()

  const { getAllRemoteDrafts } = useDrafts()
  const drafts = getAllRemoteDrafts()

  const workqueues = useCountryConfigWorkqueueConfigurations()

  const hasOutbox = hasOutboxWorkqueue(scopes ?? [])
  const hasDraft = hasDraftWorkqueue(scopes ?? [])

  const navigate = useNavigate()
  const offlineCountryConfig = useSelector(getOfflineData)
  const userDetails = useSelector(getUserDetails)
  const language = useSelector(getLanguage)

  let name = ''
  if (userDetails?.name) {
    const nameObj = getIndividualNameObj(userDetails.name, language)
    if (nameObj) {
      const { firstNames, familyName } = nameObj
      name = joinValues([firstNames, familyName], ' ')
    }
  }

  const role =
    (userDetails?.role && intl.formatMessage(userDetails.role.label)) ?? ''

  const avatar = <Avatar avatar={userDetails?.avatar} name={name} />

  const runningVer = String(localStorage.getItem('running-version'))

  const logout = async () => {
    await storage.removeItem(SCREEN_LOCK)
    await removeToken()
    await removeUserDetails()
    window.location.assign(
      `${window.config.LOGIN_URL}?lang=${await storage.getItem('language')}&redirectTo=${window.location.origin}${ROUTES.V2.buildPath({})}`
    )
  }

  return (
    <LeftNavigation
      applicationName={offlineCountryConfig.config.APPLICATION_NAME}
      applicationVersion={runningVer}
      avatar={() => avatar}
      name={name}
      navigationWidth={navigationWidth}
      role={role}
    >
      <OrganisationNavigationGroup
        currentWorkqueueSlug={workqueueSlug}
        primaryOfficeId={userDetails?.primaryOffice.id}
      />
      <PerformanceNavigationGroup currentWorkqueueSlug={workqueueSlug} />
      <NavigationGroup>
        {hasOutbox && (
          <NavigationItem
            key={WORKQUEUE_OUTBOX.slug}
            count={outbox.length}
            data-testid={`navigation_workqueue_${WORKQUEUE_OUTBOX.slug}`}
            icon={() => <Icon name={WORKQUEUE_OUTBOX.icon} size="small" />}
            id={`navigation_workqueue_${WORKQUEUE_OUTBOX.slug}`}
            isSelected={WORKQUEUE_OUTBOX.slug === workqueueSlug}
            label={intl.formatMessage(WORKQUEUE_OUTBOX.name)}
            onClick={() => {
              navigate(
                ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
                  slug: WORKQUEUE_OUTBOX.slug
                })
              )
              menuCollapse && menuCollapse()
            }}
          />
        )}
        {hasDraft && (
          <NavigationItem
            key={WORKQUEUE_DRAFT.slug}
            count={drafts.length}
            data-testid={`navigation_workqueue_${WORKQUEUE_DRAFT.slug}`}
            icon={() => <Icon name={WORKQUEUE_DRAFT.icon} size="small" />}
            id={`navigation_workqueue_${WORKQUEUE_DRAFT.slug}`}
            isSelected={WORKQUEUE_DRAFT.slug === workqueueSlug}
            label={intl.formatMessage(WORKQUEUE_DRAFT.name)}
            onClick={() => {
              navigate(
                ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
                  slug: WORKQUEUE_DRAFT.slug
                })
              )
              menuCollapse && menuCollapse()
            }}
          />
        )}
        {/* Not all users have access to workqueues. */}
        {workqueues.length > 0 && (
          <Workqueues
            currentWorkqueueSlug={workqueueSlug}
            menuCollapse={menuCollapse}
            workqueues={workqueues}
          />
        )}
      </NavigationGroup>
      {isMobileView && (
        <NavigationGroup>
          <NavigationItem
            icon={() => <SettingsNavigation />}
            id={`navigation_${WORKQUEUE_TABS.settings}`}
            isSelected={false}
            label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.settings])}
            onClick={() => {
              navigate(routes.SETTINGS)
              menuCollapse && menuCollapse()
            }}
          />
          <NavigationItem
            icon={() => <LogoutNavigation />}
            id={`navigation_${WORKQUEUE_TABS.logout}`}
            label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.logout])}
            onClick={logout}
          />
        </NavigationGroup>
      )}
    </LeftNavigation>
  )
}
