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

import React from 'react'
import { IToggleMenuItem, ToggleMenu } from '../ToggleMenu'
import { Icon } from '../Icon'
import styled from 'styled-components'

const ActionButton = styled.div`
  & > * {
    margin: 10px;
  }
  display: flex;
  justify-content: space-around;
`
const MenuHeader = styled.div`
  white-space: normal;
`

export interface IProps {
  id: string
  menuItems: IToggleMenuItem[]
  headerText?: string
}

export const Action = ({ id, menuItems, headerText }: IProps) => {
  return (
    <ToggleMenu
      id={id}
      toggleButtonType="primary"
      toggleButton={
        <ActionButton>
          <div>Action</div>
          <Icon name="CaretDown" color="white" />
        </ActionButton>
      }
      menuItems={menuItems}
      menuHeader={
        headerText ? <MenuHeader>{headerText}</MenuHeader> : undefined
      }
    ></ToggleMenu>
  )
}
