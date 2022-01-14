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
import { IApplication, SUBMISSION_STATUS } from '@client/applications'
import { IStoreState } from '@opencrvs/client/src/store'
import { LeftNavigationApplicationIcons } from '@opencrvs/components/lib/icons/LeftNavigationApplicationIcons'
import { LeftNavigation } from '@opencrvs/components/lib/interface/Navigation/LeftNavigation'
import { NavigationGroup } from '@opencrvs/components/lib/interface/Navigation/NavigationGroup'
import { NavigationItem } from '@opencrvs/components/lib/interface/Navigation/NavigationItem'
import { NavigationSubItem } from '@opencrvs/components/lib/interface/Navigation/NavigationSubItem'
import { connect } from 'react-redux'
import {
  goToFieldAgentHomeTab as goToFieldAgentHomeTabAction,
  goToRegistrarHomeTab,
  goToConfig,
  goToOperationalReport,
  goToPerformanceHome,
  goToTeamSearch,
  goToTeamUserList
} from '@client/navigation'
import { NATL_ADMIN_ROLES } from '@client/utils/constants'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { Activity, Users } from '@opencrvs/components/lib/icons'
import { Configuration } from '@opencrvs/components/lib/icons/Configuration'
import { Expandable } from '@opencrvs/components/lib/icons/Expandable'
import { getJurisdictionLocationIdFromUserDetails } from '@client/views/SysAdmin/Performance/utils'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages } from '@client/i18n/messages'

const USER_SCOPE = {
  FIELD_AGENT: 'FIELD_AGENT',
  REGISTRATION_AGENT: 'REGISTRATION_AGENT',
  LOCAL_REGISTRAR: 'LOCAL_REGISTRAR',
  LOCAL_SYSTEM_ADMIN: 'LOCAL_SYSTEM_ADMIN',
  NATIONAL_SYSTEM_ADMIN: 'NATIONAL_SYSTEM_ADMIN'
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

interface IProps {
  data?: any
  tabId?: string
  userScope?: string
  count?: ICount
  enableMenuSelection?: boolean
}

interface IDispatchProps {
  goToFieldAgentHomeTab: typeof goToFieldAgentHomeTabAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  goToConfigAction: typeof goToConfig
  goToPerformanceHomeAction: typeof goToPerformanceHome
  goToOperationalReportAction: typeof goToOperationalReport
  goToTeamSearchAction: typeof goToTeamSearch
  goToTeamUserListAction: typeof goToTeamUserList
}

interface IStateProps {
  draftApplications: IApplication[]
  applicationsReadyToSend: IApplication[]
  userDetails: IUserDetails | null
  activeMenuItem: string
}

type IFullProps = IProps & IStateProps & IDispatchProps & IntlShapeProps

const TAB_ID = {
  inProgress: 'progress',
  sentForReview: 'review',
  requireUpdates: 'updates',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  sentForApproval: 'approvals',
  readyToPrint: 'print',
  externalValidation: 'waitingValidation',
  application: 'application',
  performance: 'performance',
  team: 'team',
  config: 'config',
  certificates: 'certificates',
  settings: 'settings'
}

const TAB_LABEL = {
  inProgress: 'In Progress',
  readyForReview: 'Ready for review',
  sentForReview: 'Sent for review',
  requiresUpdate: 'Requires Updates',
  sentForUpdates: 'Sent for updates',
  sentForApproval: 'Sent for approval',
  externalValidation: 'In external Validation',
  readyToPrint: 'Ready to print ',
  application: 'Application',
  performance: 'Performance',
  team: 'Team',
  configuration: 'Configuration',
  certificatesConfiguration: 'Certificates',
  applicationSettings: 'Application Settings'
}

const goToPerformanceView = (props: IFullProps) => {
  const {
    userDetails,
    goToPerformanceHomeAction,
    goToOperationalReportAction
  } = props

  if (userDetails && userDetails.role) {
    if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
      return goToPerformanceHomeAction()
    } else {
      const locationId = getJurisdictionLocationIdFromUserDetails(userDetails)
      return (
        (locationId && goToOperationalReportAction(locationId)) ||
        goToPerformanceHomeAction()
      )
    }
  }
}

const goToTeamView = (props: IFullProps) => {
  const { userDetails, goToTeamUserListAction, goToTeamSearchAction } = props
  if (userDetails && userDetails.role) {
    if (NATL_ADMIN_ROLES.includes(userDetails.role)) {
      return goToTeamSearchAction()
    } else {
      return goToTeamUserListAction(
        {
          id: (userDetails.primaryOffice && userDetails.primaryOffice.id) || '',
          searchableText:
            (userDetails.primaryOffice && userDetails.primaryOffice.name) || '',
          displayLabel:
            (userDetails.primaryOffice && userDetails.primaryOffice.name) || ''
        },
        true
      )
    }
  }
}

export const NavigationView = (props: IFullProps) => {
  const {
    tabId,
    intl,
    count,
    userDetails,
    enableMenuSelection = true,
    activeMenuItem,
    goToConfigAction
  } = props
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(false)
  return (
    <LeftNavigation
      applicationName={intl.formatMessage(constantsMessages.applicationName)}
    >
      {(userDetails?.role === USER_SCOPE.FIELD_AGENT ||
        userDetails?.role === USER_SCOPE.REGISTRATION_AGENT ||
        userDetails?.role === USER_SCOPE.LOCAL_REGISTRAR) && (
        <NavigationGroup>
          <NavigationItem
            icon={() => <LeftNavigationApplicationIcons />}
            label={TAB_LABEL.inProgress}
            count={count && count.inProgress}
            isSelected={tabId === TAB_ID.inProgress}
            onClick={() =>
              userDetails?.role === USER_SCOPE.FIELD_AGENT
                ? props.goToFieldAgentHomeTab(TAB_ID.inProgress)
                : props.goToRegistrarHomeTab(TAB_ID.inProgress)
            }
          />
          {userDetails?.role === USER_SCOPE.FIELD_AGENT && (
            <NavigationItem
              icon={() => <LeftNavigationApplicationIcons color={'orange'} />}
              label={TAB_LABEL.sentForReview}
              count={count && count.sentForReview}
              isSelected={tabId === TAB_ID.sentForReview}
              onClick={() => props.goToFieldAgentHomeTab(TAB_ID.sentForReview)}
            />
          )}
          {userDetails?.role !== USER_SCOPE.FIELD_AGENT && (
            <NavigationItem
              icon={() => <LeftNavigationApplicationIcons color={'orange'} />}
              label={TAB_LABEL.readyForReview}
              count={count && count.readyForReview}
              isSelected={tabId === TAB_ID.readyForReview}
              onClick={() => props.goToRegistrarHomeTab(TAB_ID.readyForReview)}
            />
          )}
          {userDetails?.role === USER_SCOPE.FIELD_AGENT && (
            <NavigationItem
              icon={() => <LeftNavigationApplicationIcons color={'red'} />}
              label={TAB_LABEL.requiresUpdate}
              count={count && count.requiresUpdate}
              isSelected={tabId === TAB_ID.requireUpdates}
              onClick={() => props.goToFieldAgentHomeTab(TAB_ID.requireUpdates)}
            />
          )}
          {userDetails?.role !== USER_SCOPE.FIELD_AGENT && (
            <>
              <NavigationItem
                icon={() => <LeftNavigationApplicationIcons color={'red'} />}
                label={TAB_LABEL.sentForUpdates}
                count={count && count.sentForUpdates}
                isSelected={tabId === TAB_ID.sentForUpdates}
                onClick={() =>
                  props.goToRegistrarHomeTab(TAB_ID.sentForUpdates)
                }
              />
              {userDetails?.role === USER_SCOPE.REGISTRATION_AGENT && (
                <NavigationItem
                  icon={() => <LeftNavigationApplicationIcons color={'grey'} />}
                  label={TAB_LABEL.sentForApproval}
                  count={count && count.sentForApproval}
                  isSelected={tabId === TAB_ID.sentForApproval}
                  onClick={() =>
                    props.goToRegistrarHomeTab(TAB_ID.sentForApproval)
                  }
                />
              )}
              {window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
                <NavigationItem
                  icon={() => <LeftNavigationApplicationIcons color={'teal'} />}
                  label={TAB_LABEL.externalValidation}
                  count={count && count.externalValidation}
                  isSelected={tabId === TAB_ID.externalValidation}
                  onClick={() =>
                    props.goToRegistrarHomeTab(TAB_ID.externalValidation)
                  }
                />
              )}
              <NavigationItem
                icon={() => <LeftNavigationApplicationIcons color={'green'} />}
                label={TAB_LABEL.readyToPrint}
                count={count && count.readyToPrint}
                isSelected={tabId === TAB_ID.readyToPrint}
                onClick={() => props.goToRegistrarHomeTab(TAB_ID.readyToPrint)}
              />
            </>
          )}
        </NavigationGroup>
      )}
      {userDetails?.role !== USER_SCOPE.FIELD_AGENT && (
        <NavigationGroup>
          <NavigationItem
            icon={() => <Activity stroke={'#595C5F'} height={15} width={15} />}
            label={TAB_LABEL.performance}
            onClick={() => goToPerformanceView(props)}
            isSelected={
              enableMenuSelection && activeMenuItem === TAB_ID.performance
            }
          />
          <NavigationItem
            icon={() => <Users stroke={'#595C5F'} height={15} width={15} />}
            label={TAB_LABEL.team}
            onClick={() => goToTeamView(props)}
            isSelected={enableMenuSelection && activeMenuItem === TAB_ID.team}
          />
          {userDetails?.role === USER_SCOPE.NATIONAL_SYSTEM_ADMIN && (
            <>
              <NavigationItem
                icon={() => <Configuration />}
                label={TAB_LABEL.configuration}
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                isSelected={
                  enableMenuSelection && activeMenuItem === TAB_ID.config
                }
                expandableIcon={() =>
                  isConfigExpanded || activeMenuItem === TAB_ID.config ? (
                    <Expandable selected={true} />
                  ) : (
                    <Expandable />
                  )
                }
              />
              {(isConfigExpanded || activeMenuItem === TAB_ID.config) && (
                <>
                  <NavigationSubItem
                    label={TAB_LABEL.certificatesConfiguration}
                    onClick={goToConfigAction}
                    isSelected={
                      enableMenuSelection && activeMenuItem === TAB_ID.config
                    }
                  />
                  <NavigationSubItem
                    label={TAB_LABEL.applicationSettings}
                    onClick={() => {}}
                    isSelected={
                      enableMenuSelection &&
                      activeMenuItem === TAB_ID.application
                    }
                  />
                </>
              )}
            </>
          )}
        </NavigationGroup>
      )}
    </LeftNavigation>
  )
}

const mapStateToProps: (state: IStoreState) => IStateProps = (state) => {
  return {
    draftApplications:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      [],
    applicationsReadyToSend: (
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus !==
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
    ).reverse(),
    userDetails: getUserDetails(state),
    activeMenuItem: window.location.href.includes('performance')
      ? TAB_ID.performance
      : window.location.href.includes('team')
      ? TAB_ID.team
      : window.location.href.includes('config')
      ? TAB_ID.config
      : window.location.href.includes('settings')
      ? TAB_ID.settings
      : window.location.href.includes('certificate')
      ? TAB_ID.certificates
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
  goToConfigAction: goToConfig,
  goToPerformanceHomeAction: goToPerformanceHome,
  goToOperationalReportAction: goToOperationalReport,
  goToTeamSearchAction: goToTeamSearch,
  goToTeamUserListAction: goToTeamUserList
})(injectIntl(NavigationView))
