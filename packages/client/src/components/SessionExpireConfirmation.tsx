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
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/session'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { IStoreState } from '@client/store'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'

type SessionExpireProps = {
  sessionExpired: boolean
}
interface IProps {
  redirectToAuthentication: typeof redirectToAuthentication
}

class SessionExpireComponent extends React.Component<
  SessionExpireProps & IProps & IntlShapeProps
> {
  handleLogin = () => {}
  render() {
    const { intl, sessionExpired } = this.props
    return (
      <>
        {sessionExpired && (
          <ResponsiveModal
            title={intl.formatMessage(messages.sessionExpireTxt)}
            contentHeight={96}
            responsive={false}
            actions={[
              <PrimaryButton
                key="login"
                id="login"
                onClick={() => this.props.redirectToAuthentication(true)}
              >
                {intl.formatMessage(buttonMessages.login)}
              </PrimaryButton>
            ]}
            show={true}
          />
        )}
      </>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    sessionExpired: store.notification.sessionExpired
  }
}

export const SessionExpireConfirmation = connect<
  SessionExpireProps,
  IProps,
  SessionExpireProps & IProps,
  IStoreState
>(mapStateToProps, {
  redirectToAuthentication
})(injectIntl(SessionExpireComponent)) as any
