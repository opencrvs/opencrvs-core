/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import * as React from 'react'
import { storage } from '@client/storage'
import {
  IDeclaration,
  SUBMISSION_STATUS,
  filterProcessingDeclarationsFromQuery
} from '@client/declarations'
import { IStoreState } from '@opencrvs/client/src/store'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import { LeftNavigation } from '@opencrvs/components/lib/SideNavigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { NavigationGroupHeader } from '@opencrvs/components/lib/SideNavigation/NavigationGroupHeader'
import { NavigationSubItem } from '@opencrvs/components/lib/SideNavigation/NavigationSubItem'
import { connect } from 'react-redux'
import {
  goToHomeTab,
  goToCertificateConfig,
  goToSettings,
  goToPerformanceView,
  goToTeamView,
  goToSystemList,
  goToFormConfigHome,
  goToApplicationConfig,
  goToAdvancedSearchResult,
  goToVSExport,
  goToPerformanceStatistics,
  goToLeaderBoardsView,
  goToDashboardView,
  goToUserRolesConfig,
  goToOrganisationView,
  goToInformantNotification
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { Event } from '@client/utils/gateway'
import { Activity, Users, PaperPlane } from '@opencrvs/components/lib/icons'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { isMobileDevice } from '@client/utils/commonUtils'
import { RouteComponentProps, withRouter } from 'react-router'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { UnpublishedWarning } from '@client/views/SysAdmin/Config/Forms/Home/FormConfigHome'
import {
  ALLOWED_STATUS_FOR_RETRY,
  INPROGRESS_STATUS
} from '@client/SubmissionController'
import styled from '@client/styledComponents'
import { updateRegistrarWorkqueue, IWorkqueue } from '@client/workqueue'
import { Icon } from '@opencrvs/components/lib/Icon'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { omit } from 'lodash'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { ADVANCED_SEARCH_RESULT } from '@client/navigation/routes'
import { Text } from '@opencrvs/components'
import { UserDetails } from '@client/utils/userUtils'

const SCREEN_LOCK = 'screenLock'

export interface IWORKQUEUE_TABS {
  [key: string]: string
}

export type IWORKQUEUE_TAB = string

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
  declarationForms: 'form',
  logout: 'logout',
  communications: 'communications',
  informantNotification: 'informantnotification',
  readyToIssue: 'readyToIssue',

  dashboard: 'dashboard',
  statistics: 'statistics',
  leaderboards: 'leaderboards',
  report: 'report',

  administrativeAreas: 'organisation',
  myOffice: 'team'
} as const

const GROUP_ID = {
  declarationGroup: 'declarationGroup',
  analytics: 'analytics',
  menuGroup: 'menuGroup',
  recordGroup: 'recordGroup',
  performanceGroup: 'performanceGroup',
  organizationGroup: 'organizationGroup',
  configGroup: 'configGroup'
}

type ChildNav = string

type Nav = ChildNav | ParentNav

interface ParentNav {
  [groupKey: string]: Nav[]
}

const NavTree: ParentNav = {
  [GROUP_ID.recordGroup]: [
    WORKQUEUE_TABS.outbox,
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.sentForReview,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.sentForApproval,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.readyToIssue
  ],
  [GROUP_ID.performanceGroup]: [
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.dashboard,
    WORKQUEUE_TABS.report,
    WORKQUEUE_TABS.vsexports
  ],
  [GROUP_ID.organizationGroup]: [
    WORKQUEUE_TABS.administrativeAreas,
    WORKQUEUE_TABS.myOffice
  ],
  [GROUP_ID.configGroup]: [
    WORKQUEUE_TABS.application,
    WORKQUEUE_TABS.declarationForms,
    WORKQUEUE_TABS.certificate,
    WORKQUEUE_TABS.userRoles
  ]
}

interface IUSER_SCOPE {
  [key: string]: string[]
}

const USER_SCOPE: IUSER_SCOPE = {
  FIELD_AGENT: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.sentForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.outbox,
    GROUP_ID.recordGroup
  ],
  REGISTRATION_AGENT: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.sentForApproval,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    WORKQUEUE_TABS.readyToIssue,
    GROUP_ID.recordGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organizationGroup
  ],
  DISTRICT_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    WORKQUEUE_TABS.readyToIssue,
    GROUP_ID.recordGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organizationGroup
  ],
  LOCAL_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    WORKQUEUE_TABS.readyToIssue,
    GROUP_ID.recordGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organizationGroup
  ],
  NATIONAL_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.vsexports,
    WORKQUEUE_TABS.dashboard,
    WORKQUEUE_TABS.report,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    WORKQUEUE_TABS.readyToIssue,
    GROUP_ID.recordGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organizationGroup
  ],
  LOCAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.performance,
    GROUP_ID.performanceGroup,
    GROUP_ID.organizationGroup
  ],
  NATIONAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.config,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.vsexports,
    WORKQUEUE_TABS.communications,
    WORKQUEUE_TABS.userRoles,
    WORKQUEUE_TABS.informantNotification,
    GROUP_ID.analytics,
    GROUP_ID.configGroup,
    GROUP_ID.organizationGroup,
    GROUP_ID.performanceGroup,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.dashboard,
    WORKQUEUE_TABS.report
  ],
  PERFORMANCE_MANAGEMENT: [
    WORKQUEUE_TABS.dashboard,
    WORKQUEUE_TABS.report,
    GROUP_ID.performanceGroup
  ]
}

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

interface ICountTranslated {
  [key: string]: number
}

interface INavIcons {
  [key: string]: React.ReactNode
}
interface IUserInfo {
  name: string
  role: string
  avatar: JSX.Element
}

interface INavClickHandler {
  [key: string]: () => void
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
  goToCertificateConfigAction: typeof goToCertificateConfig
  goToVSExportsAction: typeof goToVSExport
  goToFormConfigAction: typeof goToFormConfigHome
  goToUserRolesConfigAction: typeof goToUserRolesConfig
  goToApplicationConfigAction: typeof goToApplicationConfig
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
  goToInformantNotification: typeof goToInformantNotification
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

const NavIcons: INavIcons = {
  [WORKQUEUE_TABS.inProgress]: <DeclarationIconSmall color={'purple'} />,
  [WORKQUEUE_TABS.sentForReview]: <DeclarationIconSmall color={'orange'} />,
  [WORKQUEUE_TABS.readyForReview]: <DeclarationIconSmall color={'orange'} />,
  [WORKQUEUE_TABS.requiresUpdate]: <DeclarationIconSmall color={'red'} />,
  [WORKQUEUE_TABS.sentForApproval]: <DeclarationIconSmall color={'grey'} />,
  [WORKQUEUE_TABS.readyToPrint]: <DeclarationIconSmall color={'green'} />,
  [WORKQUEUE_TABS.readyToIssue]: <DeclarationIconSmall color={'teal'} />,
  [WORKQUEUE_TABS.outbox]: <Icon name="PaperPlaneTilt" size="medium" />,
  [WORKQUEUE_TABS.performance]: <Icon name="ChartLine" size="medium" />,
  [WORKQUEUE_TABS.vsexports]: <Icon name="Share" size="small" />,
  [WORKQUEUE_TABS.dashboard]: <Icon name="ChartLine" size="medium" />,
  [WORKQUEUE_TABS.report]: <Icon name="Activity" size="medium" />,
  [WORKQUEUE_TABS.administrativeAreas]: <Icon name="List" size="small" />,
  [WORKQUEUE_TABS.team]: <Icon name="Users" size="medium" />,
  [WORKQUEUE_TABS.application]: <Icon name="Compass" size="medium" />,
  [WORKQUEUE_TABS.certificate]: <Icon name="Medal" size="medium" />,
  [WORKQUEUE_TABS.declarationForms]: <Icon name="Database" size="medium" />,
  [WORKQUEUE_TABS.userRoles]: <SettingsNavigation />
}

const RecordGroup = (props: IFullProps) => {
  const {
    intl,
    match,
    userDetails,
    deselectAllTabs,
    enableMenuSelection = true,
    loadWorkqueueStatuses = true,
    activeMenuItem,
    workqueue,
    storedDeclarations,
    draftDeclarations,
    menuCollapse,
    updateRegistrarWorkqueue
  } = props

  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : match.url.split('/')[1]

  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const [isNavGroupActive, setIsNavGroupActive] = React.useState(false)

  const { data, initialSyncDone } = workqueue
  const filteredData = filterProcessingDeclarationsFromQuery(
    data,
    storedDeclarations
  )

  React.useEffect(() => {
    if (!userDetails || !loadWorkqueueStatuses) {
      return
    }
    updateRegistrarWorkqueue(
      userDetails.practitionerId,
      10, // Page size shouldn't matter here as we're only interested in totals
      userDetails.systemRole === 'FIELD_AGENT'
    )
  }, [userDetails, updateRegistrarWorkqueue, loadWorkqueueStatuses])

  const declarationCount = {
    inProgress: !initialSyncDone
      ? 0
      : draftDeclarations.filter(
          (draft) =>
            draft.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        ).length +
        (filteredData.inProgressTab?.totalItems || 0) +
        (filteredData.notificationTab?.totalItems || 0),
    readyForReview: !initialSyncDone
      ? 0
      : filteredData.reviewTab?.totalItems || 0,
    requiresUpdate: !initialSyncDone
      ? 0
      : filteredData.rejectTab?.totalItems || 0,
    sentForApproval: !initialSyncDone
      ? 0
      : filteredData.approvalTab?.totalItems || 0,
    externalValidation:
      window.config.EXTERNAL_VALIDATION_WORKQUEUE && !initialSyncDone
        ? 0
        : filteredData.externalValidationTab?.totalItems || 0,
    readyToPrint: !initialSyncDone ? 0 : filteredData.printTab?.totalItems || 0,
    readyToIssue: !initialSyncDone ? 0 : filteredData.issueTab?.totalItems || 0,
    outbox: storedDeclarations.filter((draft) =>
      (
        [
          ...ALLOWED_STATUS_FOR_RETRY,
          ...INPROGRESS_STATUS
        ] as SUBMISSION_STATUS[]
      ).includes(draft.submissionStatus as SUBMISSION_STATUS)
    ).length
  }

  const countTranslated: ICountTranslated = {
    progress: declarationCount.inProgress,
    readyForReview: declarationCount.readyForReview,
    requiresUpdate: declarationCount.requiresUpdate,
    approvals: declarationCount.sentForApproval,
    waitingValidation: declarationCount.externalValidation,
    print: declarationCount.readyToPrint,
    readyToIssue: declarationCount.readyToIssue
  }

  if (NavTree[GROUP_ID.recordGroup].includes(tabId) && !isNavGroupActive)
    setIsNavGroupActive(true)

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        id={`navigation_${GROUP_ID.recordGroup}_main`}
        label={intl.formatMessage(navigationMessages[GROUP_ID.recordGroup])}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={enableMenuSelection && isNavGroupActive}
        icon={() => (
          <Expandable selected={isNavGroupExpanded || isNavGroupActive} />
        )}
      />

      {(isNavGroupExpanded || isNavGroupActive) &&
        NavTree[GROUP_ID.recordGroup].map((item) => {
          return userDetails &&
            typeof item == 'string' &&
            USER_SCOPE[userDetails.systemRole].includes(item) ? (
            <NavigationItem
              key={item}
              icon={() => NavIcons[item]}
              id={`navigation_${item}`}
              label={intl.formatMessage(navigationMessages[item])}
              count={countTranslated[item]}
              isSelected={tabId === item}
              onClick={() => {
                props.goToHomeTab(item)
                menuCollapse && menuCollapse()
              }}
            />
          ) : null
        })}
    </NavigationGroup>
  )
}

const PerformanceGroup = (props: IFullProps) => {
  const {
    intl,
    match,
    userDetails,
    deselectAllTabs,
    enableMenuSelection = true,
    activeMenuItem,
    goToVSExportsAction,
    goToDashboardView
  } = props

  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : match.url.split('/')[1]

  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const [isNavGroupActive, setIsNavGroupActive] = React.useState(false)

  const performanceNavClickHandler: INavClickHandler = {
    [WORKQUEUE_TABS.performance]: () =>
      userDetails && props.goToPerformanceViewAction(userDetails),
    [WORKQUEUE_TABS.dashboard]: goToDashboardView,
    [WORKQUEUE_TABS.report]: () =>
      userDetails && props.goToPerformanceViewAction(userDetails),
    [WORKQUEUE_TABS.vsexports]: goToVSExportsAction
  }

  if (NavTree[GROUP_ID.performanceGroup].includes(tabId) && !isNavGroupActive)
    setIsNavGroupActive(true)

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        key="Header"
        id={`navigation_${GROUP_ID.performanceGroup}_main`}
        label={intl.formatMessage(
          navigationMessages[GROUP_ID.performanceGroup]
        )}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={enableMenuSelection && isNavGroupActive}
        icon={() => (
          <Expandable selected={isNavGroupExpanded || isNavGroupActive} />
        )}
      />

      {(isNavGroupExpanded || isNavGroupActive) &&
        NavTree[GROUP_ID.performanceGroup].map((item) => {
          return userDetails &&
            typeof item == 'string' &&
            USER_SCOPE[userDetails.systemRole].includes(item) ? (
            <NavigationItem
              key={item}
              icon={() => NavIcons[item]}
              id={`navigation_${item}`}
              label={intl.formatMessage(navigationMessages[item])}
              isSelected={tabId === item}
              onClick={performanceNavClickHandler[item]}
            />
          ) : null
        })}
    </NavigationGroup>
  )
}

const ConfigGroup = (props: IFullProps) => {
  const {
    intl,
    match,
    deselectAllTabs,
    enableMenuSelection = true,
    activeMenuItem,
    goToCertificateConfigAction,
    goToUserRolesConfigAction,
    goToFormConfigAction,
    goToApplicationConfigAction
  } = props

  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : match.url.split('/')[1]

  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const [isNavGroupActive, setIsNavGroupActive] = React.useState(false)

  const configNavClickHandler: INavClickHandler = {
    [WORKQUEUE_TABS.application]: goToApplicationConfigAction,
    [WORKQUEUE_TABS.declarationForms]: goToFormConfigAction,
    [WORKQUEUE_TABS.certificate]: goToCertificateConfigAction,
    [WORKQUEUE_TABS.userRoles]: goToUserRolesConfigAction
  }

  if (NavTree[GROUP_ID.configGroup].includes(tabId) && !isNavGroupActive)
    setIsNavGroupActive(true)

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        id={`navigation_${GROUP_ID.configGroup}_main`}
        label={intl.formatMessage(navigationMessages[GROUP_ID.configGroup])}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={enableMenuSelection && isNavGroupActive}
        icon={() => (
          <Expandable selected={isNavGroupExpanded || isNavGroupActive} />
        )}
      />

      {(isNavGroupExpanded || isNavGroupActive) &&
        NavTree[GROUP_ID.configGroup].map((item) => {
          return typeof item == 'string' ? (
            <NavigationItem
              key={item}
              icon={() => NavIcons[item]}
              id={`navigation_${item}`}
              label={intl.formatMessage(navigationMessages[item])}
              isSelected={tabId === item}
              onClick={configNavClickHandler[item]}
            />
          ) : null
        })}
    </NavigationGroup>
  )
}

const OrganizationGroup = (props: IFullProps) => {
  const {
    intl,
    match,
    userDetails,
    deselectAllTabs,
    enableMenuSelection = true,
    activeMenuItem,
    goToOrganisationViewAction,
    goToTeamViewAction
  } = props

  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : match.url.split('/')[1]

  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const [isNavGroupActive, setIsNavGroupActive] = React.useState(false)

  const configNavClickHandler: INavClickHandler = {
    [WORKQUEUE_TABS.administrativeAreas]: () =>
      userDetails && goToOrganisationViewAction(userDetails),
    [WORKQUEUE_TABS.team]: () => userDetails && goToTeamViewAction(userDetails)
  }

  if (NavTree[GROUP_ID.organizationGroup].includes(tabId) && !isNavGroupActive)
    setIsNavGroupActive(true)

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        id={`navigation_${GROUP_ID.organizationGroup}_main`}
        label={intl.formatMessage(
          navigationMessages[GROUP_ID.organizationGroup]
        )}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={enableMenuSelection && isNavGroupActive}
        icon={() => (
          <Expandable selected={isNavGroupExpanded || isNavGroupActive} />
        )}
      />

      {(isNavGroupExpanded || isNavGroupActive) &&
        NavTree[GROUP_ID.organizationGroup].map((item) => {
          return typeof item == 'string' ? (
            <NavigationItem
              key={item}
              icon={() => NavIcons[item]}
              id={`navigation_${item}`}
              label={intl.formatMessage(navigationMessages[item])}
              isSelected={tabId === item}
              onClick={configNavClickHandler[item]}
            />
          ) : null
        })}
    </NavigationGroup>
  )
}

export const NavigationView = (props: IFullProps) => {
  const {
    advancedSearchParams,
    goToAdvancedSearchResultAction,
    userDetails,
    loadWorkqueueStatuses = true,
    navigationWidth,
    menuCollapse,
    userInfo,
    offlineCountryConfiguration,
    updateRegistrarWorkqueue,
    className
  } = props

  console.log(userDetails?.systemRole)

  const runningVer = String(localStorage.getItem('running-version'))

  React.useEffect(() => {
    if (!userDetails || !loadWorkqueueStatuses) {
      return
    }
    updateRegistrarWorkqueue(
      userDetails.practitionerId,
      10, // Page size shouldn't matter here as we're only interested in totals
      userDetails.systemRole === 'FIELD_AGENT'
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
      warning={isMobileDevice() ? <></> : <UnpublishedWarning compact={true} />}
      className={className}
    >
      {userDetails?.systemRole &&
        USER_SCOPE[userDetails.systemRole].includes(GROUP_ID.recordGroup) && (
          <RecordGroup {...props} />
        )}

      {userDetails?.systemRole &&
        USER_SCOPE[userDetails.systemRole].includes(
          GROUP_ID.performanceGroup
        ) && <PerformanceGroup {...props} />}

      {userDetails?.systemRole &&
        USER_SCOPE[userDetails.systemRole].includes(GROUP_ID.configGroup) && (
          <ConfigGroup {...props} />
        )}

      {userDetails?.systemRole &&
        USER_SCOPE[userDetails.systemRole].includes(
          GROUP_ID.organizationGroup
        ) && <OrganizationGroup {...props} />}

      <NavigationGroup>
        {userDetails?.searches && userDetails.searches.length > 0 ? (
          userDetails.searches.map((bookmarkResult) => {
            return (
              <NavigationItem
                key={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
                icon={() => (
                  <Icon
                    name={'Star'}
                    color={
                      advancedSearchParams.searchId ===
                        bookmarkResult.searchId &&
                      props.location.pathname === ADVANCED_SEARCH_RESULT
                        ? 'grey600'
                        : 'yellow'
                    }
                    weight={'fill'}
                  ></Icon>
                )}
                id={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
                label={bookmarkResult.name}
                disabled={
                  advancedSearchParams.searchId === bookmarkResult.searchId &&
                  props.location.pathname === ADVANCED_SEARCH_RESULT
                }
                onClick={() => {
                  const filteredParam = omit(
                    bookmarkResult.parameters,
                    '__typename'
                  ) as IAdvancedSearchParamState
                  setAdvancedSearchParam({
                    ...filteredParam,
                    searchId: bookmarkResult?.searchId
                  })
                  goToAdvancedSearchResultAction()
                }}
                isSelected={
                  advancedSearchParams.searchId === bookmarkResult.searchId &&
                  props.location.pathname === ADVANCED_SEARCH_RESULT
                }
              />
            )
          })
        ) : (
          <></>
        )}
      </NavigationGroup>
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
    activeMenuItem: window.location.href.endsWith(WORKQUEUE_TABS.performance)
      ? WORKQUEUE_TABS.performance
      : window.location.href.endsWith(WORKQUEUE_TABS.team)
      ? WORKQUEUE_TABS.team
      : window.location.href.endsWith(WORKQUEUE_TABS.vsexports)
      ? WORKQUEUE_TABS.vsexports
      : window.location.href.endsWith(WORKQUEUE_TABS.application)
      ? WORKQUEUE_TABS.application
      : window.location.href.endsWith(WORKQUEUE_TABS.settings)
      ? WORKQUEUE_TABS.settings
      : window.location.href.endsWith(WORKQUEUE_TABS.certificate)
      ? WORKQUEUE_TABS.certificate
      : window.location.href.endsWith(WORKQUEUE_TABS.declarationForms)
      ? WORKQUEUE_TABS.declarationForms
      : window.location.href.endsWith(WORKQUEUE_TABS.systems)
      ? WORKQUEUE_TABS.systems
      : window.location.href.endsWith(WORKQUEUE_TABS.informantNotification)
      ? WORKQUEUE_TABS.informantNotification
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
  goToCertificateConfigAction: goToCertificateConfig,
  goToFormConfigAction: goToFormConfigHome,
  goToUserRolesConfigAction: goToUserRolesConfig,
  goToApplicationConfigAction: goToApplicationConfig,
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
  goToInformantNotification
})(injectIntl(withRouter(NavigationView)))

/** @deprecated since the introduction of `<Frame>` */
export const FixedNavigation = styled(Navigation)`
  position: fixed;
`
