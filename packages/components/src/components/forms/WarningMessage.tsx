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
import { Warning } from '../icons'

interface IWarningProps {
  children: string
  ignoreMediaQuery?: boolean
}

const Container = styled.div<{ ignoreMediaQuery?: boolean }>`
  flex-direction: row;
  display: flex;
  margin: 24px 0;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`
const StyledParagraph = styled.div`
  ${({ theme }) => theme.fonts.bold16};
`

export function WarningMessage(props: IWarningProps) {
  return (
    <Container ignoreMediaQuery={props.ignoreMediaQuery}>
      <Warning />
      <StyledParagraph>{props.children}</StyledParagraph>
    </Container>
  )
}
