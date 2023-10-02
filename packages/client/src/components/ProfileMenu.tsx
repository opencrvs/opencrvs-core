/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
} from 'react-intl'
import {
  IToggleMenuItem,
  ToggleMenu
} from '@opencrvs/components/lib/ToggleMenu'
import { Icon } from '@opencrvs/components/lib/Icon'
import { SettingsBlack, LogoutBlack } from '@opencrvs/components/lib/icons'
import { AvatarSmall } from '@client/components/Avatar'
import { IStoreState } from '@client/store'
import { UserDetails, getIndividualNameObj } from '@client/utils/userUtils'
import { getLanguage } from '@client/i18n/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { goToSettings } from '@client/navigation'
import { buttonMessages } from '@client/i18n/messages'
import { getUserRole } from '@client/views/SysAdmin/Config/UserRoles/utils'

const UserName = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h4};
  margin-bottom: 6px;
`

const UserRole = styled.div`
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.reg14};
  margin-bottom: 6px;
`

interface IProps {
  language: string
  userDetails: UserDetails | null
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
      icon: <Icon name="Gear" size="small" />,
      label: intl.formatMessage(buttonMessages.settings),
      handler: this.props.goToSettings
    })
    items.push({
      icon: <Icon name="SignOut" size="small" />,
      label: intl.formatMessage(buttonMessages.logout),
      handler: () => this.props.redirectToAuthentication()
    })
    return items
  }

  getUserName = (language: string, userDetails: UserDetails | null): string => {
    let userName = ''

    if (userDetails && userDetails.name) {
      const nameObj = getIndividualNameObj(userDetails.name, language)

      if (nameObj) {
        userName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      }
    }

    return userName
  }

  getMenuHeader = (
    language: string,
    userDetails: UserDetails | null
  ): JSX.Element => {
    const userName = this.getUserName(language, userDetails)
    // let's remove this type assertion after #4458 merges in
    const userRole =
      userDetails?.role && getUserRole(language, userDetails.role)

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
          toggleButton={
            <AvatarSmall
              name={this.getUserName(language, userDetails)}
              avatar={userDetails?.avatar}
            />
          }
          menuHeader={this.getMenuHeader(language, userDetails)}
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

export const ProfileMenu = connect(mapStateToProps, {
  redirectToAuthentication,
  goToSettings
})(injectIntl(ProfileMenuComponent))
