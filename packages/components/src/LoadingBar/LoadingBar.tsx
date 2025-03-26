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
import { Text } from '../Text'
import React from 'react'
import styled, { keyframes } from 'styled-components'

const ProgressBackground = styled.div`
  background: ${({ theme }) => theme.colors.grey100};
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const ProgressBar = styled.div`
  width: 276px;
  height: 8px;
  margin-top: 27px;
  border-radius: 100px;
  opacity: 0px;
  background: ${({ theme }) => theme.colors.grey300};
`

const ProgressAnimation = keyframes`
  0% { min-width: 5%; }
  1% { min-width: 20%; }
  2% { min-width: 40%; }
  10% { min-width: 60%; }
  50% { min-width: 80%; }
  100% { min-width: 90%; }
  `
const Progress = styled.div`
  width: 0;
  height: 8px;
  gap: 0px;
  border-radius: 100px;
  opacity: 0px;
  background: ${({ theme }) => theme.colors.primary};
  animation: ${ProgressAnimation} 300s ease;
`
export const LoadingBar = () => (
  <ProgressBackground>
    <img
      src="/images/logo-90x90.svg"
      alt="OpenCRVS Logo"
      width={90}
      height={90}
    />
    <ProgressBar id="appSpinner">
      <Progress id="progress" />
    </ProgressBar>
    <Text variant="reg16" element="p">
      Loading records...
    </Text>
  </ProgressBackground>
)
