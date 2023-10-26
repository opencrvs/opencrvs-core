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

interface ITextAreaProps {
  ignoreMediaQuery?: boolean
  maxLength?: number
  readonly?: boolean
}

const StyledTextArea = styled.textarea<ITextAreaProps>`
  ${({ theme }) => theme.fonts.reg18};
  width: 100%;
  padding: 10px;
  min-height: 104px;
  border-radius: 4px;
  border: 2px solid ${({ theme }) => theme.colors.grey600};
  &:focus {
    box-shadow: 0 0 0px 2px ${({ theme }) => theme.colors.yellow};
    outline: 0;
  }
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }
  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholderCopy};
  }
`

export class TextArea extends React.Component<ITextAreaProps> {
  render() {
    return <StyledTextArea {...this.props} />
  }
}
