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

import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import { buttonMessages } from '@client/i18n/messages'
import {
  goToAdvancedSearchResult,
  goToAllUserEmail,
  goToDashboardView,
  goToHomeTab,
  goToLeaderBoardsView,
  goToOrganisationView,
  goToPerformanceStatistics,
  goToPerformanceView,
  goToSettings,
  goToSystemList,
  goToTeamView,
  goToVSExport
} from '@client/navigation'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { storage } from '@client/storage'
import styled from 'styled-components'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { Event } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { IWorkqueue, updateRegistrarWorkqueue } from '@client/workqueue'
import { IStoreState } from '@opencrvs/client/src/store'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LeftNavigation } from '@opencrvs/components/lib/SideNavigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { default as WorkQueueGroup } from './NavigationGroups/Workqueue'
import { default as OrganisationGroup } from './NavigationGroups/Organisation'
import { default as PerformanceGroup } from './NavigationGroups/Performance'
import { default as SavedSearchGroup } from './NavigationGroups/SavedSearch'

const SCREEN_LOCK = 'screenLock'

type Keys = keyof typeof WORKQUEUE_TABS
export type IWORKQUEUE_TABS = (typeof WORKQUEUE_TABS)[Keys]

export const WORKQUEUE_TABS = {
  inProgress: 'progress',
  inProgressFieldAgent: 'progress/field-agents',
  sentForReview: 'sentForReview',
  readyForReview: 'readyForReview',
  requiresUpdate: 'requiresUpdate',
  sentForApproval: 'approvals',
  readyToPrint: 'print',
  outbox: 'outbox',
  externalValidation: 'waitingValidation',
  performance: 'performance',
  vsexports: 'vsexports',
  team: 'team',
  config: 'config',
  organisation: 'organisation',
  application: 'application',
  certificate: 'certificate',
  systems: 'integration',
  userRoles: 'userroles',
  settings: 'settings',
  logout: 'logout',
  communications: 'communications',
  informantNotification: 'informantnotification',
  emailAllUsers: 'emailAllUsers',
  readyToIssue: 'readyToIssue'
} as const

interface ICount {
  inProgress?: number
  readyForReview?: number
  sentForReview?: number
  requiresUpdate?: number
  sentForUpdates?: number
  sentForApproval?: number
  externalValidation?: number
  readyToPrint?: number
  readyToIssue?: number
}

interface IUserInfo {
  name: string
  role: string
  avatar: JSX.Element
}

interface IProps {
  count?: ICount
  enableMenuSelection?: boolean
  navigationWidth?: number
  menuCollapse?: () => void
  userInfo?: IUserInfo
  deselectAllTabs?: boolean
  loadWorkqueueStatuses?: boolean
}

interface IDispatchProps {
  goToHomeTab: typeof goToHomeTab
  goToVSExportsAction: typeof goToVSExport
  goToAdvancedSearchResultAction: typeof goToAdvancedSearchResult
  redirectToAuthentication: typeof redirectToAuthentication
  goToPerformanceViewAction: typeof goToPerformanceView
  goToTeamViewAction: typeof goToTeamView
  goToOrganisationViewAction: typeof goToOrganisationView
  goToSystemViewAction: typeof goToSystemList
  goToSettings: typeof goToSettings
  goToLeaderBoardsView: typeof goToLeaderBoardsView
  goToDashboardView: typeof goToDashboardView
  goToPerformanceStatistics: typeof goToPerformanceStatistics
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
  setAdvancedSearchParam: typeof setAdvancedSearchParam
  goToAllUserEmail: typeof goToAllUserEmail
}

interface IStateProps {
  draftDeclarations: IDeclaration[]
  declarationsReadyToSend: IDeclaration[]
  userDetails: UserDetails | null
  advancedSearchParams: IAdvancedSearchParamState
  activeMenuItem: string
  workqueue: IWorkqueue
  offlineCountryConfiguration: IOfflineData
  storedDeclarations: IDeclaration[]
}

type IFullProps = IProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps &
  RouteComponentProps<{ tabId: string }> & { className?: string }

const getSettingsAndLogout = (props: IFullProps) => {
  const {
    intl,
    menuCollapse,
    activeMenuItem,
    redirectToAuthentication,
    goToSettings
  } = props
  return (
    <>
      <NavigationItem
        icon={() => <SettingsNavigation />}
        id={`navigation_${WORKQUEUE_TABS.settings}`}
        label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.settings])}
        onClick={() => {
          goToSettings()
          menuCollapse && menuCollapse()
        }}
        isSelected={activeMenuItem === WORKQUEUE_TABS.settings}
      />
      <NavigationItem
        icon={() => <LogoutNavigation />}
        id={`navigation_${WORKQUEUE_TABS.logout}`}
        label={intl.formatMessage(buttonMessages[WORKQUEUE_TABS.logout])}
        onClick={() => {
          storage.removeItem(SCREEN_LOCK)
          redirectToAuthentication()
        }}
      />
    </>
  )
}

const NavigationView = (props: IFullProps) => {
  const {
    intl,
    match,
    userDetails,
    advancedSearchParams,
    deselectAllTabs,
    enableMenuSelection = true,
    loadWorkqueueStatuses = true,
    activeMenuItem,
    navigationWidth,
    workqueue,
    storedDeclarations,
    draftDeclarations,
    menuCollapse,
    userInfo,
    offlineCountryConfiguration,
    updateRegistrarWorkqueue,
    className
  } = props
  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : 'review'
  const runningVer = String(localStorage.getItem('running-version'))

  const isOnePrintInAdvanceOn = Object.values(Event).some((event: Event) => {
    const upperCaseEvent = event.toUpperCase() as Uppercase<Event>
    return offlineCountryConfiguration.config[upperCaseEvent].PRINT_IN_ADVANCE
  })

  React.useEffect(() => {
    if (!userDetails || !loadWorkqueueStatuses) {
      return
    }
    updateRegistrarWorkqueue(
      userDetails.practitionerId,
      10 // Page size shouldn't matter here as we're only interested in totals
    )
  }, [userDetails, updateRegistrarWorkqueue, loadWorkqueueStatuses])

  return (
    <LeftNavigation
      applicationName={offlineCountryConfiguration.config.APPLICATION_NAME}
      applicationVersion={runningVer}
      buildVersion={import.meta.env.VITE_APP_VERSION ?? 'Development'}
      navigationWidth={navigationWidth}
      name={userInfo && userInfo.name}
      role={userInfo && userInfo.role}
      avatar={() => userInfo && userInfo.avatar}
      className={className}
    >
      <WorkQueueGroup
        workqueue={workqueue}
        storedDeclarations={storedDeclarations}
        draftDeclarations={draftDeclarations}
        intl={intl}
        tabId={tabId}
        isOnePrintInAdvanceOn={isOnePrintInAdvanceOn}
        goToHomeTab={props.goToHomeTab}
      />

      <OrganisationGroup
        intl={intl}
        enableMenuSelection={enableMenuSelection}
        activeMenuItem={activeMenuItem}
        goToAllUserEmail={props.goToAllUserEmail}
        goToOrganisationView={props.goToOrganisationViewAction}
        goToPerformanceView={props.goToPerformanceViewAction}
        goToSystemList={props.goToSystemViewAction}
        goToTeamView={props.goToTeamViewAction}
      />
      <PerformanceGroup
        intl={intl}
        activeMenuItem={activeMenuItem}
        enableMenuSelection={enableMenuSelection}
        goToDashboardView={props.goToDashboardView}
        goToLeaderBoardsView={props.goToLeaderBoardsView}
        goToPerformanceStatistics={props.goToPerformanceStatistics}
        goToPerformanceView={props.goToPerformanceViewAction}
        goToVSExport={props.goToVSExportsAction}
      />

      <SavedSearchGroup
        userDetails={userDetails}
        advancedSearchParams={advancedSearchParams}
        pathname={props.location.pathname}
        goToAdvancedSearchResult={props.goToAdvancedSearchResultAction}
      />
      <NavigationGroup>
        {menuCollapse && getSettingsAndLogout(props)}
      </NavigationGroup>
    </LeftNavigation>
  )
}

const mapStateToProps: (state: IStoreState) => IStateProps = (state) => {
  return {
    offlineCountryConfiguration: getOfflineData(state),
    draftDeclarations:
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      [],
    declarationsReadyToSend: (
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            isDeclarationInReadyToReviewStatus(declaration.submissionStatus)
        )) ||
      []
    ).reverse(),
    workqueue: state.workqueueState.workqueue,
    storedDeclarations: state.declarationsState.declarations,
    userDetails: getUserDetails(state),
    advancedSearchParams: getAdvancedSearchParamsState(state),
    activeMenuItem: window.location.href.includes(WORKQUEUE_TABS.performance)
      ? WORKQUEUE_TABS.performance
      : window.location.href.endsWith(WORKQUEUE_TABS.vsexports)
      ? WORKQUEUE_TABS.vsexports
      : window.location.href.includes(WORKQUEUE_TABS.organisation)
      ? WORKQUEUE_TABS.organisation
      : window.location.href.includes(WORKQUEUE_TABS.team)
      ? WORKQUEUE_TABS.team
      : window.location.href.endsWith(WORKQUEUE_TABS.application)
      ? WORKQUEUE_TABS.application
      : window.location.href.endsWith(WORKQUEUE_TABS.settings)
      ? WORKQUEUE_TABS.settings
      : window.location.href.endsWith(WORKQUEUE_TABS.certificate)
      ? WORKQUEUE_TABS.certificate
      : window.location.href.endsWith(WORKQUEUE_TABS.systems)
      ? WORKQUEUE_TABS.systems
      : window.location.href.endsWith(WORKQUEUE_TABS.informantNotification)
      ? WORKQUEUE_TABS.informantNotification
      : window.location.href.endsWith(WORKQUEUE_TABS.emailAllUsers)
      ? WORKQUEUE_TABS.emailAllUsers
      : window.location.href.endsWith(WORKQUEUE_TABS.userRoles)
      ? WORKQUEUE_TABS.userRoles
      : ''
  }
}

export const Navigation = connect<
  IStateProps,
  IDispatchProps,
  IProps,
  IStoreState
>(mapStateToProps, {
  goToHomeTab,
  goToAdvancedSearchResultAction: goToAdvancedSearchResult,
  goToVSExportsAction: goToVSExport,
  goToPerformanceViewAction: goToPerformanceView,
  goToOrganisationViewAction: goToOrganisationView,
  goToTeamViewAction: goToTeamView,
  goToSystemViewAction: goToSystemList,
  redirectToAuthentication,
  goToSettings,
  updateRegistrarWorkqueue,
  setAdvancedSearchParam,
  goToPerformanceStatistics,
  goToLeaderBoardsView,
  goToDashboardView,
  goToAllUserEmail
})(injectIntl(withRouter(NavigationView)))

/** @deprecated since the introduction of `<Frame>` */
export const FixedNavigation = styled(Navigation)`
  position: fixed;
`
