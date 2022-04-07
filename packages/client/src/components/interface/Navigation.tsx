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
  goToFieldAgentHomeTab as goToFieldAgentHomeTabAction,
  goToRegistrarHomeTab,
  goToCertificateConfig,
  goToSettings,
  goToPerformanceView,
  goToTeamView,
  goToApplicationConfig
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { COUNT_USER_WISE_DECLARATIONS } from '@client/search/queries'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import { EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'
import { Activity, Avatar, Users } from '@opencrvs/components/lib/icons'
import { SettingsNavigation } from '@opencrvs/components/lib/icons/SettingsNavigation'
import { LogoutNavigation } from '@opencrvs/components/lib/icons/LogoutNavigation'
import { Configuration } from '@opencrvs/components/lib/icons/Configuration'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { ITheme, withTheme } from '@client/styledComponents'
import { Query } from '@client/components/Query'
import { RouteComponentProps, withRouter } from 'react-router'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { navigationMessages } from '@client/i18n/messages/views/navigation'

const SCREEN_LOCK = 'screenLock'

type Keys = keyof typeof WORKQUEUE_TAB
export type IWORKQUEUE_TAB = typeof WORKQUEUE_TAB[Keys]

export const WORKQUEUE_TAB = {
  inProgress: 'progress',
  sentForReview: 'sentForReview',
  requiresUpdate: 'requiresUpdate',
  readyForReview: 'readyForReview',
  sentForUpdates: 'sentForUpdates',
  sentForApproval: 'approvals',
  readyToPrint: 'print',
  externalValidation: 'waitingValidation',
  performance: 'performance',
  team: 'team',
  config: 'config',
  application: 'application',
  certificates: 'certificates',
  settings: 'settings',
  logout: 'logout'
}

const GROUP_ID = {
  declarationGroup: 'declarationGroup',
  menuGroup: 'menuGroup'
}

interface IUSER_SCOPE {
  [key: string]: string[]
}

const USER_SCOPE: IUSER_SCOPE = {
  FIELD_AGENT: [
    WORKQUEUE_TAB.inProgress,
    WORKQUEUE_TAB.sentForReview,
    WORKQUEUE_TAB.requiresUpdate,
    GROUP_ID.declarationGroup
  ],
  REGISTRATION_AGENT: [
    WORKQUEUE_TAB.inProgress,
    WORKQUEUE_TAB.readyForReview,
    WORKQUEUE_TAB.sentForUpdates,
    WORKQUEUE_TAB.sentForApproval,
    WORKQUEUE_TAB.readyToPrint,
    WORKQUEUE_TAB.performance,
    WORKQUEUE_TAB.team,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  DISTRICT_REGISTRAR: [
    WORKQUEUE_TAB.inProgress,
    WORKQUEUE_TAB.readyForReview,
    WORKQUEUE_TAB.sentForUpdates,
    WORKQUEUE_TAB.readyToPrint,
    WORKQUEUE_TAB.performance,
    WORKQUEUE_TAB.team,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_REGISTRAR: [
    WORKQUEUE_TAB.inProgress,
    WORKQUEUE_TAB.readyForReview,
    WORKQUEUE_TAB.sentForUpdates,
    WORKQUEUE_TAB.readyToPrint,
    WORKQUEUE_TAB.performance,
    WORKQUEUE_TAB.team,
    GROUP_ID.declarationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_SYSTEM_ADMIN: [
    WORKQUEUE_TAB.performance,
    WORKQUEUE_TAB.team,
    GROUP_ID.menuGroup
  ],
  NATIONAL_SYSTEM_ADMIN: [
    WORKQUEUE_TAB.performance,
    WORKQUEUE_TAB.team,
    WORKQUEUE_TAB.config,
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
}

interface IDispatchProps {
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  goToCertificateConfigAction: typeof goToCertificateConfig
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
  IntlShapeProps & { theme: ITheme } & RouteComponentProps<{ tabId: string }>

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
        id={`navigation_${WORKQUEUE_TAB.settings}`}
        label={intl.formatMessage(buttonMessages[WORKQUEUE_TAB.settings])}
        onClick={() => {
          goToSettings()
          menuCollapse && menuCollapse()
        }}
        isSelected={activeMenuItem === WORKQUEUE_TAB.settings}
      />
      <NavigationItem
        icon={() => <LogoutNavigation />}
        id={`navigation_${WORKQUEUE_TAB.logout}`}
        label={intl.formatMessage(buttonMessages[WORKQUEUE_TAB.logout])}
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
    goToApplicationConfigAction,
    navigationWidth,
    workqueue,
    storedDeclarations,
    draftDeclarations,
    theme,
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
  const configTab = [WORKQUEUE_TAB.application, WORKQUEUE_TAB.certificates]
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
        (filteredData.inProgressTab.totalItems || 0) +
        (filteredData.notificationTab.totalItems || 0),
    readyForReview: !initialSyncDone ? 0 : filteredData.reviewTab.totalItems,
    sentForUpdates: !initialSyncDone ? 0 : filteredData.rejectTab.totalItems,
    sentForApproval: !initialSyncDone ? 0 : filteredData.approvalTab.totalItems,
    externalValidation:
      window.config.EXTERNAL_VALIDATION_WORKQUEUE && !initialSyncDone
        ? 0
        : filteredData.externalValidationTab.totalItems,
    readyToPrint: !initialSyncDone ? 0 : filteredData.printTab.totalItems
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
              id={`navigation_${WORKQUEUE_TAB.inProgress}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TAB.inProgress]
              )}
              count={props.draftDeclarations.length}
              isSelected={tabId === WORKQUEUE_TAB.inProgress}
              onClick={() => {
                props.goToFieldAgentHomeTab(WORKQUEUE_TAB.inProgress)
                menuCollapse && menuCollapse()
              }}
            />
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'orange'} />}
              id={`navigation_${WORKQUEUE_TAB.sentForReview}`}
              label={intl.formatMessage(
                navigationMessages[WORKQUEUE_TAB.sentForReview]
              )}
              count={props.declarationsReadyToSend.length}
              isSelected={tabId === WORKQUEUE_TAB.sentForReview}
              onClick={() => {
                props.goToFieldAgentHomeTab(WORKQUEUE_TAB.sentForReview)
                menuCollapse && menuCollapse()
              }}
            />
            <Query
              query={COUNT_USER_WISE_DECLARATIONS}
              variables={{
                userId: userDetails ? userDetails.practitionerId : '',
                status: [EVENT_STATUS.REJECTED],
                locationIds: fieldAgentLocationId ? [fieldAgentLocationId] : []
              }}
            >
              {({
                loading,
                error,
                data
              }: {
                loading: any
                data?: any
                error?: any
              }) => {
                if (loading) {
                  return (
                    <NavigationItem
                      icon={() => <DeclarationIconSmall color={'red'} />}
                      id={`navigation_${WORKQUEUE_TAB.requiresUpdate}_loading`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.requiresUpdate]
                      )}
                      count={0}
                      isSelected={tabId === WORKQUEUE_TAB.requiresUpdate}
                      onClick={() => {
                        props.goToFieldAgentHomeTab(
                          WORKQUEUE_TAB.requiresUpdate
                        )
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )
                }
                return (
                  <>
                    <NavigationItem
                      icon={() => <DeclarationIconSmall color={'red'} />}
                      id={`navigation_${WORKQUEUE_TAB.requiresUpdate}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.requiresUpdate]
                      )}
                      count={data.searchEvents.totalItems}
                      isSelected={tabId === WORKQUEUE_TAB.requiresUpdate}
                      onClick={() => {
                        props.goToFieldAgentHomeTab(
                          WORKQUEUE_TAB.requiresUpdate
                        )
                        menuCollapse && menuCollapse()
                      }}
                    />
                  </>
                )
              }}
            </Query>
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
                    WORKQUEUE_TAB.inProgress
                  ) && (
                    <NavigationItem
                      icon={() => <DeclarationIconSmall color={'purple'} />}
                      id={`navigation_${WORKQUEUE_TAB.inProgress}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.inProgress]
                      )}
                      count={declarationCount.inProgress}
                      isSelected={tabId === WORKQUEUE_TAB.inProgress}
                      onClick={() => {
                        props.goToRegistrarHomeTab(WORKQUEUE_TAB.inProgress)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TAB.readyForReview
                  ) && (
                    <NavigationItem
                      icon={() => <DeclarationIconSmall color={'orange'} />}
                      id={`navigation_${WORKQUEUE_TAB.readyForReview}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.readyForReview]
                      )}
                      count={declarationCount.readyForReview}
                      isSelected={tabId === WORKQUEUE_TAB.readyForReview}
                      onClick={() => {
                        props.goToRegistrarHomeTab(WORKQUEUE_TAB.readyForReview)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TAB.sentForUpdates
                  ) && (
                    <NavigationItem
                      icon={() => <DeclarationIconSmall color={'red'} />}
                      id={`navigation_${WORKQUEUE_TAB.sentForUpdates}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.sentForUpdates]
                      )}
                      count={declarationCount.sentForUpdates}
                      isSelected={tabId === WORKQUEUE_TAB.sentForUpdates}
                      onClick={() => {
                        props.goToRegistrarHomeTab(WORKQUEUE_TAB.sentForUpdates)
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TAB.sentForApproval
                  ) && (
                    <NavigationItem
                      icon={() => <DeclarationIconSmall color={'grey'} />}
                      id={`navigation_${WORKQUEUE_TAB.sentForApproval}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.sentForApproval]
                      )}
                      count={declarationCount.sentForApproval}
                      isSelected={tabId === WORKQUEUE_TAB.sentForApproval}
                      onClick={() => {
                        props.goToRegistrarHomeTab(
                          WORKQUEUE_TAB.sentForApproval
                        )
                        menuCollapse && menuCollapse()
                      }}
                    />
                  )}
                {window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
                  <NavigationItem
                    icon={() => <DeclarationIconSmall color={'teal'} />}
                    id={`navigation_${WORKQUEUE_TAB.externalValidation}`}
                    label={intl.formatMessage(
                      navigationMessages[WORKQUEUE_TAB.externalValidation]
                    )}
                    count={declarationCount.externalValidation}
                    isSelected={tabId === WORKQUEUE_TAB.externalValidation}
                    onClick={() => {
                      props.goToRegistrarHomeTab(
                        WORKQUEUE_TAB.externalValidation
                      )
                      menuCollapse && menuCollapse()
                    }}
                  />
                )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TAB.readyToPrint
                  ) && (
                    <NavigationItem
                      icon={() => <DeclarationIconSmall color={'green'} />}
                      id={`navigation_${WORKQUEUE_TAB.readyToPrint}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.readyToPrint]
                      )}
                      count={declarationCount.readyToPrint}
                      isSelected={tabId === WORKQUEUE_TAB.readyToPrint}
                      onClick={() => {
                        props.goToRegistrarHomeTab(WORKQUEUE_TAB.readyToPrint)
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
                    WORKQUEUE_TAB.performance
                  ) && (
                    <NavigationItem
                      icon={() => <Activity />}
                      id={`navigation_${WORKQUEUE_TAB.performance}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.performance]
                      )}
                      onClick={() =>
                        props.goToPerformanceViewAction(userDetails)
                      }
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TAB.performance
                      }
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(WORKQUEUE_TAB.team) && (
                    <NavigationItem
                      icon={() => <Users />}
                      id={`navigation_${WORKQUEUE_TAB.team}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TAB.team]
                      )}
                      onClick={() => props.goToTeamViewAction(userDetails)}
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TAB.team
                      }
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TAB.config
                  ) && (
                    <>
                      <NavigationItem
                        icon={() => <Configuration />}
                        id={`navigation_${WORKQUEUE_TAB.config}_main`}
                        label={intl.formatMessage(
                          navigationMessages[WORKQUEUE_TAB.config]
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
                              navigationMessages[WORKQUEUE_TAB.application]
                            )}
                            id={`navigation_${WORKQUEUE_TAB.application}`}
                            onClick={goToApplicationConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === WORKQUEUE_TAB.application
                            }
                          />
                          <NavigationSubItem
                            label={intl.formatMessage(
                              navigationMessages[WORKQUEUE_TAB.certificates]
                            )}
                            id={`navigation_${WORKQUEUE_TAB.certificates}`}
                            onClick={goToCertificateConfigAction}
                            isSelected={
                              enableMenuSelection &&
                              activeMenuItem === WORKQUEUE_TAB.certificates
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
    activeMenuItem: window.location.href.includes('performance')
      ? WORKQUEUE_TAB.performance
      : window.location.href.includes('team')
      ? WORKQUEUE_TAB.team
      : window.location.href.includes('application')
      ? WORKQUEUE_TAB.application
      : window.location.href.includes('settings')
      ? WORKQUEUE_TAB.settings
      : window.location.href.includes('certificate')
      ? WORKQUEUE_TAB.certificates
      : ''
  }
}

export const Navigation = connect<
  IStateProps,
  IDispatchProps,
  IProps,
  IStoreState
>(mapStateToProps, {
  goToFieldAgentHomeTab: goToFieldAgentHomeTabAction,
  goToRegistrarHomeTab,
  goToCertificateConfigAction: goToCertificateConfig,
  goToApplicationConfigAction: goToApplicationConfig,
  goToPerformanceViewAction: goToPerformanceView,
  goToTeamViewAction: goToTeamView,
  redirectToAuthentication,
  goToSettings
})(injectIntl(withTheme(withRouter(NavigationView))))
