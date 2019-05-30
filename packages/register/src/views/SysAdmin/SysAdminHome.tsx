import * as React from 'react'
import { connect } from 'react-redux'
import { IUserDetails } from 'src/utils/userUtils'
import { IStoreState } from 'src/store'
import { getLanguage } from 'src/i18n/selectors'
import { getUserDetails } from 'src/profile/profileSelectors'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { Header } from 'src/components/interface/Header/Header'
import { TopBar } from '@opencrvs/components/lib/interface'
import { ITheme } from '@opencrvs/components/lib/theme'
import { withTheme } from 'styled-components'
import { Button } from '@opencrvs/components/lib/buttons'
import styled from 'src/styled-components'
import { RouteComponentProps } from 'react-router'
import { goToSysAdminHomeTab as goToSysAdminHomeTabAction } from 'src/navigation'
import { SYS_ADMIN_ROLE } from 'src/utils/constants'

const Tab = styled(Button).attrs<{ active: boolean }>({})`
  color: ${({ theme }) => theme.colors.copy};
  outline: none;
  ${({ theme }) => theme.fonts.subtitleStyle};
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
`

const messages = defineMessages({
  overviewTab: {
    id: 'register.sysAdminHome.overview',
    defaultMessage: 'Overview',
    description: 'The title of overview tab'
  },
  officesTab: {
    id: 'register.sysAdminHome.offices',
    defaultMessage: 'Offices',
    description: 'The title of offices tab'
  },
  usersTab: {
    id: 'register.sysAdminHome.users',
    defaultMessage: 'Users',
    description: 'The title of users tab'
  },
  devicesTab: {
    id: 'register.sysAdminHome.devices',
    defaultMessage: 'Devices',
    description: 'The title of devices tab'
  },
  networkTab: {
    id: 'register.sysAdminHome.network',
    defaultMessage: 'Network',
    description: 'The title of network tab'
  },
  configTab: {
    id: 'register.sysAdminHome.config',
    defaultMessage: 'Config',
    description: 'The title of config tab'
  }
})

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
  userDetails: IUserDetails
  theme: ITheme
  goToSysAdminHomeTab: typeof goToSysAdminHomeTabAction
}

interface IMatchParams {
  tabId: string
}

type IFulProps = IProps & InjectedIntlProps & RouteComponentProps<IMatchParams>

class SysAdminHomeView extends React.Component<IFulProps> {
  render() {
    const { match, intl, goToSysAdminHomeTab, userDetails } = this.props
    const tabId = match.params.tabId || TAB_ID.users
    const isSysadmin =
      userDetails && userDetails.name && userDetails.role === SYS_ADMIN_ROLE
    return (
      <>
        {isSysadmin && (
          <>
            <Header />
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
