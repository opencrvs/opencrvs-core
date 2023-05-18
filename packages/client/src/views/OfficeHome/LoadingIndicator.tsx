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
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Toast } from '@opencrvs/components/lib/Toast'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from 'styled-components'
import { errorMessages, constantsMessages } from '@client/i18n/messages'
import { isNavigatorOnline } from '@client/utils'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const LoadingContainer = styled.div`
  width: 100%;
  padding-right: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: flex;
    padding-left: 0px;
    margin: auto;
    align-items: center;
    justify-content: center;
  }
`

type IBaseLoadingProps = {
  loading: boolean
  hasError?: boolean
  noDeclaration?: boolean
}

type IProps = IBaseLoadingProps & IntlShapeProps & IOnlineStatusProps

export class LoadingIndicatorComp extends React.Component<IProps> {
  render() {
    const { loading, noDeclaration, hasError, intl } = this.props
    const hasContent =
      (loading && this.props.isOnline) || hasError || !this.props.isOnline

    return (
      <Wrapper style={{ display: hasContent ? 'flex' : 'none' }}>
        {this.props.isOnline && loading && (
          <LoadingContainer>
            <Spinner id="Spinner" size={20} baseColor="#4C68C1" />
          </LoadingContainer>
        )}
        {this.props.isOnline && hasError && (
          <Toast type="error" id="search-result-error-text-count">
            {intl.formatMessage(errorMessages.queryError)}
          </Toast>
        )}
      </Wrapper>
    )
  }
}

export function withOnlineStatus<T>(
  WrappedComponent: React.ComponentType<T & IOnlineStatusProps>
) {
  return function WithOnlineStatus(props: T) {
    const isOnline = useOnlineStatus()
    return <WrappedComponent isOnline={isOnline} {...props} />
  }
}

export function useOnlineStatus() {
  const [isOnline, setOnline] = React.useState(isNavigatorOnline())
  const ONLINE_CHECK_INTERVAL = 500
  React.useEffect(() => {
    const intervalID = setInterval(
      () => setOnline(isNavigatorOnline()),
      ONLINE_CHECK_INTERVAL
    )

    return () => clearInterval(intervalID)
  }, [])
  return isOnline
}

export type IOnlineStatusProps = {
  isOnline: boolean
}

export const LoadingIndicator = injectIntl(
  withOnlineStatus(LoadingIndicatorComp)
)
