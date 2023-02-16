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
import { SideNav } from '@opencrvs/components/lib/SideNav'
import { NavigationGroup } from '@opencrvs/components/lib/SideNav/NavigationGroup'
import { NavigationGroupTitle } from '@opencrvs/components/lib/SideNav/NavigationGroupTitle'
import { NavigationItem } from '@opencrvs/components/lib/SideNav/NavigationItem'
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
  goToOrganisationView,
  goToInformantNotification
} from '@client/navigation'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
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
  organisation: 'organisation',
  team: 'team',
  config: 'config',
  application: 'application',
  certificate: 'certificate',
  systems: 'integration',
  settings: 'settings',
  logout: 'logout',
  declarationForms: 'form',
  communications: 'communications',
  informantNotification: 'informantnotification'
} as const

const GROUP_ID = {
  declarationGroup: 'declarationGroup',
  performanceGroup: 'performanceGroup',
  organisationGroup: 'organisationGroup',
  configurationGroup: 'configurationGroup',
  commsGroup: 'commsGroup',
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
    GROUP_ID.declarationGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organisationGroup,
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
    GROUP_ID.declarationGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organisationGroup,
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
    GROUP_ID.declarationGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organisationGroup,
    GROUP_ID.menuGroup
  ],
  NATIONAL_REGISTRAR: [
    WORKQUEUE_TABS.inProgress,
    WORKQUEUE_TABS.readyForReview,
    WORKQUEUE_TABS.requiresUpdate,
    WORKQUEUE_TABS.readyToPrint,
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.vsexports,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.outbox,
    GROUP_ID.declarationGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.organisationGroup,
    GROUP_ID.menuGroup
  ],
  LOCAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    GROUP_ID.performanceGroup,
    GROUP_ID.organisationGroup,
    GROUP_ID.menuGroup
  ],
  NATIONAL_SYSTEM_ADMIN: [
    WORKQUEUE_TABS.performance,
    WORKQUEUE_TABS.organisation,
    WORKQUEUE_TABS.team,
    WORKQUEUE_TABS.config,
    WORKQUEUE_TABS.vsexports,
    GROUP_ID.organisationGroup,
    GROUP_ID.performanceGroup,
    GROUP_ID.configurationGroup,
    GROUP_ID.commsGroup,
    GROUP_ID.menuGroup
  ],
  PERFORMANCE_MANAGEMENT: [
    WORKQUEUE_TABS.performance,
    GROUP_ID.menuGroup,
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
  goToOrganisationViewAction: typeof goToOrganisationView
  goToInformantNotification: typeof goToInformantNotification
  goToTeamViewAction: typeof goToTeamView
  goToSystemViewAction: typeof goToSystemList
  goToSettings: typeof goToSettings
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
    goToInformantNotification,
    navigationWidth,
    workqueue,
    storedDeclarations,
    draftDeclarations,
    menuCollapse,
    userInfo,
    offlineCountryConfiguration,
    updateRegistrarWorkqueue,
    setAdvancedSearchParam,
    className
  } = props
  const tabId = deselectAllTabs
    ? ''
    : match.params.tabId
    ? match.params.tabId
    : activeMenuItem
    ? activeMenuItem
    : 'review'

  const [isNewDeclarationExpanded, setIsNewDeclarationExpanded] =
    React.useState(true)
  const [isRecordExpanded, setIsRecordExpanded] = React.useState(true)
  const [isPerformanceExpanded, setIsPerformanceExpanded] = React.useState(true)
  const [isOrganisationExpanded, setIsOrganisationExpanded] =
    React.useState(true)
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(true)
  const [isCommsExpanded, setIsCommsExpanded] = React.useState(true)

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
    <SideNav
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
      {/* NEW EVENT*/}

      <NavigationGroup>
        <NavigationGroupTitle
          label="NEW EVENT"
          onClick={() => setIsNewDeclarationExpanded(!isNewDeclarationExpanded)}
          expandableIcon={() =>
            isNewDeclarationExpanded ? (
              <Expandable selected={true} />
            ) : (
              <Expandable />
            )
          }
        />
        {isNewDeclarationExpanded && (
          <>
            <NavigationItem
              icon={() => (
                <Icon color="currentColor" name="Plus" size="small" />
              )}
              id={''}
              label="Birth"
              isSelected={''}
              onClick={''}
            />
            <NavigationItem
              icon={() => (
                <Icon color="currentColor" name="Plus" size="small" />
              )}
              id={''}
              label="Death"
              isSelected={''}
              onClick={''}
            />
            <NavigationItem
              icon={() => (
                <Icon color="currentColor" name="Plus" size="small" />
              )}
              id={''}
              label="Marriage"
              isSelected={''}
              onClick={''}
            />
            <NavigationItem
              icon={() => (
                <Icon color="currentColor" name="Plus" size="small" />
              )}
              id={''}
              label="Divorce"
              isSelected={''}
              onClick={''}
            />
            <NavigationItem
              icon={() => (
                <Icon color="currentColor" name="Plus" size="small" />
              )}
              id={''}
              label="Adoption (Coming soon)"
              isSelected={''}
              onClick={''}
            />
          </>
        )}
      </NavigationGroup>

      {/* RECORDS MENU*/}

      {userDetails?.role &&
        USER_SCOPE[userDetails.role].includes(GROUP_ID.declarationGroup) && (
          <NavigationGroup>
            <NavigationGroupTitle
              label="RECORDS"
              onClick={() => setIsRecordExpanded(!isRecordExpanded)}
              expandableIcon={() =>
                isRecordExpanded ? (
                  <Expandable selected={true} />
                ) : (
                  <Expandable />
                )
              }
            />
            {isRecordExpanded && (
              <>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.outbox
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <Icon color="currentColor" name="Send" size="small" />
                      )}
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
                    WORKQUEUE_TABS.sentForReview
                  ) && (
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
                {userDetails?.searches && userDetails?.searches.length > 0 ? (
                  userDetails?.searches.map((bookmarkResult, index) => {
                    return (
                      <NavigationItem
                        icon={() => (
                          <Icon
                            size={'small'}
                            name={'Star'}
                            color={'yellow'}
                            fill={'yellow'}
                          ></Icon>
                        )}
                        id={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
                        label={bookmarkResult.name}
                        disabled={
                          advancedSearchParams.searchId ===
                            bookmarkResult.searchId &&
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
                          advancedSearchParams.searchId ===
                            bookmarkResult.searchId &&
                          props.location.pathname === ADVANCED_SEARCH_RESULT
                        }
                      />
                    )
                  })
                ) : (
                  <></>
                )}
              </>
            )}
          </NavigationGroup>
        )}

      {/* PERFORMANCE MENU*/}

      {userDetails?.role &&
        USER_SCOPE[userDetails.role].includes(GROUP_ID.performanceGroup) && (
          <NavigationGroup>
            <NavigationGroupTitle
              label="ANALYTICS"
              onClick={() => setIsPerformanceExpanded(!isPerformanceExpanded)}
              expandableIcon={() =>
                isPerformanceExpanded ? (
                  <Expandable selected={true} />
                ) : (
                  <Expandable />
                )
              }
            />

            {isPerformanceExpanded && (
              <>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.performance
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <Icon
                          color="currentColor"
                          name="Activity"
                          size="small"
                        />
                      )}
                      id={`navigation_${WORKQUEUE_TABS.performance}`}
                      label="Dashboard"
                      onClick={() => {
                        props.goToPerformanceViewAction(userDetails)
                        menuCollapse && menuCollapse()
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
                      icon={() => (
                        <Icon color="currentColor" name="Share" size="small" />
                      )}
                      id={`navigation_${WORKQUEUE_TABS.vsexports}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TABS.vsexports]
                      )}
                      onClick={() => {
                        goToVSExportsAction()
                        menuCollapse && menuCollapse()
                      }}
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TABS.vsexports
                      }
                    />
                  )}
              </>
            )}
          </NavigationGroup>
        )}

      {/* ORGANISATION MENU*/}

      {userDetails?.role &&
        USER_SCOPE[userDetails.role].includes(GROUP_ID.organisationGroup) && (
          <NavigationGroup>
            <NavigationGroupTitle
              label="ORGANISATION"
              onClick={() => setIsOrganisationExpanded(!isOrganisationExpanded)}
              expandableIcon={() =>
                isOrganisationExpanded ? (
                  <Expandable selected={true} />
                ) : (
                  <Expandable />
                )
              }
            />

            {isOrganisationExpanded && (
              <>
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.organisation
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <Icon color="currentColor" name="List" size="small" />
                      )}
                      id={`navigation_${WORKQUEUE_TABS.organisation}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TABS.organisation]
                      )}
                      onClick={() => {
                        props.goToOrganisationViewAction(userDetails)
                        menuCollapse && menuCollapse()
                      }}
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TABS.organisation
                      }
                    />
                  )}
                {userDetails?.role &&
                  USER_SCOPE[userDetails.role].includes(
                    WORKQUEUE_TABS.team
                  ) && (
                    <NavigationItem
                      icon={() => (
                        <Icon color="currentColor" name="Home" size="small" />
                      )}
                      id={`navigation_${WORKQUEUE_TABS.team}`}
                      label={intl.formatMessage(
                        navigationMessages[WORKQUEUE_TABS.team]
                      )}
                      onClick={() => {
                        props.goToTeamViewAction(userDetails)
                        menuCollapse && menuCollapse()
                      }}
                      isSelected={
                        enableMenuSelection &&
                        activeMenuItem === WORKQUEUE_TABS.team
                      }
                    />
                  )}
              </>
            )}
          </NavigationGroup>
        )}

      {/* CONFIGURATION MENU*/}

      {userDetails?.role &&
        USER_SCOPE[userDetails.role].includes(GROUP_ID.configurationGroup) && (
          <NavigationGroup>
            <NavigationGroupTitle
              label="CONFIGURATION"
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              expandableIcon={() =>
                isConfigExpanded ? (
                  <Expandable selected={true} />
                ) : (
                  <Expandable />
                )
              }
            />
            {isConfigExpanded && (
              <>
                <NavigationItem
                  icon={() => (
                    <Icon color="currentColor" name="Compass" size="small" />
                  )}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.application]
                  )}
                  id={`navigation_${WORKQUEUE_TABS.application}`}
                  onClick={() => {
                    goToApplicationConfigAction()
                    menuCollapse && menuCollapse()
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.application
                  }
                />
                <NavigationItem
                  icon={() => (
                    <Icon color="currentColor" name="Award" size="small" />
                  )}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.certificate]
                  )}
                  id={`navigation_${WORKQUEUE_TABS.certificate}`}
                  onClick={() => {
                    goToCertificateConfigAction()
                    menuCollapse && menuCollapse()
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.certificate
                  }
                />
                <NavigationItem
                  icon={() => (
                    <Icon color="currentColor" name="Edit3" size="small" />
                  )}
                  id={`navigation_${WORKQUEUE_TABS.declarationForms}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.declarationForms]
                  )}
                  onClick={() => {
                    goToFormConfigAction()
                    menuCollapse && menuCollapse()
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.declarationForms
                  }
                />
                <NavigationItem
                  icon={() => (
                    <Icon color="currentColor" name="Link" size="small" />
                  )}
                  id={`navigation_${WORKQUEUE_TABS.systems}`}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.systems]
                  )}
                  onClick={() => {
                    goToSystemViewAction()
                    menuCollapse && menuCollapse()
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.systems
                  }
                />
              </>
            )}
          </NavigationGroup>
        )}

      {/* COMMS MENU */}

      {userDetails?.role &&
        USER_SCOPE[userDetails.role].includes(GROUP_ID.commsGroup) && (
          <NavigationGroup>
            <NavigationGroupTitle
              label="COMMS"
              onClick={() => setIsCommsExpanded(!isCommsExpanded)}
              expandableIcon={() =>
                isCommsExpanded ? (
                  <Expandable selected={true} />
                ) : (
                  <Expandable />
                )
              }
            />
            {isCommsExpanded && (
              <>
                <NavigationItem
                  icon={() => (
                    <Icon color="currentColor" name="Compass" size="small" />
                  )}
                  label={intl.formatMessage(
                    navigationMessages[WORKQUEUE_TABS.informantNotification]
                  )}
                  id={`navigation_${WORKQUEUE_TABS.informantNotification}`}
                  onClick={() => {
                    goToInformantNotification()
                    menuCollapse && menuCollapse()
                  }}
                  isSelected={
                    enableMenuSelection &&
                    activeMenuItem === WORKQUEUE_TABS.informantNotification
                  }
                />
              </>
            )}
          </NavigationGroup>
        )}

      {/* SETTING AND LOGOUT MOBILE MENU */}

      <NavigationGroup>
        {menuCollapse && getSettingsAndLogout(props)}
      </NavigationGroup>
    </SideNav>
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
      : window.location.href.includes(WORKQUEUE_TABS.organisation)
      ? WORKQUEUE_TABS.organisation
      : window.location.href.includes(WORKQUEUE_TABS.informantNotification)
      ? WORKQUEUE_TABS.informantNotification
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
  goToOrganisationViewAction: goToOrganisationView,
  goToTeamViewAction: goToTeamView,
  goToSystemViewAction: goToSystemList,
  redirectToAuthentication,
  goToSettings,
  goToInformantNotification,
  updateRegistrarWorkqueue,
  setAdvancedSearchParam
})(injectIntl(withRouter(NavigationView)))

/** @deprecated since the introduction of `<Frame>` */
export const FixedNavigation = styled(Navigation)`
  position: fixed;
`
