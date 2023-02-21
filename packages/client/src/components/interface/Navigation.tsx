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
  goToDashboardView
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { Activity, Users, PaperPlane } from '@opencrvs/components/lib/icons'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { Configuration } from '@opencrvs/components/lib/icons/Configuration'
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
import * as Icons from 'react-feather'
import { ChartActivity } from '@opencrvs/components/lib/Icon/custom-icons'

const SCREEN_LOCK = 'screenLock'

type Keys = keyof typeof WORKQUEUE_TABS
export type IWORKQUEUE_TABS = typeof WORKQUEUE_TABS[Keys]

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
  application: 'application',
  certificate: 'certificate',
  systems: 'integration',
  settings: 'settings',
  logout: 'logout',
  declarationForms: 'form'
} as const

const GROUP_ID = {
  declarationGroup: 'declarationGroup',
  menuGroup: 'menuGroup',
  leaderBoards: 'leaderBoards',
  statistics: 'statistics',
  performance: 'performance',
  dashboard: 'dashboard'
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
    GROUP_ID.declarationGroup
  ],
  REGISTRATION_AGENT: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.sentForApproval,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.outbox,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  DISTRICT_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  NATIONAL_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.vsexports,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    GROUP_ID.performance,
    GROUP_ID.leaderBoards,
    GROUP_ID.statistics,
    GROUP_ID.dashboard,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_SYSTEM_ADMIN: [
    GROUP_ID.performance,
    GROUP_ID.leaderBoards,
    GROUP_ID.statistics,
    GROUP_ID.dashboard,
    WORKQUEUE_TABS.team,
    GROUP_ID.menuGroup
  ],
  NATIONAL_SYSTEM_ADMIN: [
    GROUP_ID.performance,
    GROUP_ID.leaderBoards,
    GROUP_ID.statistics,
    GROUP_ID.dashboard,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.config,
    WORKQUEUE_TABS.vsexports,
    GROUP_ID.menuGroup
  ],
  PERFORMANCE_MANAGEMENT: [
    GROUP_ID.performance,
    GROUP_ID.leaderBoards,
    GROUP_ID.statistics,
    GROUP_ID.dashboard,
    GROUP_ID.menuGroup
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
  goToCertificateConfigAction: typeof goToCertificateConfig
  goToVSExportsAction: typeof goToVSExport
  goToFormConfigAction: typeof goToFormConfigHome
  goToApplicationConfigAction: typeof goToApplicationConfig
  goToAdvancedSearchResultAction: typeof goToAdvancedSearchResult
  redirectToAuthentication: typeof redirectToAuthentication
  goToPerformanceViewAction: typeof goToPerformanceView
  goToTeamViewAction: typeof goToTeamView
  goToSystemViewAction: typeof goToSystemList
  goToSettings: typeof goToSettings
  goToLeaderBoardsView: typeof goToLeaderBoardsView
  goToDashboardView: typeof goToDashboardView
  goToPerformanceStatistics: typeof goToPerformanceStatistics
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
  setAdvancedSearchParam: typeof setAdvancedSearchParam
}

interface IStateProps {
  draftDeclarations: IDeclaration[]
  declarationsReadyToSend: IDeclaration[]
  userDetails: IUserDetails | null
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

export const NavigationView = (props: IFullProps) => {
  const {
    intl,
    match,
    userDetails,
    advancedSearchParams,
    deselectAllTabs,
    enableMenuSelection = true,
    loadWorkqueueStatuses = true,
    activeMenuItem,
    goToCertificateConfigAction,
    goToVSExportsAction,
    goToFormConfigAction,
    goToSystemViewAction,
    goToApplicationConfigAction,
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
    className
  } = props
  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : 'review'
  const configTab: string[] = [
    WORKQUEUE_TABS.application,
    WORKQUEUE_TABS.certificate,
    WORKQUEUE_TABS.declarationForms,
    WORKQUEUE_TABS.systems
  ]
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  const { data, initialSyncDone } = workqueue
  const filteredData = filterProcessingDeclarationsFromQuery(
    data,
    storedDeclarations
  )
  const runningVer = String(localStorage.getItem('running-version'))

  React.useEffect(() => {
    if (!userDetails || !loadWorkqueueStatuses) {
      return
    }
    updateRegistrarWorkqueue(
      userDetails.practitionerId,
      10, // Page size shouldn't matter here as we're only interested in totals
      userDetails.role === 'FIELD_AGENT'
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
      {userDetails?.role === 'FIELD_AGENT' ? (
        <>
          <NavigationGroup>
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'purple'} />}
              id={`navigation_${WORKQUEUE_TABS.inProgress}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TABS.inProgress]
              )}
              count={props.draftDeclarations.length}
              isSelected={tabId === WORKQUEUE_TABS.inProgress}
              onClick={() => {
                props.goToHomeTab(WORKQUEUE_TABS.inProgress)
                menuCollapse && menuCollapse()
              }}
            />
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
            <NavigationItem
              icon={() => <PaperPlane />}
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
          </NavigationGroup>
        </>
      ) : (
        <>
          {userDetails?.role &&
            USER_SCOPE[userDetails.role].includes(
              GROUP_ID.declarationGroup
            ) && (
              <NavigationGroup>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.inProgress
                  ) && (
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
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.readyForReview
                  ) && (
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
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.requiresUpdate
                  ) && (
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
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.sentForApproval
                  ) && (
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
                  )}
                {window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
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
                )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.readyToPrint
                  ) && (
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
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.outbox
                  ) && (
                    <NavigationItem
                      icon={() => <PaperPlane />}
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
                  )}
              </NavigationGroup>
            )}
          {userDetails?.role &&
            USER_SCOPE[userDetails.role].includes(GROUP_ID.menuGroup) && (
              <NavigationGroup>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.performance
                  ) && (
                    <NavigationItem
                      icon={() => <Activity />}
                      id={`navigation_${WORKQUEUE_TABS.performance}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TABS.performance]
                      )}
                      onClick={() => {
                        props.goToPerformanceViewAction(userDetails)
                      }}
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TABS.performance
                      }
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.vsexports
                  ) && (
                    <NavigationItem
                      icon={() => <Icon name="Share" size="small" />}
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
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.team
                  ) && (
                    <NavigationItem
                      icon={() => <Users />}
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
                  )}

                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.config
                  ) && (
                    <>
                      <NavigationItem
                        icon={() => <Configuration />}
                        id={`navigation_${WORKQUEUE_TABS.config}_main`}
                        label={intl.formatMessage(
                          navigationMessages[WORKQUEUE_TABS.config]
                        )}
                        onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                        isSelected={
                          enableMenuSelection &&
                          configTab.includes(activeMenuItem)
                        }
                        expandableIcon={() =>
                          isConfigExpanded ||
                          configTab.includes(activeMenuItem) ? (
                            <Expandable selected={true} />
                          ) : (
                            <Expandable />
                          )
                        }
                      />
                      {(isConfigExpanded ||
                        configTab.includes(activeMenuItem)) && (
                        <>
                          <NavigationSubItem
                            label={intl.formatMessage(
                              navigationMessages[WORKQUEUE_TABS.application]
                            )}
                            id={`navigation_${WORKQUEUE_TABS.application}`}
                            onClick={goToApplicationConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === WORKQUEUE_TABS.application
                            }
                          />
                          <NavigationSubItem
                            label={intl.formatMessage(
                              navigationMessages[WORKQUEUE_TABS.certificate]
                            )}
                            id={`navigation_${WORKQUEUE_TABS.certificate}`}
                            onClick={goToCertificateConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === WORKQUEUE_TABS.certificate
                            }
                          />
                          <NavigationSubItem
                            id={`navigation_${WORKQUEUE_TABS.declarationForms}`}
                            label={intl.formatMessage(
                              navigationMessages[
                                WORKQUEUE_TABS.declarationForms
                              ]
                            )}
                            onClick={goToFormConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === WORKQUEUE_TABS.declarationForms
                            }
                          />

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
                        </>
                      )}
                    </>
                  )}
              </NavigationGroup>
            )}
          {userDetails?.role &&
            USER_SCOPE[userDetails.role].includes(GROUP_ID.menuGroup) && (
              <NavigationGroup>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    GROUP_ID.performance
                  ) && (
                    <>
                      <Text
                        variant="bold14"
                        style={{ marginLeft: 24 }}
                        element="p"
                        color="opacity24"
                      >
                        {' '}
                        Analytics{' '}
                      </Text>
                      <NavigationItem
                        icon={() => (
                          <ChartActivity color={'primary'} size={24} />
                        )}
                        label={intl.formatMessage(
                          navigationMessages[GROUP_ID.dashboard]
                        )}
                        onClick={goToDashboardView}
                        id={`navigation_${GROUP_ID.dashboard}`}
                        isSelected={
                          enableMenuSelection &&
                          activeMenuItem === GROUP_ID.dashboard
                        }
                      />
                      <NavigationItem
                        icon={() => <Activity />}
                        label={intl.formatMessage(
                          navigationMessages[GROUP_ID.statistics]
                        )}
                        onClick={goToPerformanceStatistics}
                        id={`navigation_${GROUP_ID.statistics}`}
                        isSelected={
                          enableMenuSelection &&
                          activeMenuItem === GROUP_ID.statistics
                        }
                      />
                      <NavigationItem
                        icon={() => <Icons.Award width={20} height={20} />}
                        label={intl.formatMessage(
                          navigationMessages[GROUP_ID.leaderBoards]
                        )}
                        onClick={goToLeaderBoardsView}
                        id={`navigation_${GROUP_ID.leaderBoards}`}
                        isSelected={
                          enableMenuSelection &&
                          activeMenuItem === GROUP_ID.leaderBoards
                        }
                      />
                      <NavigationItem
                        icon={() => <Icons.BarChart2 width={20} height={20} />}
                        label={intl.formatMessage(navigationMessages['report'])}
                        onClick={() =>
                          props.goToPerformanceViewAction(userDetails)
                        }
                        id={`navigation_${GROUP_ID.performance}_main`}
                        isSelected={
                          enableMenuSelection &&
                          activeMenuItem === GROUP_ID.performance
                        }
                      />
                    </>
                  )}
              </NavigationGroup>
            )}
        </>
      )}
      <NavigationGroup>
        {userDetails?.searches && userDetails?.searches.length > 0 ? (
          userDetails?.searches.map((bookmarkResult, index) => {
            return (
              <NavigationItem
                icon={() => (
                  <Icon name={'Star'} color={'yellow'} fill={'yellow'}></Icon>
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
                    searchId: bookmarkResult.searchId
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
      : window.location.href.includes(WORKQUEUE_TABS.team)
      ? WORKQUEUE_TABS.team
      : window.location.href.includes(WORKQUEUE_TABS.vsexports)
      ? WORKQUEUE_TABS.vsexports
      : window.location.href.includes(WORKQUEUE_TABS.application)
      ? WORKQUEUE_TABS.application
      : window.location.href.includes(WORKQUEUE_TABS.settings)
      ? WORKQUEUE_TABS.settings
      : window.location.href.includes(WORKQUEUE_TABS.certificate)
      ? WORKQUEUE_TABS.certificate
      : window.location.href.includes(WORKQUEUE_TABS.declarationForms)
      ? WORKQUEUE_TABS.declarationForms
      : window.location.href.includes(WORKQUEUE_TABS.systems)
      ? WORKQUEUE_TABS.systems
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
  goToApplicationConfigAction: goToApplicationConfig,
  goToAdvancedSearchResultAction: goToAdvancedSearchResult,
  goToVSExportsAction: goToVSExport,
  goToPerformanceViewAction: goToPerformanceView,
  goToTeamViewAction: goToTeamView,
  goToSystemViewAction: goToSystemList,
  redirectToAuthentication,
  goToSettings,
  updateRegistrarWorkqueue,
  setAdvancedSearchParam,
  goToPerformanceStatistics,
  goToLeaderBoardsView,
  goToDashboardView
})(injectIntl(withRouter(NavigationView)))

/** @deprecated since the introduction of `<Frame>` */
export const FixedNavigation = styled(Navigation)`
  position: fixed;
`
