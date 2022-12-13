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
import styled from 'styled-components'
import { Button, ButtonProps } from '../../Button'

export interface TabProps extends ButtonProps {
  id: string
  active?: boolean
}

export const Tab = styled(Button)<TabProps>`
  height: 38px; 
  white-space: nowrap;
  overflow: visible;
  border-radius: 0;
  padding: 0;
  color: ${({ theme, active }) =>
    active ? theme.colors.grey600 : theme.colors.grey500};
  box-shadow: 0px 2px 0px 0px
  ${({ theme, active }) => (active ? theme.colors.primary : 'none')};

  &:hover {
    background-color: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey600};
  }

  &:hover:focus {
    box-shadow: 0 2px 0 0  ${({ theme }) => theme.colors.primary};    
    color: ${({ theme }) => theme.colors.grey600};
  }

  &:focus-visible: {
    background: ${({ theme }) => theme.colors.yellow}
    color: ${({ theme }) => theme.colors.copy};
  }

  &:disabled {
    background: transparent;
  }

    `
