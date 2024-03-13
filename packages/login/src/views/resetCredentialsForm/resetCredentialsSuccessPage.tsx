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
import { goToHome, FORGOTTEN_ITEMS } from '@login/login/actions'
import { storage } from '@login/storage'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Box } from '@opencrvs/components/lib/Box'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Text } from '@opencrvs/components/lib/Text'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { LogoContainer } from '@login/views/resetCredentialsForm/commons'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { RouteComponentProps } from 'react-router'
import { selectCountryLogo } from '@login/login/selectors'
import { IStoreState } from '@login/store'
import { constantsMessages } from '@login/i18n/messages/constants'

const Container = styled(Box)`
  position: relative;
  height: auto;
  margin: auto;
  width: min(330px, 90%);
`

export class ResetCredentialsSuccessView extends React.Component<
  { goToHome: typeof goToHome } & RouteComponentProps<
    {},
    {},
    { forgottenItem: FORGOTTEN_ITEMS }
  > &
    IntlShapeProps & { logo: string | undefined }
> {
  async componentDidMount() {
    await storage.removeItem('USER_DETAILS')
  }
  render() {
    const { intl, goToHome, logo } = this.props
    const { forgottenItem } = this.props.location.state
    return (
      <Frame
        header={<AppBar title="OpenCRVS" />}
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Frame.LayoutCentered>
          <Container id="reset-credentials-success-page">
            <Stack direction="column" alignItems="stretch" gap={24}>
              <LogoContainer>
                <CountryLogo src={logo} />
              </LogoContainer>
              <Stack direction="column" alignItems="center">
                <Text
                  variant="h2"
                  element="h1"
                  align="center"
                  id="authenticating-label"
                >
                  {intl.formatMessage(messages.successPageTitle, {
                    forgottenItem
                  })}
                </Text>
                <Text
                  variant="reg18"
                  element="p"
                  align="center"
                  color="grey500"
                  id="authenticating-label"
                >
                  {window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'sms'
                    ? intl.formatMessage(messages.successPageSubtitlePhone, {
                        forgottenItem
                      })
                    : intl.formatMessage(messages.successPageSubtitleEmail, {
                        forgottenItem
                      })}
                </Text>
              </Stack>

              <Button
                type="primary"
                size="large"
                id="login-button"
                onClick={goToHome}
              >
                {intl.formatMessage(messages.loginButtonLabel)}
              </Button>
            </Stack>
          </Container>
        </Frame.LayoutCentered>
      </Frame>
    )
  }
}

export const ResetCredentialsSuccessPage = connect(
  (state: IStoreState) => {
    return {
      logo: selectCountryLogo(state)
    }
  },
  {
    goToHome
  }
)(injectIntl(ResetCredentialsSuccessView))
