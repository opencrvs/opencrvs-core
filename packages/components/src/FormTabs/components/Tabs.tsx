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
import styled from 'styled-components'
import { Button, IButtonProps } from '../../buttons'
import { ITabColor } from '../FormTabs'

export const Tabs = styled.div`
  display: flex;
  align-items: flex-end;
  overflow: auto;
  white-space: nowrap;
`
export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
  activeColor?: ITabColor
}

export const Tab = styled(Button)<IProps>`
  --color: ${({ theme, activeColor }) =>
    activeColor ? activeColor : theme.colors.primary};
  border-radius: 0;
  margin-top: 8px;
  margin-right: 16px;
  padding: 0;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.grey300 : 'var(--color)'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border-bottom: ${({ active }) =>
    active ? `2px solid var(--color)` : '2px solid transparent'};
  > div {
    padding: 0px;
  }
  &:hover:enabled {
    border-bottom: 2px solid ${({ theme }) => theme.colors.grey300};
  }

  &:disabled {
    background: transparent;
  }
`
