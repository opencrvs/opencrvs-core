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

interface ConnectionStatusProps {
  isOnline?: boolean
  className?: string
}

const Dot = styled.span<{ isOnline: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ isOnline, theme }) =>
    isOnline ? theme.colors.green : theme.colors.red};
  margin-right: 4px;
`

const Label = styled.span`
  ${({ theme }) => theme.fonts.reg12};
  color: ${({ theme }) => theme.colors.grey500};
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
