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
import { Button } from '@opencrvs/components/lib/buttons'
import { TopBar } from '@opencrvs/components/lib/interface'
import { ITheme } from '@opencrvs/components/lib/theme'
import { Header } from '@client/components/interface/Header/Header'
import { getLanguage } from '@client/i18n/selectors'
import { goToSysAdminHomeTab as goToSysAdminHomeTabAction } from '@client/navigation'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled, { withTheme } from '@client/styledComponents'
import { SYS_ADMIN_ROLES } from '@client/utils/constants'
import { IUserDetails } from '@client/utils/userUtils'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { UserTab } from './user/userTab'
import { messages } from '@client/i18n/messages/views/sysAdmin'

const Tab = styled(Button)<{ active: boolean }>`
  color: ${({ theme }) => theme.colors.copy};
  outline: none;
  flex-shrink: 0;
  ${({ theme }) => theme.fonts.subtitleStyle};
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
  padding: 0 16px;
  & > div {
    padding: 0px 8px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 0 8px;
    & > div {
      padding: 0px 4px;
    }
  }
`

const TAB_ID = {
  overView: 'overview',
  offices: 'offices',
  users: 'users',
  devices: 'devices',
  network: 'network',
  config: 'config'
}

type IProps = {
  title: string
  language: string
  userDetails: IUserDetails | null
  theme: ITheme
  goToSysAdminHomeTab: typeof goToSysAdminHomeTabAction
}

interface IMatchParams {
  tabId: string
}

type IFulProps = IProps & IntlShapeProps & RouteComponentProps<IMatchParams>

class SysAdminHomeView extends React.Component<IFulProps> {
  render() {
    const { match, intl, goToSysAdminHomeTab, userDetails } = this.props
    const tabId = match.params.tabId || TAB_ID.users
    const role = userDetails && userDetails.role
    return (
      <>
        {role && SYS_ADMIN_ROLES.includes(role) && (
          <>
            <Header title={intl.formatMessage(messages.systemTitle)} />
            <TopBar>
              <Tab
                id={`tab_${TAB_ID.overView}`}
                key={TAB_ID.overView}
                active={tabId === TAB_ID.overView}
                onClick={() => goToSysAdminHomeTab(TAB_ID.overView)}
              >
                {intl.formatMessage(messages.overviewTab)}
              </Tab>
              <Tab
                id={`tab_${TAB_ID.offices}`}
                key={TAB_ID.offices}
                active={tabId === TAB_ID.offices}
                onClick={() => goToSysAdminHomeTab(TAB_ID.offices)}
              >
                {intl.formatMessage(messages.officesTab)}
              </Tab>
              <Tab
                id={`tab_${TAB_ID.users}`}
                key={TAB_ID.users}
                active={tabId === TAB_ID.users}
                onClick={() => goToSysAdminHomeTab(TAB_ID.users)}
              >
                {intl.formatMessage(messages.usersTab)}
              </Tab>
              <Tab
                id={`tab_${TAB_ID.devices}`}
                key={TAB_ID.devices}
                active={tabId === TAB_ID.devices}
                onClick={() => goToSysAdminHomeTab(TAB_ID.devices)}
              >
                {intl.formatMessage(messages.devicesTab)}
              </Tab>
              <Tab
                id={`tab_${TAB_ID.network}`}
                key={TAB_ID.network}
                active={tabId === TAB_ID.network}
                onClick={() => goToSysAdminHomeTab(TAB_ID.network)}
              >
                {intl.formatMessage(messages.networkTab)}
              </Tab>
              <Tab
                id={`tab_${TAB_ID.config}`}
                key={TAB_ID.config}
                active={tabId === TAB_ID.config}
                onClick={() => goToSysAdminHomeTab(TAB_ID.config)}
              >
                {intl.formatMessage(messages.configTab)}
              </Tab>
            </TopBar>

            {tabId === TAB_ID.users && <UserTab />}
          </>
        )}
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    userDetails: getUserDetails(store)
  }
}
export const SysAdminHome = connect(
  mapStateToProps,
  {
    goToSysAdminHomeTab: goToSysAdminHomeTabAction
  }
)(withTheme(injectIntl(SysAdminHomeView)))
