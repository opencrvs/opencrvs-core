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

interface ITextAreaProps {
  ignoreMediaQuery?: boolean
}

const StyledTextArea = styled.textarea<ITextAreaProps>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  width: 100%;
  padding: 10px;
  min-height: 104px;
  max-width: 344px;
  border: 2px solid ${({ theme }) => theme.colors.menuBackground};
  &:focus {
    box-shadow: 0 0 0px 2px ${({ theme }) => theme.colors.focus};
    outline: 0;
  }
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.copy};

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 344px;
      }`
      : ''
  }}
`

export class TextArea extends React.Component {
  render() {
    return <StyledTextArea {...this.props} />
  }
}
