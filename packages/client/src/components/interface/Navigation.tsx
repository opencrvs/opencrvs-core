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
  IWorkqueue,
  filterProcessingDeclarationsFromQuery
} from '@client/declarations'
import { IStoreState } from '@opencrvs/client/src/store'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import { LeftNavigation } from '@opencrvs/components/lib/interface/Navigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/interface/Navigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/interface/Navigation/NavigationItem'
import { NavigationSubItem } from '@opencrvs/components/lib/interface/Navigation/NavigationSubItem'
import { connect } from 'react-redux'
import {
  goToHomeTab,
  goToCertificateConfig,
  goToSettings,
  goToPerformanceView,
  goToTeamView,
  goToFormConfigHome,
  goToApplicationConfig
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { COUNT_USER_WISE_DECLARATIONS } from '@client/search/queries'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import { EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'
import { Activity, Users } from '@opencrvs/components/lib/icons'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { Configuration } from '@opencrvs/components/lib/icons/Configuration'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { Query } from '@client/components/Query'
import { RouteComponentProps, withRouter } from 'react-router'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { navigationMessages } from '@client/i18n/messages/views/navigation'

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
  externalValidation: 'waitingValidation',
  performance: 'performance',
  team: 'team',
  config: 'config',
  application: 'application',
  certificate: 'certificate',
  settings: 'settings',
  logout: 'logout',
  declarationForms: 'form'
} as const

const GROUP_ID = {
  declarationGroup: 'declarationGroup',
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
    GROUP_ID.declarationGroup
  ],
  REGISTRATION_AGENT: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.sentForApproval,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.team,
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
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  NATIONAL_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.team,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.team,
    GROUP_ID.menuGroup
  ],
  NATIONAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.config,
    GROUP_ID.menuGroup
  ],
  PERFORMANCE_MANAGEMENT: [WORKQUEUE_TABS.performance, GROUP_ID.menuGroup]
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
}

interface IDispatchProps {
  goToHomeTab: typeof goToHomeTab
  goToCertificateConfigAction: typeof goToCertificateConfig
  goToFormConfigAction: typeof goToFormConfigHome
  goToApplicationConfigAction: typeof goToApplicationConfig
  redirectToAuthentication: typeof redirectToAuthentication
  goToPerformanceViewAction: typeof goToPerformanceView
  goToTeamViewAction: typeof goToTeamView
  goToSettings: typeof goToSettings
}

interface IStateProps {
  draftDeclarations: IDeclaration[]
  declarationsReadyToSend: IDeclaration[]
  userDetails: IUserDetails | null
  activeMenuItem: string
  workqueue: IWorkqueue
  offlineCountryConfiguration: IOfflineData
  storedDeclarations: IDeclaration[]
}

type IFullProps = IProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps &
  RouteComponentProps<{ tabId: string }>

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
    deselectAllTabs,
    enableMenuSelection = true,
    activeMenuItem,
    goToCertificateConfigAction,
    goToFormConfigAction,
    goToApplicationConfigAction,
    navigationWidth,
    workqueue,
    storedDeclarations,
    draftDeclarations,
    menuCollapse,
    userInfo,
    offlineCountryConfiguration
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
    WORKQUEUE_TABS.declarationForms
  ]
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  const { loading, error, data, initialSyncDone } = workqueue
  const filteredData = filterProcessingDeclarationsFromQuery(
    data,
    storedDeclarations
  )

  const fieldAgentLocationId = userDetails && getUserLocation(userDetails).id

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
    readyToPrint: !initialSyncDone ? 0 : filteredData.printTab?.totalItems || 0
  }

  return (
    <LeftNavigation
      applicationName={offlineCountryConfiguration.config.APPLICATION_NAME}
      navigationWidth={navigationWidth}
      name={userInfo && userInfo.name}
      role={userInfo && userInfo.role}
      avatar={() => userInfo && userInfo.avatar}
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
          </NavigationGroup>
          {menuCollapse && (
            <NavigationGroup>{getSettingsAndLogout(props)}</NavigationGroup>
          )}
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
                      onClick={() =>
                        props.goToPerformanceViewAction(userDetails)
                      }
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TABS.performance
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
                        </>
                      )}
                    </>
                  )}
                {menuCollapse && getSettingsAndLogout(props)}
              </NavigationGroup>
            )}
        </>
      )}
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
    activeMenuItem: window.location.href.includes(WORKQUEUE_TABS.performance)
      ? WORKQUEUE_TABS.performance
      : window.location.href.includes(WORKQUEUE_TABS.team)
      ? WORKQUEUE_TABS.team
      : window.location.href.includes(WORKQUEUE_TABS.application)
      ? WORKQUEUE_TABS.application
      : window.location.href.includes(WORKQUEUE_TABS.settings)
      ? WORKQUEUE_TABS.settings
      : window.location.href.includes(WORKQUEUE_TABS.certificate)
      ? WORKQUEUE_TABS.certificate
      : window.location.href.includes(WORKQUEUE_TABS.declarationForms)
      ? WORKQUEUE_TABS.declarationForms
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
  goToPerformanceViewAction: goToPerformanceView,
  goToTeamViewAction: goToTeamView,
  redirectToAuthentication,
  goToSettings
})(injectIntl(withRouter(NavigationView)))
