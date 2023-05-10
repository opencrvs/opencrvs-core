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

import {
  filterProcessingDeclarationsFromQuery,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { NavigationGroupHeader } from '@opencrvs/components/lib/SideNavigation/NavigationGroupHeader'
import { connect } from 'react-redux'
import {
  goToAdvancedSearchResult,
  goToApplicationConfig,
  goToCertificateConfig,
  goToDashboardView,
  goToFormConfigHome,
  goToHomeTab,
  goToInformantNotification,
  goToLeaderBoardsView,
  goToOrganisationView,
  goToPerformanceStatistics,
  goToPerformanceView,
  goToSettings,
  goToSystemList,
  goToTeamView,
  goToUserRolesConfig,
  goToVSExport
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { RouteComponentProps, withRouter } from 'react-router'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import {
  ALLOWED_STATUS_FOR_RETRY,
  INPROGRESS_STATUS
} from '@client/SubmissionController'
import { isMobileDevice } from '@client/utils/commonUtils'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { UnpublishedWarning } from '@client/views/SysAdmin/Config/Forms/Home/FormConfigHome'
import { IWorkqueue, updateRegistrarWorkqueue } from '@client/workqueue'
import { IStoreState } from '@opencrvs/client/src/store'
import { Icon } from '@opencrvs/components/lib/Icon'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LeftNavigation } from '@opencrvs/components/lib/SideNavigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { omit } from 'lodash'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { ADVANCED_SEARCH_RESULT } from '@client/navigation/routes'
import { UserDetails } from '@client/utils/userUtils'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { storage } from '@client/storage'
import styled from '@client/styledComponents'
import React from 'react'

const SCREEN_LOCK = 'screenLock'

export type IWORKQUEUE_TAB = string
export interface IWORKQUEUE_TABS {
  [key: string]: IWORKQUEUE_TAB
}

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

type IGROUP_ID = string
interface IGROUPS {
  [key: string]: IGROUP_ID
}

const GROUP_ID: IGROUPS = {
  recordGroup: 'recordGroup',
  performanceGroup: 'performanceGroup',
  organizationGroup: 'organizationGroup',
  configGroup: 'configGroup'
}

interface IUSER_SCOPE {
  [key: string]: {
    [key: IGROUP_ID]: IWORKQUEUE_TAB[]
  }
}

const USER_SCOPE: IUSER_SCOPE = {
  FIELD_AGENT: {
    [GROUP_ID.recordGroup]: [
      WORKQUEUE_TABS.inProgress,
      WORKQUEUE_TABS.sentForReview,
      WORKQUEUE_TABS.requiresUpdate,
      WORKQUEUE_TABS.outbox
    ]
  },
  REGISTRATION_AGENT: {
    [GROUP_ID.recordGroup]: [
      WORKQUEUE_TABS.inProgress,
      WORKQUEUE_TABS.readyForReview,
      WORKQUEUE_TABS.requiresUpdate,
      WORKQUEUE_TABS.sentForApproval,
      WORKQUEUE_TABS.readyToPrint,
      WORKQUEUE_TABS.readyToIssue,
      WORKQUEUE_TABS.outbox
    ],
    [GROUP_ID.performanceGroup]: [WORKQUEUE_TABS.performance],
    [GROUP_ID.organizationGroup]: [
      WORKQUEUE_TABS.organisation,
      WORKQUEUE_TABS.team
    ]
  },
  DISTRICT_REGISTRAR: {
    [GROUP_ID.recordGroup]: [
      WORKQUEUE_TABS.inProgress,
      WORKQUEUE_TABS.readyForReview,
      WORKQUEUE_TABS.requiresUpdate,
      WORKQUEUE_TABS.readyToPrint,
      WORKQUEUE_TABS.readyToIssue,
      WORKQUEUE_TABS.outbox
    ],
    [GROUP_ID.performanceGroup]: [WORKQUEUE_TABS.performance],
    [GROUP_ID.organizationGroup]: [
      WORKQUEUE_TABS.organisation,
      WORKQUEUE_TABS.team
    ]
  },
  LOCAL_REGISTRAR: {
    [GROUP_ID.recordGroup]: [
      WORKQUEUE_TABS.inProgress,
      WORKQUEUE_TABS.readyForReview,
      WORKQUEUE_TABS.requiresUpdate,
      WORKQUEUE_TABS.readyToPrint,
      WORKQUEUE_TABS.outbox,
      WORKQUEUE_TABS.readyToIssue
    ],
    [GROUP_ID.performanceGroup]: [WORKQUEUE_TABS.performance],
    [GROUP_ID.organizationGroup]: [
      WORKQUEUE_TABS.organisation,
      WORKQUEUE_TABS.team
    ]
  },
  NATIONAL_REGISTRAR: {
    [GROUP_ID.recordGroup]: [
      WORKQUEUE_TABS.inProgress,
      WORKQUEUE_TABS.readyForReview,
      WORKQUEUE_TABS.requiresUpdate,
      WORKQUEUE_TABS.readyToPrint,
      WORKQUEUE_TABS.outbox,
      WORKQUEUE_TABS.readyToIssue
    ],
    [GROUP_ID.performanceGroup]: [
      WORKQUEUE_TABS.vsexports,
      WORKQUEUE_TABS.dashboard,
      WORKQUEUE_TABS.report,
      WORKQUEUE_TABS.team
    ],
    [GROUP_ID.organizationGroup]: [WORKQUEUE_TABS.organisation]
  },
  LOCAL_SYSTEM_ADMIN: {
    [GROUP_ID.organizationGroup]: [
      WORKQUEUE_TABS.organisation,
      WORKQUEUE_TABS.team
    ],
    [GROUP_ID.performanceGroup]: [WORKQUEUE_TABS.performance]
  },
  NATIONAL_SYSTEM_ADMIN: {
    [GROUP_ID.performanceGroup]: [
      WORKQUEUE_TABS.performance,
      WORKQUEUE_TABS.dashboard,
      WORKQUEUE_TABS.report,
      WORKQUEUE_TABS.vsexports
    ],
    [GROUP_ID.configGroup]: [
      WORKQUEUE_TABS.application,
      WORKQUEUE_TABS.declarationForms,
      WORKQUEUE_TABS.certificate,
      WORKQUEUE_TABS.userRoles
    ],
    [GROUP_ID.organizationGroup]: [
      WORKQUEUE_TABS.organisation,
      WORKQUEUE_TABS.team
    ]
  },
  PERFORMANCE_MANAGEMENT: {
    [GROUP_ID.performanceGroup]: [
      WORKQUEUE_TABS.dashboard,
      WORKQUEUE_TABS.performance,
      WORKQUEUE_TABS.statistics,
      WORKQUEUE_TABS.leaderboards
    ]
  }
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

interface IRecordGroupProps {
  intl: IntlShape
  role: string
  activeMenuItem: string
  workqueue: IWorkqueue
  storedDeclarations: IDeclaration[]
  draftDeclarations: IDeclaration[]
  menuCollapse?: () => void
  goToHomeTab: typeof goToHomeTab
}

const RecordGroup = ({
  intl,
  role,
  activeMenuItem,
  workqueue,
  storedDeclarations,
  draftDeclarations,
  menuCollapse,
  goToHomeTab
}: IRecordGroupProps) => {
  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const isNavGroupActive =
    USER_SCOPE[role][GROUP_ID.recordGroup].includes(activeMenuItem)

  const { data, initialSyncDone } = workqueue
  const filteredData = filterProcessingDeclarationsFromQuery(
    data,
    storedDeclarations
  )

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

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        isExpanded={isNavGroupExpanded}
        id={`navigation_${GROUP_ID.recordGroup}_main`}
        label={intl.formatMessage(navigationMessages[GROUP_ID.recordGroup])}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={isNavGroupActive}
      />

      {(isNavGroupExpanded || isNavGroupActive) && (
        <>
          {USER_SCOPE[role][GROUP_ID.recordGroup].includes(
            WORKQUEUE_TABS.outbox
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.outbox}
              icon={() => <Icon name="PaperPlaneTilt" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.outbox}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.outbox]
              )}
              count={declarationCount.outbox}
              isSelected={activeMenuItem === WORKQUEUE_TABS.outbox}
              onClick={() => {
                goToHomeTab(WORKQUEUE_TABS.outbox)
                menuCollapse && menuCollapse()
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.recordGroup].includes(
            WORKQUEUE_TABS.inProgress
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.inProgress}
              icon={() => <DeclarationIconSmall color={'purple'} />}
              id={`navigation_${WORKQUEUE_TABS.inProgress}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.inProgress]
              )}
              count={declarationCount.inProgress}
              isSelected={activeMenuItem === WORKQUEUE_TABS.inProgress}
              onClick={() => {
                goToHomeTab(WORKQUEUE_TABS.inProgress)
                menuCollapse && menuCollapse()
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.recordGroup].includes(
            WORKQUEUE_TABS.readyForReview
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.readyForReview}
              icon={() => <DeclarationIconSmall color={'orange'} />}
              id={`navigation_${WORKQUEUE_TABS.readyForReview}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.readyForReview]
              )}
              count={declarationCount.readyForReview}
              isSelected={activeMenuItem === WORKQUEUE_TABS.readyForReview}
              onClick={() => {
                goToHomeTab(WORKQUEUE_TABS.readyForReview)
                menuCollapse && menuCollapse()
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.recordGroup].includes(
            WORKQUEUE_TABS.requiresUpdate
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.requiresUpdate}
              icon={() => <DeclarationIconSmall color={'red'} />}
              id={`navigation_${WORKQUEUE_TABS.requiresUpdate}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.requiresUpdate]
              )}
              count={declarationCount.requiresUpdate}
              isSelected={activeMenuItem === WORKQUEUE_TABS.requiresUpdate}
              onClick={() => {
                goToHomeTab(WORKQUEUE_TABS.requiresUpdate)
                menuCollapse && menuCollapse()
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.recordGroup].includes(
            WORKQUEUE_TABS.sentForApproval
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.sentForApproval}
              icon={() => <DeclarationIconSmall color={'grey'} />}
              id={`navigation_${WORKQUEUE_TABS.sentForApproval}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.sentForApproval]
              )}
              count={declarationCount.sentForApproval}
              isSelected={activeMenuItem === WORKQUEUE_TABS.sentForApproval}
              onClick={() => {
                goToHomeTab(WORKQUEUE_TABS.sentForApproval)
                menuCollapse && menuCollapse()
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.recordGroup].includes(
            WORKQUEUE_TABS.readyToPrint
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.readyToPrint}
              icon={() => <DeclarationIconSmall color={'green'} />}
              id={`navigation_${WORKQUEUE_TABS.readyToPrint}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.readyToPrint]
              )}
              count={declarationCount.readyToPrint}
              isSelected={activeMenuItem === WORKQUEUE_TABS.readyToPrint}
              onClick={() => {
                goToHomeTab(WORKQUEUE_TABS.readyToPrint)
                menuCollapse && menuCollapse()
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.recordGroup].includes(
            WORKQUEUE_TABS.readyToIssue
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.readyToIssue}
              icon={() => <DeclarationIconSmall color={'teal'} />}
              id={`navigation_${WORKQUEUE_TABS.readyToIssue}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.readyToIssue]
              )}
              count={declarationCount.readyToIssue}
              isSelected={activeMenuItem === WORKQUEUE_TABS.readyToIssue}
              onClick={() => {
                goToHomeTab(WORKQUEUE_TABS.readyToIssue)
                menuCollapse && menuCollapse()
              }}
            />
          )}
        </>
      )}
    </NavigationGroup>
  )
}

interface IPerformanceGroupProps {
  intl: IntlShape
  userDetails: UserDetails | null
  activeMenuItem: string
  goToVSExportsAction: typeof goToVSExport
  goToDashboardView: typeof goToDashboardView
  goToPerformanceViewAction: typeof goToPerformanceView
}
const PerformanceGroup = ({
  intl,
  userDetails,
  activeMenuItem,
  goToVSExportsAction,
  goToDashboardView,
  goToPerformanceViewAction
}: IPerformanceGroupProps) => {
  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const role = userDetails?.systemRole || 'FIELD_AGENT'
  const isNavGroupActive =
    USER_SCOPE[role][GROUP_ID.performanceGroup].includes(activeMenuItem)

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        isExpanded={isNavGroupExpanded}
        key="Header"
        id={`navigation_${GROUP_ID.performanceGroup}_main`}
        label={intl.formatMessage(
          navigationMessages[GROUP_ID.performanceGroup]
        )}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={isNavGroupActive}
      />

      {(isNavGroupExpanded || isNavGroupActive) && (
        <>
          {USER_SCOPE[role][GROUP_ID.performanceGroup].includes(
            WORKQUEUE_TABS.performance
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.performance}
              icon={() => <Icon name="ChartLine" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.performance}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.performance]
              )}
              isSelected={activeMenuItem === WORKQUEUE_TABS.performance}
              onClick={() => {
                userDetails && goToPerformanceViewAction(userDetails)
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.performanceGroup].includes(
            WORKQUEUE_TABS.dashboard
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.dashboard}
              icon={() => <Icon name="ChartLine" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.dashboard}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.dashboard]
              )}
              isSelected={activeMenuItem === WORKQUEUE_TABS.dashboard}
              onClick={goToDashboardView}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.performanceGroup].includes(
            WORKQUEUE_TABS.report
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.report}
              icon={() => <Icon name="Activity" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.report}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.report]
              )}
              isSelected={activeMenuItem === WORKQUEUE_TABS.report}
              onClick={() => {
                userDetails && goToPerformanceViewAction(userDetails)
              }}
            />
          )}
          {USER_SCOPE[role][GROUP_ID.performanceGroup].includes(
            WORKQUEUE_TABS.vsexports
          ) && (
            <NavigationItem
              key={WORKQUEUE_TABS.vsexports}
              icon={() => <Icon name="UploadSimple" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.vsexports}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.vsexports]
              )}
              isSelected={activeMenuItem === WORKQUEUE_TABS.vsexports}
              onClick={goToVSExportsAction}
            />
          )}
        </>
      )}
    </NavigationGroup>
  )
}

interface IConfigGroupProps {
  intl: IntlShape
  role: string
  activeMenuItem: string
  goToCertificateConfigAction: typeof goToCertificateConfig
  goToFormConfigAction: typeof goToFormConfigHome
  goToUserRolesConfigAction: typeof goToUserRolesConfig
  goToApplicationConfigAction: typeof goToApplicationConfig
}
const ConfigGroup = ({
  intl,
  role,
  activeMenuItem,
  goToCertificateConfigAction,
  goToUserRolesConfigAction,
  goToFormConfigAction,
  goToApplicationConfigAction
}: IConfigGroupProps) => {
  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const isNavGroupActive =
    USER_SCOPE[role][GROUP_ID.configGroup].includes(activeMenuItem)

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        isExpanded={isNavGroupExpanded}
        id={`navigation_${GROUP_ID.configGroup}_main`}
        label={intl.formatMessage(navigationMessages[GROUP_ID.configGroup])}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={isNavGroupActive}
      />

      {(isNavGroupExpanded || isNavGroupActive) && (
        <>
          <NavigationItem
            key={WORKQUEUE_TABS.application}
            icon={() => <Icon name="Compass" size="medium" />}
            id={`navigation_${WORKQUEUE_TABS.application}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.application]
            )}
            isSelected={activeMenuItem === WORKQUEUE_TABS.application}
            onClick={goToApplicationConfigAction}
          />
          <NavigationItem
            key={WORKQUEUE_TABS.declarationForms}
            icon={() => <Icon name="Database" size="medium" />}
            id={`navigation_${WORKQUEUE_TABS.declarationForms}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.declarationForms]
            )}
            isSelected={activeMenuItem === WORKQUEUE_TABS.declarationForms}
            onClick={goToFormConfigAction}
          />
          <NavigationItem
            key={WORKQUEUE_TABS.certificate}
            icon={() => <Icon name="Medal" size="medium" />}
            id={`navigation_${WORKQUEUE_TABS.certificate}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.certificate]
            )}
            isSelected={activeMenuItem === WORKQUEUE_TABS.certificate}
            onClick={goToCertificateConfigAction}
          />
          <NavigationItem
            key={WORKQUEUE_TABS.userRoles}
            icon={() => <SettingsNavigation />}
            id={`navigation_${WORKQUEUE_TABS.userRoles}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.userRoles]
            )}
            isSelected={activeMenuItem === WORKQUEUE_TABS.userRoles}
            onClick={goToUserRolesConfigAction}
          />
        </>
      )}
    </NavigationGroup>
  )
}

interface IOrganizationGroupProps {
  intl: IntlShape
  userDetails: UserDetails | null
  activeMenuItem: string
  goToTeamViewAction: typeof goToTeamView
  goToOrganisationViewAction: typeof goToOrganisationView
}
const OrganizationGroup = ({
  intl,
  userDetails,
  activeMenuItem,
  goToOrganisationViewAction,
  goToTeamViewAction
}: IOrganizationGroupProps) => {
  const [isNavGroupExpanded, setIsNavGroupExpanded] = React.useState(false)
  const role = userDetails?.systemRole || 'FIELD_AGENT'
  const isNavGroupActive =
    USER_SCOPE[role][GROUP_ID.organizationGroup].includes(activeMenuItem)

  const configNavClickHandler: INavClickHandler = {
    [WORKQUEUE_TABS.administrativeAreas]: () =>
      userDetails && goToOrganisationViewAction(userDetails),
    [WORKQUEUE_TABS.team]: () => userDetails && goToTeamViewAction(userDetails)
  }

  return (
    <NavigationGroup>
      <NavigationGroupHeader
        isExpanded={isNavGroupExpanded}
        id={`navigation_${GROUP_ID.organizationGroup}_main`}
        label={intl.formatMessage(
          navigationMessages[GROUP_ID.organizationGroup]
        )}
        onClick={() => setIsNavGroupExpanded(!isNavGroupExpanded)}
        isSelected={isNavGroupActive}
      />

      {(isNavGroupExpanded || isNavGroupActive) && (
        <>
          <NavigationItem
            key={WORKQUEUE_TABS.administrativeAreas}
            icon={() => <Icon name="ListBullets" size="small" />}
            id={`navigation_${WORKQUEUE_TABS.administrativeAreas}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.administrativeAreas]
            )}
            isSelected={activeMenuItem === WORKQUEUE_TABS.administrativeAreas}
            onClick={() => {
              userDetails && goToOrganisationViewAction(userDetails)
            }}
          />
          <NavigationItem
            key={WORKQUEUE_TABS.myOffice}
            icon={() => <Icon name="Users" size="medium" />}
            id={`navigation_${WORKQUEUE_TABS.myOffice}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.myOffice]
            )}
            isSelected={activeMenuItem === WORKQUEUE_TABS.myOffice}
            onClick={() => {
              userDetails && goToTeamViewAction(userDetails)
            }}
          />
        </>
      )}
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
    className,
    activeMenuItem
  } = props

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
        USER_SCOPE[userDetails.systemRole][GROUP_ID.recordGroup] && (
          <RecordGroup
            intl={props.intl}
            role={userDetails.systemRole}
            activeMenuItem={activeMenuItem}
            workqueue={props.workqueue}
            storedDeclarations={props.storedDeclarations}
            draftDeclarations={props.draftDeclarations}
            menuCollapse={menuCollapse}
            goToHomeTab={props.goToHomeTab}
          />
        )}

      {userDetails?.systemRole &&
        USER_SCOPE[userDetails.systemRole][GROUP_ID.performanceGroup] && (
          <PerformanceGroup
            intl={props.intl}
            userDetails={userDetails}
            activeMenuItem={activeMenuItem}
            goToVSExportsAction={props.goToVSExportsAction}
            goToDashboardView={props.goToDashboardView}
            goToPerformanceViewAction={props.goToPerformanceViewAction}
          />
        )}

      {userDetails?.systemRole &&
        USER_SCOPE[userDetails.systemRole][GROUP_ID.configGroup] && (
          <ConfigGroup
            intl={props.intl}
            role={userDetails.systemRole}
            activeMenuItem={activeMenuItem}
            goToCertificateConfigAction={props.goToCertificateConfigAction}
            goToUserRolesConfigAction={props.goToUserRolesConfigAction}
            goToFormConfigAction={props.goToFormConfigAction}
            goToApplicationConfigAction={props.goToApplicationConfigAction}
          />
        )}

      {userDetails?.systemRole &&
        USER_SCOPE[userDetails.systemRole][GROUP_ID.organizationGroup] && (
          <OrganizationGroup
            intl={props.intl}
            userDetails={userDetails}
            activeMenuItem={activeMenuItem}
            goToOrganisationViewAction={props.goToOrganisationViewAction}
            goToTeamViewAction={props.goToTeamViewAction}
          />
        )}

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
                // disabled={
                //   advancedSearchParams.searchId === bookmarkResult.searchId &&
                //   props.location.pathname === ADVANCED_SEARCH_RESULT
                // }
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
  const getActiveMenue = (url: string) => {
    for (const [key, value] of Object.entries(WORKQUEUE_TABS)) {
      if (url.includes(value)) return value
    }
    return ''
  }

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
    activeMenuItem: getActiveMenue(window.location.href)
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
