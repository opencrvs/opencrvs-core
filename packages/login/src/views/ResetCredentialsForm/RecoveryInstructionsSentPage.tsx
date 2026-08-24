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
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Text } from '@opencrvs/components/lib/Text'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import {
  Container,
  LogoContainer
} from '@login/views/ResetCredentialsForm/Commons'
import React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'
import { selectCountryLogo } from '@login/login/selectors'
import { IStoreState } from '@login/store'
import { useLocation, useNavigate } from 'react-router-dom'
import * as routes from '@login/navigation/routes'

type Props = IntlShapeProps & { logo: string | undefined }

/*
 * Terminal screen, shown whether or not the account exists. No resend button
 * on purpose: resending needs a nonce, this screen never received one, and a
 * button that worked for real accounts while failing for the rest would tell
 * the visitor which they had typed. Anyone who got no mail starts over.
 */
const RecoveryInstructionsSentComponent = ({ intl, logo }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const forgottenItem =
    location.state?.forgottenItem || sessionStorage.getItem('forgottenItem')

  const notificationMethod = window.config.USER_NOTIFICATION_DELIVERY_METHOD

  return (
    <Frame
      header={<AppBar title="OpenCRVS" />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Frame.LayoutCentered>
        <Container id="recovery-instructions-sent-page">
          <Stack direction="column" alignItems="stretch" gap={24}>
            <LogoContainer>
              <CountryLogo src={logo} />
            </LogoContainer>
            <Stack direction="column" alignItems="center">
              <Text variant="h2" element="h1" align="center">
                {intl.formatMessage(
                  notificationMethod === 'sms'
                    ? messages.recoveryInstructionsSentTitlePhone
                    : messages.recoveryInstructionsSentTitleEmail
                )}
              </Text>
              <Text
                id="recovery-instructions-sent-body"
                variant="reg18"
                element="p"
                align="center"
                color="grey500"
              >
                {intl.formatMessage(messages.recoveryInstructionsSentBody, {
                  forgottenItem
                })}
              </Text>
            </Stack>

            <Button
              type="primary"
              size="large"
              id="login-button"
              onClick={() => navigate(routes.STEP_ONE)}
            >
              {intl.formatMessage(messages.backToLoginButtonLabel)}
            </Button>
          </Stack>
        </Container>
      </Frame.LayoutCentered>
    </Frame>
  )
}

export const RecoveryInstructionsSent = connect((state: IStoreState) => {
  return {
    logo: selectCountryLogo(state)
  }
})(injectIntl(RecoveryInstructionsSentComponent))
