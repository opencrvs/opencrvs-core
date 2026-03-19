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
import React from 'react'
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
import { AvatarSmall } from '@client/components/Avatar'
import { IStoreState } from '@client/store'
import { UserDetails } from '@client/utils/userUtils'
import { getLanguage } from '@client/i18n/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { buttonMessages } from '@client/i18n/messages'
import { useNavigate } from 'react-router-dom'
import * as routes from '@client/navigation/routes'
import { getUsersFullName } from '@client/v2-events/utils'
import { formatUserRole } from '@client/v2-events/hooks/useRoles'
import { useCurrentUser } from '@client/v2-events/hooks/useCurrentUser'

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
  redirectToAuthentication: typeof redirectToAuthentication
}

type FullProps = IProps & IntlShapeProps

const ProfileMenuComponent = ({
  intl,
  redirectToAuthentication
}: FullProps) => {
  const navigate = useNavigate()
  const { currentUser: userDetails } = useCurrentUser()
  const getMenuItems = (intl: IntlShape): IToggleMenuItem[] => {
    const items = [] as IToggleMenuItem[]
    items.push({
      icon: <Icon name="Gear" size="small" />,
      label: intl.formatMessage(buttonMessages.settings),
      handler: () => navigate(routes.SETTINGS)
    })
    items.push({
      icon: <Icon name="SignOut" size="small" />,
      label: intl.formatMessage(buttonMessages.logout),
      handler: () => redirectToAuthentication()
    })
    return items
  }

  const getUserName = (userDetails: UserDetails | null): string => {
    let userName = ''

    if (userDetails && userDetails.name) {
      userName = getUsersFullName(userDetails.name, intl.locale)
    }

    return userName
  }

  const getMenuHeader = (userDetails: UserDetails | null): JSX.Element => {
    const userName = getUserName(userDetails)

    return (
      <>
        <UserName>{userName}</UserName>
        <UserRole>
          {userDetails && formatUserRole(userDetails.role, intl)}
        </UserRole>
      </>
    )
  }

  return (
    <>
      <ToggleMenu
        id="ProfileMenu"
        toggleButton={
          <AvatarSmall
            name={getUserName(userDetails)}
            avatar={userDetails?.avatar}
          />
        }
        menuHeader={getMenuHeader(userDetails)}
        menuItems={getMenuItems(intl)}
      />
    </>
  )
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store)
  }
}

export const ProfileMenu = connect(mapStateToProps, {
  redirectToAuthentication
})(injectIntl(ProfileMenuComponent))
