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
  goToDashboardView,
  goToUserRolesConfig,
  goToOrganisationView,
  goToInformantNotification
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
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
import { ChartActivity } from '@opencrvs/components/lib/Icon/custom-icons'
import { UserDetails } from '@client/utils/userUtils'

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
  readyToIssue: 'readyToIssue'
} as const

const GROUP_ID = {
  declarationGroup: 'declarationGroup',
  analytics: 'analytics',
  menuGroup: 'menuGroup'
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
    WORKQUEUE_TABS.readyToIssue,
    GROUP_ID.declarationGroup
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
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
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
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
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
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  NATIONAL_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.vsexports,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    WORKQUEUE_TABS.readyToIssue,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup,
    GROUP_ID.analytics
  ],
  LOCAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.readyToIssue,
    GROUP_ID.menuGroup
  ],
  NATIONAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.config,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.vsexports,
    WORKQUEUE_TABS.communications,
    WORKQUEUE_TABS.userRoles,
    WORKQUEUE_TABS.informantNotification,
    GROUP_ID.menuGroup,
    GROUP_ID.analytics
  ],
  PERFORMANCE_MANAGEMENT: [GROUP_ID.menuGroup, GROUP_ID.analytics]
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
    goToUserRolesConfigAction,
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
    goToInformantNotification,
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
    WORKQUEUE_TABS.systems,
    WORKQUEUE_TABS.userRoles
  ]
  const conmmunicationTab: string[] = [WORKQUEUE_TABS.informantNotification]
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  const [isCommunationExpanded, setIsCommunationExpanded] =
    React.useState(false)

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
      {userDetails?.systemRole === 'FIELD_AGENT' ? (
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
          </NavigationGroup>
        </>
      ) : (
        <>
          {userDetails?.systemRole &&
            USER_SCOPE[userDetails.systemRole].includes(
              GROUP_ID.declarationGroup
            ) && (
              <NavigationGroup>
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
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
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
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
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
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
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
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
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
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

                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    WORKQUEUE_TABS.readyToIssue
                  ) && (
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
                  )}

                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    WORKQUEUE_TABS.outbox
                  ) && (
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
                  )}
              </NavigationGroup>
            )}
          {userDetails?.systemRole &&
            USER_SCOPE[userDetails.systemRole].includes(GROUP_ID.menuGroup) && (
              <NavigationGroup>
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    WORKQUEUE_TABS.performance
                  ) && (
                    <NavigationItem
                      icon={() => <Icon name="Activity" size="medium" />}
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
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
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
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    WORKQUEUE_TABS.organisation
                  ) && (
                    <NavigationItem
                      icon={() => <Icon name="List" size="small" />}
                      id={`navigation_${WORKQUEUE_TABS.organisation}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TABS.organisation]
                      )}
                      onClick={() =>
                        props.goToOrganisationViewAction(userDetails)
                      }
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TABS.organisation
                      }
                    />
                  )}
                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    WORKQUEUE_TABS.team
                  ) && (
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
                  )}

                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    WORKQUEUE_TABS.config
                  ) && (
                    <>
                      <NavigationItem
                        icon={() => <Icon name="Compass" size="small" />}
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

                          <NavigationSubItem
                            id={`navigation_${WORKQUEUE_TABS.userRoles}`}
                            label={intl.formatMessage(
                              navigationMessages[WORKQUEUE_TABS.userRoles]
                            )}
                            onClick={goToUserRolesConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === WORKQUEUE_TABS.userRoles
                            }
                          />
                        </>
                      )}
                    </>
                  )}

                {userDetails?.systemRole &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    WORKQUEUE_TABS.communications
                  ) && (
                    <>
                      <NavigationItem
                        icon={() => <Icon name="ChatCircle" size="small" />}
                        id={`navigation_${WORKQUEUE_TABS.communications}_main`}
                        label={intl.formatMessage(
                          navigationMessages[WORKQUEUE_TABS.communications]
                        )}
                        onClick={() =>
                          setIsCommunationExpanded(!isCommunationExpanded)
                        }
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
                        <>
                          <NavigationSubItem
                            label={intl.formatMessage(
                              navigationMessages[
                                WORKQUEUE_TABS.informantNotification
                              ]
                            )}
                            id={`navigation_${WORKQUEUE_TABS.informantNotification}`}
                            onClick={goToInformantNotification}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem ===
                                WORKQUEUE_TABS.informantNotification
                            }
                          />
                        </>
                      )}
                    </>
                  )}
              </NavigationGroup>
            )}
          {userDetails?.role &&
            USER_SCOPE[userDetails.systemRole].includes(GROUP_ID.analytics) && (
              <NavigationGroup>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.systemRole].includes(
                    GROUP_ID.analytics
                  ) && (
                    <>
                      <Text
                        variant="bold14"
                        style={{ marginLeft: 24 }}
                        element="p"
                        color="opacity24"
                      >
                        {intl.formatMessage(navigationMessages['analytic'])}
                      </Text>
                      <NavigationItem
                        icon={() => <Icon name="ChartLine" size="medium" />}
                        label={intl.formatMessage(
                          navigationMessages['dashboard']
                        )}
                        onClick={goToDashboardView}
                        id="navigation_dashboard"
                        isSelected={
                          enableMenuSelection && activeMenuItem === 'dashboard'
                        }
                      />
                      <NavigationItem
                        icon={() => <Icon name="Activity" size="medium" />}
                        label={intl.formatMessage(
                          navigationMessages['statistics']
                        )}
                        onClick={goToPerformanceStatistics}
                        id="navigation_statistics"
                        isSelected={
                          enableMenuSelection && activeMenuItem === 'statistics'
                        }
                      />
                      <NavigationItem
                        icon={() => <Icon name="Medal" size="medium" />}
                        label={intl.formatMessage(
                          navigationMessages['leaderboards']
                        )}
                        onClick={goToLeaderBoardsView}
                        id="navigation_leaderboards"
                        isSelected={
                          enableMenuSelection &&
                          activeMenuItem === 'leaderboards'
                        }
                      />
                      <NavigationItem
                        icon={() => <Icon name="ChartBar" size="medium" />}
                        label={intl.formatMessage(navigationMessages['report'])}
                        onClick={() =>
                          props.goToPerformanceViewAction(userDetails)
                        }
                        id="navigation_report"
                        isSelected={
                          enableMenuSelection &&
                          activeMenuItem === WORKQUEUE_TABS.performance
                        }
                      />
                    </>
                  )}
              </NavigationGroup>
            )}
        </>
      )}

      <NavigationGroup>
        {userDetails?.searches && userDetails.searches.length > 0 ? (
          userDetails.searches.map((bookmarkResult) => {
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
