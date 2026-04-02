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
import {
  defineMessages,
  injectIntl,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import styled from 'styled-components'
import { ConnectionError } from '@opencrvs/components/lib/icons'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { errorMessages } from '@client/v2-events/messages'
import { useOnlineStatus } from '@client/utils'

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const LoadingContainer = styled.div`
  width: 100%;
  padding-left: 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: flex;
    padding-left: 0px;
    margin: auto;
    align-items: center;
    justify-content: center;
  }
`

const MobileViewContainer = styled.div<{ noDeclaration?: boolean }>`
  padding-top: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    position: ${({ noDeclaration }) => (noDeclaration ? `fixed` : `relative`)};
    left: 0;
    right: 0;
    padding-top: 0;
    padding-bottom: 16px;
    ${({ noDeclaration }) => (noDeclaration ? `top:55%; padding: 0;` : ``)}
  }
`

type LoadingIndicatorCompProps = {
  loading: boolean
  isOnline: boolean
  hasError?: boolean
  noDeclaration?: boolean
} & IntlShapeProps

function LoadingIndicatorComp({
  loading,
  noDeclaration,
  hasError,
  intl,
  isOnline
}: LoadingIndicatorCompProps) {
  return (
    <Wrapper>
      {isOnline && loading && (
        <LoadingContainer>
          <Spinner baseColor="#4C68C1" id="Spinner" size={24} />
        </LoadingContainer>
      )}
      <MobileViewContainer noDeclaration={noDeclaration}>
        {isOnline && hasError && (
          <ErrorText id="search-result-error-text-count">
            {intl.formatMessage(errorMessages.queryError)}
          </ErrorText>
        )}
      </MobileViewContainer>
    </Wrapper>
  )
}

export function withOnlineStatus<ComponentProps>(
  Component: React.ComponentType<ComponentProps>
) {
  return (props: Omit<ComponentProps, 'isOnline'>) => {
    const isOnline = useOnlineStatus()
    return <Component isOnline={isOnline} {...(props as ComponentProps)} />
  }
}

export const LoadingIndicator = injectIntl(
  withOnlineStatus(LoadingIndicatorComp)
)
