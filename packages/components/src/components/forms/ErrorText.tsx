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
import { Warning } from '../icons'
import { Paragraph } from '../typography'
import styled from 'styled-components'

interface IErrorTextProps {
  id?: string
  children: string
  ignoreMediaQuery?: boolean
}

const Container = styled.div<{ ignoreMediaQuery?: boolean }>`
  flex-direction: row;
  display: flex;
  align-items: center;
  margin-top: -20px;
  margin-bottom: 4px;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`
const StyledParagraph = styled(Paragraph)`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.error};
`

export function ErrorText(props: IErrorTextProps) {
  return (
    <Container id={props.id} ignoreMediaQuery={props.ignoreMediaQuery}>
      <Warning />
      <StyledParagraph>{props.children}</StyledParagraph>
    </Container>
  )
}
