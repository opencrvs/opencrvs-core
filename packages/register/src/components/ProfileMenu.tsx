import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  InjectedIntl
} from 'react-intl'
import { IToggleMenuItem, ToggleMenu } from '@opencrvs/components/lib/interface'
import {
  Settings,
  LogoutDark,
  ProfileIcon
} from '@opencrvs/components/lib/icons'
import { IStoreState } from 'src/store'
import { IUserDetails } from 'src/utils/userUtils'
import { getLanguage } from 'src/i18n/selectors'
import { getUserDetails } from 'src/profile/profileSelectors'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { LogoutConfirmation } from './LogoutConfirmation'
import { redirectToAuthentication } from 'src/profile/profileActions'

const UserName = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  height: 27px;
  line-height: 27px;
`

const UserRole = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  font-size: 12px;
  height: 24px;
  line-height: 150%;
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

const messages = defineMessages({
  settings: {
    id: 'menu.items.settings',
    defaultMessage: 'Settings',
    description: 'Menu item settings'
  },
  logout: {
    id: 'menu.items.logout',
    defaultMessage: 'Log out',
    description: 'Menu item logout'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  }
})

interface IProps {
  language: string
  userDetails: IUserDetails
  redirectToAuthentication: typeof redirectToAuthentication
}

interface IState {
  showLogoutModal: boolean
}

type FullProps = IProps & InjectedIntlProps

class ProfileMenuComponent extends React.Component<FullProps, IState> {
  constructor(props: FullProps & IState) {
    super(props)
    this.state = {
      showLogoutModal: false
    }
  }

  toggleLogoutModal = () => {
    this.setState(state => ({
      showLogoutModal: !state.showLogoutModal
    }))
  }

  getMenuItems = (intl: InjectedIntl): IToggleMenuItem[] => {
    const items = [] as IToggleMenuItem[]
    items.push({
      icon: <Settings />,
      label: intl.formatMessage(messages.settings),
      handler: () => alert('Settings')
    })
    items.push({
      icon: <LogoutDark />,
      label: intl.formatMessage(messages.logout),
      handler: () => {
        this.toggleLogoutModal()
      }
    })
    return items
  }

  getMenuHeader = (
    intl: InjectedIntl,
    language: string,
    userDetails: IUserDetails
  ): JSX.Element => {
    let userName
    let userRole

    if (userDetails) {
      const nameObj =
        userDetails.name &&
        (userDetails.name.find(
          (storedName: GQLHumanName) => storedName.use === language
        ) as GQLHumanName)
      userName =
        nameObj && `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      userRole =
        userDetails.role &&
        intl.formatMessage(messages[userDetails.role as string])
    } else {
      userName = ''
      userRole = ''
    }

    return (
      <>
        <UserName>{userName}</UserName>
        <UserRole>{userRole}</UserRole>
      </>
    )
  }

  render() {
    const { intl, language, userDetails } = this.props

    return (
      <>
        <ToggleMenu
          id="ProfileMenu"
          toggleButton={<ProfileIcon />}
          menuHeader={this.getMenuHeader(intl, language, userDetails)}
          menuItems={this.getMenuItems(intl)}
        />

        <LogoutConfirmation
          show={this.state.showLogoutModal}
          handleClose={this.toggleLogoutModal}
          handleYes={this.props.redirectToAuthentication}
        />
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

export const ProfileMenu = connect(
  mapStateToProps,
  {
    redirectToAuthentication
  }
)(injectIntl(ProfileMenuComponent))
