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

interface ITextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
  readonly?: boolean
}

const StyledTextArea = styled.textarea<ITextAreaProps>`
  ${({ theme }) => theme.fonts.reg19};
  width: 100%;
  padding: 8px 16px;
  min-height: 104px;
  border-radius: 4px;
  border: 1.5px solid ${({ theme }) => theme.colors['border/emphasis']};
  background-color: ${({ theme }) => theme.colors['surface/default']};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors['text/disabled'] : theme.colors['text/primary']};

  &:hover {
    box-shadow: 0 0 0px 4px ${({ theme }) => theme.colors['border/default']};
  }
  &:focus {
    outline: 0.5px solid ${({ theme }) => theme.colors['border/emphasis']};
    border: 1.5px solid $ ${({ theme }) => theme.colors['border/emphasis']};
    box-shadow: 0 0 0px 4px ${({ theme }) => theme.colors['feedback/focus']};
  }

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors['text/tertiary']};
  }
  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors['text/tertiary']};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors['text/tertiary']};
  }
`

export const TextArea = (props: ITextAreaProps) => <StyledTextArea {...props} />
