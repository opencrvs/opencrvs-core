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
  filterProcessingDeclarationsFromQuery,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { buttonMessages } from '@client/i18n/messages'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
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
import { ADVANCED_SEARCH_RESULT } from '@client/navigation/routes'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { getAdvancedSearchParamsState } from '@client/search/advancedSearch/advancedSearchSelectors'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { storage } from '@client/storage'
import {
  ALLOWED_STATUS_FOR_RETRY,
  INPROGRESS_STATUS
} from '@client/SubmissionController'
import { IS_PROD_ENVIRONMENT } from '@client/utils/constants'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { Event } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { IWorkqueue, updateRegistrarWorkqueue } from '@client/workqueue'
import { IStoreState } from '@opencrvs/client/src/store'
import { Icon } from '@opencrvs/components/lib/Icon'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LeftNavigation } from '@opencrvs/components/lib/SideNavigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/SideNavigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/SideNavigation/NavigationItem'
import { NavigationSubItem } from '@opencrvs/components/lib/SideNavigation/NavigationSubItem'
import { omit } from 'lodash'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'
import ScopedComponent from '@client/components/ScopedComponent'
import { SCOPES } from '@opencrvs/commons/scopes'

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
  readyToIssue: 'readyToIssue',
  dashboard: 'dashboard',
  statistics: 'statistics',
  leaderboards: 'leaderboards',
  report: 'report'
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
    goToVSExportsAction,
    goToSystemViewAction,
    goToAdvancedSearchResultAction,
    navigationWidth,
    workqueue,
    storedDeclarations,
    draftDeclarations,
    menuCollapse,
    userInfo,
    offlineCountryConfiguration,
    updateRegistrarWorkqueue,
    setAdvancedSearchParam,
    goToPerformanceStatistics,
    goToDashboardView,
    goToLeaderBoardsView,
    goToAllUserEmail,
    className
  } = props
  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : 'review'

  const configTab: string[] = [WORKQUEUE_TABS.systems]
  const conmmunicationTab: string[] = [
    WORKQUEUE_TABS.informantNotification,
    WORKQUEUE_TABS.emailAllUsers
  ]
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  const [isCommunationExpanded, setIsCommunationExpanded] =
    React.useState(false)

  const { data, initialSyncDone } = workqueue
  const filteredData = filterProcessingDeclarationsFromQuery(
    data,
    storedDeclarations
  )
  const runningVer = String(localStorage.getItem('running-version'))

  const isOnePrintInAdvanceOn = Object.values(Event).some((event: Event) => {
    const upperCaseEvent = event.toUpperCase() as Uppercase<Event>
    return offlineCountryConfiguration.config[upperCaseEvent].PRINT_IN_ADVANCE
  })
  const showRegDashboard =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.REGISTRATIONS_DASHBOARD_URL)
  const showLeaderboard =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.LEADERBOARDS_DASHBOARD_URL)
  const showStatistics =
    !IS_PROD_ENVIRONMENT ||
    (IS_PROD_ENVIRONMENT && window.config.STATISTICS_DASHBOARD_URL)

  React.useEffect(() => {
    if (!userDetails || !loadWorkqueueStatuses) {
      return
    }
    updateRegistrarWorkqueue(
      userDetails.practitionerId,
      10 // Page size shouldn't matter here as we're only interested in totals
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
      window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE && !initialSyncDone
        ? 0
        : filteredData.externalValidationTab?.totalItems || 0,
    readyToPrint: !initialSyncDone ? 0 : filteredData.printTab?.totalItems || 0,
    readyToIssue: !initialSyncDone ? 0 : filteredData.issueTab?.totalItems || 0,
    outbox: storedDeclarations.filter((draft) =>
      (
        [
          ...ALLOWED_STATUS_FOR_RETRY,
          ...INPROGRESS_STATUS,
          SUBMISSION_STATUS.FAILED
        ] as SUBMISSION_STATUS[]
      ).includes(draft.submissionStatus as SUBMISSION_STATUS)
    ).length
  }

  return (
    <LeftNavigation
      applicationName={offlineCountryConfiguration.config.APPLICATION_NAME}
      applicationVersion={runningVer}
      navigationWidth={navigationWidth}
      name={userInfo && userInfo.name}
      role={userInfo && userInfo.role}
      avatar={() => userInfo && userInfo.avatar}
      className={className}
    >
      <NavigationGroup>
        <ScopedComponent
          scopes={[
            SCOPES.RECORD_DECLARE_BIRTH,
            SCOPES.RECORD_DECLARE_BIRTH_MY_JURISDICTION,
            SCOPES.RECORD_DECLARE_DEATH,
            SCOPES.RECORD_DECLARE_DEATH_MY_JURISDICTION,
            SCOPES.RECORD_DECLARE_MARRIAGE,
            SCOPES.RECORD_DECLARE_MARRIAGE_MY_JURISDICTION
          ]}
        >
          <NavigationItem
            icon={() => <DeclarationIconSmall color={'purple'} />}
            id={`navigation_${WORKQUEUE_TABS.inProgress}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.inProgress]
            )}
            count={declarationCount.inProgress}
            isSelected={tabId === WORKQUEUE_TABS.inProgress}
            onClick={() => {
              props.goToHomeTab(WORKQUEUE_TABS.inProgress)
              menuCollapse && menuCollapse()
            }}
          />
        </ScopedComponent>
        <ScopedComponent scopes={[SCOPES.RECORD_SUBMIT_FOR_REVIEW]}>
          <NavigationItem
            icon={() => <DeclarationIconSmall color={'orange'} />}
            id={`navigation_${WORKQUEUE_TABS.sentForReview}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.sentForReview]
            )}
            count={declarationCount.readyForReview}
            isSelected={tabId === WORKQUEUE_TABS.sentForReview}
            onClick={() => {
              props.goToHomeTab(WORKQUEUE_TABS.sentForReview)
              menuCollapse && menuCollapse()
            }}
          />
        </ScopedComponent>
        <ScopedComponent scopes={[SCOPES.RECORD_SUBMIT_FOR_APPROVAL]}>
          <NavigationItem
            icon={() => <DeclarationIconSmall color={'grey'} />}
            id={`navigation_${WORKQUEUE_TABS.sentForApproval}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.sentForApproval]
            )}
            count={declarationCount.sentForApproval}
            isSelected={tabId === WORKQUEUE_TABS.sentForApproval}
            onClick={() => {
              props.goToHomeTab(WORKQUEUE_TABS.sentForApproval)
              menuCollapse && menuCollapse()
            }}
          />
        </ScopedComponent>
        <ScopedComponent scopes={[SCOPES.RECORD_DECLARATION_REVIEW]}>
          <NavigationItem
            icon={() => <DeclarationIconSmall color={'red'} />}
            id={`navigation_${WORKQUEUE_TABS.requiresUpdate}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.requiresUpdate]
            )}
            count={declarationCount.requiresUpdate}
            isSelected={tabId === WORKQUEUE_TABS.requiresUpdate}
            onClick={() => {
              props.goToHomeTab(WORKQUEUE_TABS.requiresUpdate)
              menuCollapse && menuCollapse()
            }}
          />
        </ScopedComponent>
        <ScopedComponent scopes={[SCOPES.RECORD_DECLARATION_REVIEW]}>
          <NavigationItem
            icon={() => <DeclarationIconSmall color={'orange'} />}
            id={`navigation_${WORKQUEUE_TABS.readyForReview}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.readyForReview]
            )}
            count={declarationCount.readyForReview}
            isSelected={tabId === WORKQUEUE_TABS.readyForReview}
            onClick={() => {
              props.goToHomeTab(WORKQUEUE_TABS.readyForReview)
              menuCollapse && menuCollapse()
            }}
          />
        </ScopedComponent>
        <ScopedComponent scopes={[SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES]}>
          <NavigationItem
            icon={() => <DeclarationIconSmall color={'green'} />}
            id={`navigation_${WORKQUEUE_TABS.readyToPrint}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.readyToPrint]
            )}
            count={declarationCount.readyToPrint}
            isSelected={tabId === WORKQUEUE_TABS.readyToPrint}
            onClick={() => {
              props.goToHomeTab(WORKQUEUE_TABS.readyToPrint)
              menuCollapse && menuCollapse()
            }}
          />
        </ScopedComponent>
        {window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE && (
          <ScopedComponent scopes={[SCOPES.RECORD_REGISTER]}>
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'teal'} />}
              id={`navigation_${WORKQUEUE_TABS.externalValidation}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.externalValidation]
              )}
              count={declarationCount.externalValidation}
              isSelected={tabId === WORKQUEUE_TABS.externalValidation}
              onClick={() => {
                props.goToHomeTab(WORKQUEUE_TABS.externalValidation)
                menuCollapse && menuCollapse()
              }}
            />
          </ScopedComponent>
        )}
        {isOnePrintInAdvanceOn && (
          <ScopedComponent
            scopes={[SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES]}
          >
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'teal'} />}
              id={`navigation_${WORKQUEUE_TABS.readyToIssue}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.readyToIssue]
              )}
              count={declarationCount.readyToIssue}
              isSelected={tabId === WORKQUEUE_TABS.readyToIssue}
              onClick={() => {
                props.goToHomeTab(WORKQUEUE_TABS.readyToIssue)
                menuCollapse && menuCollapse()
              }}
            />
          </ScopedComponent>
        )}
        <ScopedComponent denyScopes={[SCOPES.SYSADMIN, SCOPES.NATLSYSADMIN]}>
          <NavigationItem
            icon={() => <Icon name="PaperPlaneTilt" size="medium" />}
            id={`navigation_${WORKQUEUE_TABS.outbox}`}
            label={intl.formatMessage(
              navigationMessages[WORKQUEUE_TABS.outbox]
            )}
            count={declarationCount.outbox}
            isSelected={tabId === WORKQUEUE_TABS.outbox}
            onClick={() => {
              props.goToHomeTab(WORKQUEUE_TABS.outbox)
              menuCollapse && menuCollapse()
            }}
          />
        </ScopedComponent>
      </NavigationGroup>

      <ScopedComponent
        scopes={[
          SCOPES.ORGANISATION_READ,
          SCOPES.ORGANISATION_READ_LOCATIONS,
          SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE
        ]}
      >
        <NavigationGroup>
          {userDetails && (
            <>
              <ScopedComponent scopes={[SCOPES.PERFORMANCE_READ]}>
                <NavigationItem
                  icon={() => <Icon name="Activity" size="medium" />}
                  id={`navigation_${WORKQUEUE_TABS.performance}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.performance]
                  )}
                  onClick={() => {
                    props.goToPerformanceViewAction()
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.performance
                  }
                />
              </ScopedComponent>

              <ScopedComponent scopes={[SCOPES.ORGANISATION_READ]}>
                <NavigationItem
                  icon={() => <Icon name="Buildings" size="medium" />}
                  id={`navigation_${WORKQUEUE_TABS.organisation}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.organisation]
                  )}
                  onClick={() => props.goToOrganisationViewAction(userDetails)}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.organisation
                  }
                />
              </ScopedComponent>

              <ScopedComponent
                scopes={[
                  SCOPES.ORGANISATION_READ_LOCATIONS,
                  SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE
                ]}
              >
                <NavigationItem
                  icon={() => <Icon name="Users" size="medium" />}
                  id={`navigation_${WORKQUEUE_TABS.team}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.team]
                  )}
                  onClick={() => props.goToTeamViewAction(userDetails)}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.team
                  }
                />
              </ScopedComponent>
            </>
          )}

          <ScopedComponent scopes={[SCOPES.SYSADMIN, SCOPES.NATLSYSADMIN]}>
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
                onClick={goToSystemViewAction}
                isSelected={
                  enableMenuSelection &&
                  activeMenuItem === WORKQUEUE_TABS.systems
                }
              />
            )}
          </ScopedComponent>

          <ScopedComponent scopes={[SCOPES.SYSADMIN, SCOPES.NATLSYSADMIN]}>
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
                onClick={goToAllUserEmail}
                isSelected={
                  enableMenuSelection &&
                  activeMenuItem === WORKQUEUE_TABS.emailAllUsers
                }
              />
            )}
          </ScopedComponent>
        </NavigationGroup>
      </ScopedComponent>
      <ScopedComponent
        scopes={[
          SCOPES.PERFORMANCE_READ,
          SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
          SCOPES.PERFORMANCE_READ_DASHBOARDS
        ]}
      >
        <NavigationGroup>
          {
            <>
              {showRegDashboard && (
                <ScopedComponent scopes={[SCOPES.PERFORMANCE_READ_DASHBOARDS]}>
                  <NavigationItem
                    icon={() => <Icon name="ChartLine" size="medium" />}
                    label={intl.formatMessage(navigationMessages['dashboard'])}
                    onClick={goToDashboardView}
                    id={`navigation_${WORKQUEUE_TABS.dashboard}`}
                    isSelected={
                      enableMenuSelection && activeMenuItem === 'dashboard'
                    }
                  />
                </ScopedComponent>
              )}
              {showStatistics && (
                <ScopedComponent scopes={[SCOPES.PERFORMANCE_READ]}>
                  <NavigationItem
                    icon={() => <Icon name="Activity" size="medium" />}
                    label={intl.formatMessage(navigationMessages['statistics'])}
                    onClick={goToPerformanceStatistics}
                    id={`navigation_${WORKQUEUE_TABS.statistics}`}
                    isSelected={
                      enableMenuSelection && activeMenuItem === 'statistics'
                    }
                  />
                </ScopedComponent>
              )}
              {showLeaderboard && (
                <ScopedComponent scopes={[SCOPES.PERFORMANCE_READ]}>
                  <NavigationItem
                    icon={() => <Icon name="Medal" size="medium" />}
                    label={intl.formatMessage(
                      navigationMessages['leaderboards']
                    )}
                    onClick={goToLeaderBoardsView}
                    id={`navigation_${WORKQUEUE_TABS.leaderboards}`}
                    isSelected={
                      enableMenuSelection && activeMenuItem === 'leaderboards'
                    }
                  />
                </ScopedComponent>
              )}
              {userDetails && (
                <ScopedComponent scopes={[SCOPES.PERFORMANCE_READ]}>
                  <NavigationItem
                    icon={() => <Icon name="ChartBar" size="medium" />}
                    label={intl.formatMessage(
                      navigationMessages['performance']
                    )}
                    onClick={() => props.goToPerformanceViewAction()}
                    id={`navigation_${WORKQUEUE_TABS.report}`}
                    isSelected={
                      enableMenuSelection &&
                      activeMenuItem === WORKQUEUE_TABS.performance
                    }
                  />
                </ScopedComponent>
              )}
            </>
          }
          <ScopedComponent
            scopes={[SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS]}
          >
            <NavigationItem
              icon={() => <Icon name="Export" size="medium" />}
              id={`navigation_${WORKQUEUE_TABS.vsexports}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.vsexports]
              )}
              onClick={goToVSExportsAction}
              isSelected={
                enableMenuSelection &&
                activeMenuItem === WORKQUEUE_TABS.vsexports
              }
            />
          </ScopedComponent>
        </NavigationGroup>
      </ScopedComponent>

      <NavigationGroup>
        {userDetails?.searches && userDetails.searches.length > 0 ? (
          userDetails.searches.map((bookmarkResult) => {
            return (
              <NavigationItem
                key={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
                icon={() => (
                  <Icon
                    name="Star"
                    color="yellow"
                    size="medium"
                    weight="fill"
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
                    searchId: bookmarkResult?.searchId,
                    bookmarkName: bookmarkResult?.name
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
