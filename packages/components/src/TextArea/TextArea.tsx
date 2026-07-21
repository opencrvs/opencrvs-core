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
import { lightColors } from '../semantics'

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
  border: 1.5px solid ${lightColors['border/emphasis']};
  background-color: ${lightColors['surface/default']};
  color: ${({ disabled }) =>
    disabled ? lightColors['text/disabled'] : lightColors['text/primary']};

  &:hover {
    box-shadow: 0 0 0px 4px ${lightColors['border/default']};
  }
  &:focus {
    outline: 0.5px solid ${lightColors['border/emphasis']};
    border: 1.5px solid $ ${lightColors['border/emphasis']};
    box-shadow: 0 0 0px 4px ${lightColors['feedback/focus']};
  }

  &::-webkit-input-placeholder {
    color: ${lightColors['text/tertiary']};
  }
  &::-moz-placeholder {
    color: ${lightColors['text/tertiary']};
  }
  &:-ms-input-placeholder {
    color: ${lightColors['text/tertiary']};
  }
`

export const TextArea = (props: ITextAreaProps) => <StyledTextArea {...props} />
