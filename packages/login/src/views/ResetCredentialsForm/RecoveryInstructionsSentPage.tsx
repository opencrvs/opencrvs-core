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
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Text } from '@opencrvs/components/lib/Text'
import React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'
import { useLocation, useNavigate } from 'react-router-dom'
import * as routes from '@login/navigation/routes'

/*
 * Terminal screen shown after /verifyUser is called, no matter whether the
 * account exists. There is deliberately no resend button here: a resend
 * would need a nonce the client never received, and adding one would
 * reintroduce the account-enumeration oracle this flow exists to close.
 * If the user got nothing, they start over from the forgotten item form.
 */
const RecoveryInstructionsSentComponent = ({
  intl
}: WrappedComponentProps) => {
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
      <Content
        size={ContentSize.SMALL}
        title={intl.formatMessage(
          notificationMethod === 'sms'
            ? messages.recoveryInstructionsSentTitlePhone
            : messages.recoveryInstructionsSentTitleEmail
        )}
        showTitleOnMobile
        bottomActionButtons={[
          <Button
            key="1"
            id="login-button"
            type="primary"
            size="large"
            onClick={() => navigate(routes.STEP_ONE)}
          >
            {intl.formatMessage(messages.loginButtonLabel)}
          </Button>
        ]}
      >
        <Text
          id="recovery-instructions-sent-body"
          variant="reg16"
          element="p"
          color="grey500"
        >
          {intl.formatMessage(messages.recoveryInstructionsSentBody, {
            forgottenItem
          })}
        </Text>
      </Content>
    </Frame>
  )
}

export const RecoveryInstructionsSent = injectIntl(
  RecoveryInstructionsSentComponent
)
