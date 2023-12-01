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
import { Meta, Story } from '@storybook/react'
import React, { useState } from 'react'
import { ExpandingMenu } from './ExpandingMenu'
import { Hamburger } from '../icons'

interface IUserDetails {
  name: string
  role: string
}
interface IMenuItem {
  icon: React.ReactNode
  iconHover?: React.ReactNode
  label: string
  secondary?: boolean
  onClick: (e: React.MouseEvent) => void
}

interface IProps {
  showMenu: boolean
  userDetails: IUserDetails
  menuItems: IMenuItem[]
  menuCollapse: () => void
}

export default {
  title: 'Layout/Expanding menu',
  component: ExpandingMenu,
  argTypes: {
    showMenu: {
      control: {
        type: 'select',
        options: [true, false]
      }
    }
  }
} as Meta

const Template: Story<IProps> = () => {
  const [showMenu, setMenu] = useState(false)
  return (
    <>
      <Hamburger onClick={() => setMenu(true)} />
      <ExpandingMenu showMenu={showMenu} menuCollapse={() => setMenu(false)} />
    </>
  )
}
export const ExpandingMenuView = Template.bind({})
