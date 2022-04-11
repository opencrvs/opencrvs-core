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
  margin-right: 10px;
  padding-right: 10px;
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.indigo500};
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border-bottom: ${({ theme, active }) =>
    active ? `2px solid ${theme.colors.indigo500}` : 'none'};
  & div {
    padding-left: 0px;
    padding-right: 20px;
    -webkit-justify-content: normal !important;
    display: contents;
    justify-content: normal !important;
    width: max-content;
  }
  &:disabled {
    background: transparent;
  }
  ${({ theme }) => theme.fonts.bold16};
`
