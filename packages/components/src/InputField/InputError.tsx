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

export interface IInputError {
  id: string
  centred?: boolean
  ignoreMediaQuery?: boolean
  color?: string
  children?: React.ReactNode
}

const InputErrorWrapper = styled.div<IInputError>`
  min-height: 18px;
  width: 100%;
  padding-top: 4px;
  display: inline-block;
  ${({ theme }) => theme.fonts.bold16}
  color: ${({ theme, color }) => (color ? color : theme.colors.negative)};
  text-align: ${({ centred }) => (centred ? 'center' : 'left')};
`

export const InputError = ({ children, centred, ...rest }: IInputError) => (
  <InputErrorWrapper centred={centred} {...rest}>
    {children}
  </InputErrorWrapper>
)
