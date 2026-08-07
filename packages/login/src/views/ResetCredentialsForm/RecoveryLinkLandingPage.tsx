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
import { authApi } from '@login/utils/authApi'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Link } from '@opencrvs/components/lib/Link'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Text } from '@opencrvs/components/lib/Text'
import React, { useEffect, useState } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'
import { useLocation, useNavigate } from 'react-router-dom'
import * as routes from '@login/navigation/routes'

/*
 * Landing page for the single-use recovery link. Exchanges the `token` query
 * param for a nonce and security question, then hands off to the security
 * question step.
 *
 * `forgottenItem` comes from the exchange response, never the URL — a flow in
 * the URL is attacker-controlled, so a password-reset link could be edited
 * into a username reminder.
 *
 * Expired, already-used and bogus tokens all render identically, so failure
 * never reveals whether the account exists.
 */
const RecoveryLinkLandingComponent = ({ intl }: WrappedComponentProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token')

    // A second link shows the spinner again rather than the first one's error.
    setFailed(false)

    const exchangeToken = async () => {
      if (!token) {
        setFailed(true)
        return
      }

      try {
        const { nonce, securityQuestionKey, retrieveFlow } =
          await authApi.verifyRecoveryToken(token)

        navigate(routes.SECURITY_QUESTION, {
          state: {
            nonce,
            securityQuestionKey,
            forgottenItem: retrieveFlow
          },
          replace: true
        })
      } catch {
        setFailed(true)
      }
    }

    exchangeToken()
    // Keyed on location.search, not []: a second link updates the query string
    // without remounting, so the effect must rerun to exchange the new token.
  }, [location.search])

  if (!failed) {
    return (
      <Frame
        header={<AppBar title="OpenCRVS" />}
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Frame.LayoutCentered>
          <Spinner id="recovery-link-verifying-spinner" />
        </Frame.LayoutCentered>
      </Frame>
    )
  }

  return (
    <Frame
      header={<AppBar title="OpenCRVS" />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Content
        size={ContentSize.SMALL}
        title={intl.formatMessage(messages.recoveryLinkExpiredTitle)}
        showTitleOnMobile
      >
        <Text
          id="recovery-link-expired-body"
          variant="reg16"
          element="p"
          color="grey500"
        >
          {intl.formatMessage(messages.recoveryLinkExpiredBody)}
        </Text>
        <Link
          id="recovery-link-expired-restart"
          font="bold16"
          onClick={() => navigate(routes.FORGOTTEN_ITEM)}
        >
          {intl.formatMessage(messages.recoveryLinkExpiredLinkLabel)}
        </Link>
      </Content>
    </Frame>
  )
}

export const RecoveryLinkLanding = injectIntl(RecoveryLinkLandingComponent)
