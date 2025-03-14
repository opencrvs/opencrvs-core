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
import styled from 'styled-components'
import { Spinner } from '../Spinner'

export interface ILoader {
  id: string
  loadingText?: string
  marginPercent?: number
  spinnerDiameter?: number
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
}
export interface IDiaMeter {
  diameter: number | undefined
}

const StyledSpinner = styled(Spinner)`
  width: 100%;
  height: 100%;
  margin: 24px 0;
`
const LoadingContainer = styled.div<ILoader>`
  width: 100%;
  margin: ${({ marginPercent }) => marginPercent}% auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: ${({ flexDirection }) => flexDirection || 'column'};
`
const LoadingTextContainer = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  text-align: center;
`

export const Loader = ({
  id,
  loadingText,
  marginPercent,
  spinnerDiameter,
  flexDirection
}: ILoader) => (
  <LoadingContainer
    id={id}
    marginPercent={marginPercent}
    flexDirection={flexDirection}
  >
    <StyledSpinner id={id + '_spinner'} size={spinnerDiameter} />
    {loadingText && <LoadingTextContainer>{loadingText}</LoadingTextContainer>}
  </LoadingContainer>
)
