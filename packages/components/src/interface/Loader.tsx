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
import styled from 'styled-components'
import { Spinner } from './Spinner'
export interface ILoader {
  id: string
  loadingText?: string
  marginPercent?: number
  spinnerDiameter?: number
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
  flex-direction: column;
`
const LoadingTextContainer = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  text-align: center;
`

export class Loader extends React.Component<ILoader> {
  render() {
    const { id, loadingText, marginPercent, spinnerDiameter } = this.props
    return (
      <LoadingContainer id={id} marginPercent={marginPercent}>
        <StyledSpinner id={id + '_spinner'} size={spinnerDiameter} />
        {loadingText && (
          <LoadingTextContainer>{loadingText}</LoadingTextContainer>
        )}
      </LoadingContainer>
    )
  }
}
