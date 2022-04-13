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
import { Spinner } from '@opencrvs/components/lib/interface'
import { NoWifi } from '@opencrvs/components/lib/icons'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from 'styled-components'
import { errorMessages } from '@client/i18n/messages'

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`
const Loading = styled(Spinner)`
  width: 24px;
  margin-right: 13px;
`
const NoConnectivity = styled(NoWifi)`
  margin-right: 13px;
`
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
const Text = styled.span`
  ${({ theme }) => theme.fonts.reg16};
  display: flex;
`

type IBaseLoadingProps = {
  loading: boolean
  hasError: boolean
  noDeclaration?: boolean
}

type IProps = IBaseLoadingProps & IntlShapeProps & IOnlineStatusProps

export class LoadingIndicatorComp extends React.Component<IProps> {
  render() {
    const { loading, noDeclaration, hasError, intl } = this.props

    return (
      <Wrapper>
        {this.props.isOnline && loading && (
          <>
            <Loading id="Spinner" baseColor="#4C68C1" />
            <Text id="loading-text">
              {intl.formatMessage(errorMessages.loadingDeclarations)}
            </Text>
          </>
        )}
        {this.props.isOnline && hasError && (
          <ErrorText id="search-result-error-text-count">
            {intl.formatMessage(errorMessages.queryError)}
          </ErrorText>
        )}
        {this.props.isOnline && noDeclaration && (
          <Text id="no-declaration-text">
            {intl.formatMessage(errorMessages.noDeclaration)}
          </Text>
        )}
        {!this.props.isOnline && (
          <>
            <NoConnectivity />
            <Text id="wait-connection-text">
              {intl.formatMessage(errorMessages.waitingForConnection)}
            </Text>
          </>
        )}
      </Wrapper>
    )
  }
}

export function withOnlineStatus<T>(
  WrappedComponent: React.ComponentType<T & IOnlineStatusProps>
) {
  const ONLINE_CHECK_INTERVAL = 500

  return function WithOnlineStatus(props: T) {
    const [isOnline, setOnline] = React.useState(navigator.onLine)

    React.useEffect(() => {
      const intervalID = setInterval(
        () => setOnline(navigator.onLine),
        ONLINE_CHECK_INTERVAL
      )

      return () => clearInterval(intervalID)
    }, [])

    return <WrappedComponent isOnline={isOnline} {...props} />
  }
}

export type IOnlineStatusProps = {
  isOnline: boolean
}

export const LoadingIndicator = injectIntl(
  withOnlineStatus(LoadingIndicatorComp)
)
