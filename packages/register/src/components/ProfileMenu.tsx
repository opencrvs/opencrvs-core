import * as React from 'react'
import { connect } from 'react-redux'
import styled from '@register/styledComponents'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
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
import { buttonMessages, userMessages } from '@register/i18n/messages'

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

interface IProps {
  language: string
  userDetails: IUserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
  goToSettings: typeof goToSettings
}

interface IState {
  showLogoutModal: boolean
}

type FullProps = IProps & IntlShapeProps

class ProfileMenuComponent extends React.Component<FullProps, IState> {
  getMenuItems = (intl: IntlShape): IToggleMenuItem[] => {
    const items = [] as IToggleMenuItem[]
    items.push({
      icon: <SettingsBlack />,
      label: intl.formatMessage(buttonMessages.settings),
      handler: this.props.goToSettings
    })
    items.push({
      icon: <LogoutBlack />,
      label: intl.formatMessage(buttonMessages.logout),
      handler: () => this.props.redirectToAuthentication()
    })
    return items
  }

  getMenuHeader = (
    intl: IntlShape,
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

      if (nameObj) {
        userName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      }

      userRole =
        userDetails.role &&
        intl.formatMessage(userMessages[userDetails.role as string])
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
