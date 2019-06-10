import * as React from 'react'
import { connect } from 'react-redux'
import styled from '@register/styledComponents'
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  InjectedIntl
} from 'react-intl'
import { IToggleMenuItem, ToggleMenu } from '@opencrvs/components/lib/interface'
import {
  SettingsBlack,
  LogoutBlack,
  AvatarSmall
} from '@opencrvs/components/lib/icons'
import { IStoreState } from '@register/store'
import { IUserDetails } from '@register/utils/userUtils'
import { getLanguage } from '@register/i18n/selectors'
import { getUserDetails } from '@register/profile/profileSelectors'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { redirectToAuthentication } from '@register/profile/profileActions'
import { goToSettings } from '@register/navigation'

const UserName = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  height: 27px;
`

const UserRole = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  height: 24px;
  ${({ theme }) => theme.fonts.captionStyle};
`

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  LOCAL_SYSTEM_ADMIN: {
    id: 'register.home.header.LOCAL_SYSTEM_ADMIN',
    defaultMessage: 'Sysadmin',
    description: 'The description for Sysadmin role'
  },
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
  userDetails: IUserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
  goToSettings: typeof goToSettings
}

interface IState {
  showLogoutModal: boolean
}

type FullProps = IProps & InjectedIntlProps

class ProfileMenuComponent extends React.Component<FullProps, IState> {
  getMenuItems = (intl: InjectedIntl): IToggleMenuItem[] => {
    const items = [] as IToggleMenuItem[]
    items.push({
      icon: <SettingsBlack />,
      label: intl.formatMessage(messages.settings),
      handler: this.props.goToSettings
    })
    items.push({
      icon: <LogoutBlack />,
      label: intl.formatMessage(messages.logout),
      handler: () => this.props.redirectToAuthentication()
    })
    return items
  }

  getMenuHeader = (
    intl: InjectedIntl,
    language: string,
    userDetails: IUserDetails | null
  ): JSX.Element => {
    let userName
    let userRole

    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName | null) => {
          const name = storedName as GQLHumanName
          return name.use === language
        }
      ) as GQLHumanName

      userName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`

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
          toggleButton={<AvatarSmall />}
          menuHeader={this.getMenuHeader(intl, language, userDetails)}
          menuItems={this.getMenuItems(intl)}
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
    redirectToAuthentication,
    goToSettings
  }
)(injectIntl(ProfileMenuComponent))
