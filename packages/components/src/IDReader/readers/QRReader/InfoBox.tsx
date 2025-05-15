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
import { Box } from '../../../Box'
import styled from 'styled-components'
import { Stack } from '../../../Stack'
import { Text } from '../../../Text'
import { Icon, IconProps } from '../../../Icon'

interface InfoBoxProps {
  iconName: IconProps['name']
  children: React.ReactNode
}

const Container = styled(Box)`
  background-color: ${({ theme }) => theme.colors.background};
  border: 0;
  flex: 1;
`
const IconContainer = styled.div`
  height: 44px;
  width: 44px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    height: 37px;
    width: 37px;
  }
`
const InfoBox = (props: InfoBoxProps) => {
  return (
    <Container>
      <Stack alignItems="center">
        <IconContainer>
          <Icon name={props.iconName} size="large" />
        </IconContainer>
        <Text variant="reg14" element="p">
          {props.children}
        </Text>
      </Stack>
    </Container>
  )
}

export default InfoBox
