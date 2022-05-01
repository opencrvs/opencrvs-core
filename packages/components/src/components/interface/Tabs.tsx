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
import styled, { StyledComponentBase } from 'styled-components'
import { Button, IButtonProps } from '../buttons'

export const Tabs = styled.div`
  position: relative;
`
export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export const Tab = styled(Button)<IProps>`
  margin-right: 24px;
  padding: 0;
  color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.grey300 : 'none')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border-bottom: ${({ theme, active }) =>
    active ? `2px solid ${theme.colors.primary}` : 'none'};
  & div {
    ${({ theme }) => theme.fonts.bold14};
    -webkit-justify-content: normal !important;
    display: contents;
    justify-content: normal !important;
    width: max-content;
  }
  &:hover:enabled {
    border-bottom: 2px solid ${({ theme }) => theme.colors.grey200};
  }
  &:disabled {
    background: transparent;
  }
`
