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
import {
  Icon,
  NavigationGroup,
  NavigationItem,
  NavigationSubItem
} from '@opencrvs/components'
import React, { useState } from 'react'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { UserDetails } from '@client/utils/userUtils'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import {
  goToAllUserEmail,
  goToOrganisationView,
  goToPerformanceView,
  goToSystemList,
  goToTeamView
} from '@client/navigation'

interface IOrganisationProps {
  userDetails: UserDetails | null
  enableMenuSelection: boolean
  activeMenuItem: string
}

const Organisation = ({
  userDetails,
  enableMenuSelection,
  activeMenuItem
}: IOrganisationProps) => {
  const [isConfigExpanded, setIsConfigExpanded] = useState(false)
  const [isCommunationExpanded, setIsCommunationExpanded] = useState(false)
  const { hasScope, hasAnyScope } = usePermissions()

  const dispatch = useDispatch()
  const intl = useIntl()

  const hasAnyOrganisation = hasAnyScope([
    'organisation.read',
    'organisation.read-locations',
    'organisation.read-locations:my-office'
  ])

  const hasOrganisation = hasScope('organisation.read')
  const hasOrganisationTeam = hasAnyScope([
    'organisation.read-locations',
    'organisation.read-locations:my-office'
  ])
  const hasPerformance = hasScope('performance.read')

  const hasSystemsConfig = hasAnyScope(['sysadmin', 'natlsysadmin'])
  const hasEmailAllUsers = hasAnyScope(['sysadmin', 'natlsysadmin'])

  const configTab: string[] = [
    WORKQUEUE_TABS.application,
    WORKQUEUE_TABS.certificate,
    WORKQUEUE_TABS.systems,
    WORKQUEUE_TABS.userRoles
  ]
  const conmmunicationTab: string[] = [
    WORKQUEUE_TABS.informantNotification,
    WORKQUEUE_TABS.emailAllUsers
  ]
  return (
    <>
      {hasAnyOrganisation && (
        <NavigationGroup>
          {hasPerformance && userDetails && (
            <NavigationItem
              icon={() => <Icon name="Activity" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.performance}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.performance]
              )}
              onClick={() => {
                dispatch(goToPerformanceView())
              }}
              isSelected={
                enableMenuSelection &&
                activeMenuItem === WORKQUEUE_TABS.performance
              }
            />
          )}
          {hasOrganisation && userDetails && (
            <NavigationItem
              icon={() => <Icon name="Buildings" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.organisation}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.organisation]
              )}
              onClick={() => dispatch(goToOrganisationView(userDetails))}
              isSelected={
                enableMenuSelection &&
                activeMenuItem === WORKQUEUE_TABS.organisation
              }
            />
          )}
          {hasOrganisationTeam && userDetails && (
            <NavigationItem
              icon={() => <Icon name="Users" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.team}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.team]
              )}
              onClick={() => dispatch(goToTeamView(userDetails))}
              isSelected={
                enableMenuSelection && activeMenuItem === WORKQUEUE_TABS.team
              }
            />
          )}

          {hasSystemsConfig && (
            <>
              <NavigationItem
                icon={() => <Icon name="Compass" size="medium" />}
                id={`navigation_${WORKQUEUE_TABS.config}_main`}
                label={intl.formatMessage(
                  navigationMessages[WORKQUEUE_TABS.config]
                )}
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                isSelected={
                  enableMenuSelection && configTab.includes(activeMenuItem)
                }
                expandableIcon={() =>
                  isConfigExpanded || configTab.includes(activeMenuItem) ? (
                    <Expandable selected={true} />
                  ) : (
                    <Expandable />
                  )
                }
              />
              {(isConfigExpanded || configTab.includes(activeMenuItem)) && (
                <NavigationSubItem
                  id={`navigation_${WORKQUEUE_TABS.systems}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.systems]
                  )}
                  onClick={() => {
                    dispatch(goToSystemList)
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.systems
                  }
                />
              )}
            </>
          )}

          {hasEmailAllUsers && (
            <>
              <NavigationItem
                icon={() => <Icon name="ChatCircle" size="medium" />}
                id={`navigation_${WORKQUEUE_TABS.communications}_main`}
                label={intl.formatMessage(
                  navigationMessages[WORKQUEUE_TABS.communications]
                )}
                onClick={() => setIsCommunationExpanded(!isCommunationExpanded)}
                isSelected={
                  enableMenuSelection &&
                  conmmunicationTab.includes(activeMenuItem)
                }
                expandableIcon={() =>
                  isCommunationExpanded ||
                  conmmunicationTab.includes(activeMenuItem) ? (
                    <Expandable selected={true} />
                  ) : (
                    <Expandable />
                  )
                }
              />
              {(isCommunationExpanded ||
                conmmunicationTab.includes(activeMenuItem)) && (
                <NavigationSubItem
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.emailAllUsers]
                  )}
                  id={`navigation_${WORKQUEUE_TABS.emailAllUsers}`}
                  onClick={() => {
                    goToAllUserEmail()
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.emailAllUsers
                  }
                />
              )}
            </>
          )}
        </NavigationGroup>
      )}
    </>
  )
}

export default Organisation
