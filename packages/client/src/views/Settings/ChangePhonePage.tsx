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
import { connect } from 'react-redux'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  FormattedMessage
} from 'react-intl'
import { IStoreState } from '@client/store'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import styled from '@client/styledComponents'
import { Header } from '@client/components/interface/Header/Header'
import { AvatarLarge, Avatar } from '@opencrvs/components/lib/icons'
import { DataSection } from '@opencrvs/components/lib/interface/ViewData'
import {
  ResponsiveModal,
  NOTIFICATION_TYPE,
  Notification
} from '@opencrvs/components/lib/interface'
import { Select } from '@opencrvs/components/lib/forms'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import {
  userMessages as messages,
  buttonMessages,
  constantsMessages
} from '@client/i18n/messages'
import { modifyUserDetails as modifyUserDetailsAction } from '@client/profile/profileActions'
import { getDefaultLanguage, getAvailableLanguages } from '@client/i18n/utils'
import { IntlState } from '@client/i18n/reducer'
import { PasswordChangeModal } from '@client/views/Settings/PasswordChangeModal'
import { goToPhoneSettings } from '@client/navigation'

const Container = styled.div`
  ${({ theme }) => theme.shadows.mistyShadow};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};
  padding: 40px 77px;
  margin: 36px auto;
  width: 1140px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 0;
    padding: 24px 0;
    width: 100%;
    min-height: 100vh;
    margin-top: 0;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
`

const SettingsTitle = styled.div`
  ${({ theme }) => theme.fonts.h1Style};
  height: 72px;
  margin-left: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
const Left = styled.div`
  margin: 0 16px;
  flex-grow: 1;
`
const Right = styled.div`
  display: flex;
  padding-top: 80px;
  margin-left: 112px;
  & .desktop {
    display: block;
  }
  & .tablet {
    display: none;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding-top: 0;
    margin-left: 24px;
    & .desktop {
      display: none;
    }
    & .tablet {
      display: block;
    }
  }
`
const Version = styled.div`
  color: ${({ theme }) => theme.colors.disabled};
  ${({ theme }) => theme.fonts.smallButtonStyle};
  text-transform: none;
  margin-top: 2rem;
  span:last-child {
    display: none;
  }
  :hover {
    span:first-child {
      display: none;
    }
    span:last-child {
      display: inline;
    }
  }
`
const Message = styled.div`
  margin-bottom: 16px;
`
const Label = styled.label`
  margin-bottom: 8px;
`
const ApplyButton = styled(PrimaryButton)`
  height: 40px;
  & div {
    padding: 0 8px;
  }
`
const CancelButton = styled(TertiaryButton)`
  height: 40px;
  & div {
    padding: 0;
  }
`
type IProps = IntlShapeProps & {
  language: string
  languages: IntlState['languages']
  userDetails: IUserDetails | null
  modifyUserDetails: typeof modifyUserDetailsAction
  goToPhoneSettings: typeof goToPhoneSettings
}

enum NOTIFICATION_SUBJECT {
  LANGUAGE,
  PASSWORD
}

interface IState {
  showLanguageSettings: boolean
  selectedLanguage: string
  showSuccessNotification: boolean
  showPasswordChange: boolean
  notificationSubject: NOTIFICATION_SUBJECT | null
}

interface ILanguageOptions {
  [key: string]: string
}

class SettingsView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showLanguageSettings: false,
      showSuccessNotification: false,
      selectedLanguage: this.props.language,
      showPasswordChange: false,
      notificationSubject: null
    }
  }

  render() {
    const { userDetails, intl } = this.props

    const mobile = (userDetails && userDetails.mobile) || ''

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''
    return (
      <>
        <Container>
          <Content>
            <span>Changed goes here</span>
          </Content>
        </Container>
      </>
    )
  }
}

export const ChangePhonePage = connect(
  (store: IStoreState) => ({
    language: store.i18n.language || getDefaultLanguage(),
    languages: store.i18n.languages,
    userDetails: getUserDetails(store)
  }),
  {
    modifyUserDetails: modifyUserDetailsAction
  }
)(injectIntl(SettingsView))
