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
import React from 'react'
import styled from 'styled-components'
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'

interface ConnectionStatusProps {
  isOnline?: boolean
  className?: string
}

const Dot = styled.span<{ isOnline: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ isOnline }) =>
    isOnline
      ? lightColors['feedback/positive']
      : lightColors['feedback/negative']};
  margin-right: 4px;
`

const Label = styled.span`
  ${({ theme }) => theme.fonts.reg12};
  color: ${lightColors['text/tertiary']};
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline = false,
  className
}) => {
  return (
    <Container className={className}>
      <Dot isOnline={isOnline} />
      <Label>{isOnline ? 'Online' : 'Offline'}</Label>
    </Container>
  )
}
