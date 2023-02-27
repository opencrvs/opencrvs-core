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
import { Icon } from '../Icon'
import { Button } from '../Button'
import styled from 'styled-components'
import { Spinner } from '../Spinner'
import { Text } from '../Text'

interface IVerificationButtonProps {
  status?: 'unverified' | 'loading' | 'verified'
  onClick: () => void
  labelForVerifiedState: string
  labelForUnverifiedState: string
  labelForLoadingState: string
}

const StyledDiv = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  color: ${({ theme }) => theme.colors.primary};
  svg {
    height: 24px;
    width: 24px;
    vertical-align: top;
    margin-left: -2px;
    margin-right: 8px;
    pointer-events: none;
  }
`

export const VerificationButton = ({
  status = 'unverified',
  onClick,
  labelForUnverifiedState,
  labelForLoadingState,
  labelForVerifiedState
}: IVerificationButtonProps) => {
  return (
    <>
      {status === 'unverified' && (
        <Button size="medium" type="secondary" onClick={onClick}>
          <Icon name="CircleWavyCheck" />
          {labelForUnverifiedState}
        </Button>
      )}

      {status === 'loading' && (
        <StyledDiv>
          <Spinner
            id="nid-verification-loading"
            size={24}
            baseColor="currentColor"
          />
          <Text variant="bold16" element="p" color="primary">
            {labelForLoadingState}...
          </Text>
        </StyledDiv>
      )}

      {status === 'verified' && (
        <StyledDiv>
          <Icon name="CircleWavyCheck" fill="green" color="green" />
          <Text variant="bold16" element="p" color="green">
            {labelForVerifiedState}
          </Text>
        </StyledDiv>
      )}
    </>
  )
}
