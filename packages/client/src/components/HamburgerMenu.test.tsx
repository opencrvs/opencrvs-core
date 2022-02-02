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
import * as React from 'react'
import { createTestComponent } from '@client/tests/util'
import { HamburgerMenu } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'

describe('when user is in the menu page', () => {
  const { store, history } = createStore()
  let hamburgerComponent: ReactWrapper<{}, {}>
  const menuTitle = 'Menu'
  const menuItems = [
    {
      title: 'Change Language',
      key: 'change-language',
      isSubMenu: true,
      menuItems: [
        {
          title: 'Bengali',
          key: 'bengali'
        },
        {
          title: 'English',
          key: 'english'
        }
      ]
    },
    {
      title: 'Homepage',
      key: 'homepage'
    },
    {
      title: 'Drafts',
      key: 'drafts'
    },
    {
      title: 'Register',
      key: 'register'
    },
    {
      title: 'Settings',
      key: 'settings'
    },
    {
      title: 'Log out',
      key: 'logout'
    }
  ]

  const menuTitleTextSelector = `#sub-menu-wrapper`

  beforeEach(async () => {
    hamburgerComponent = await createTestComponent(
      <HamburgerMenu menuTitle={menuTitle} menuItems={menuItems} />,
      { store, history }
    )
  })
  it('renders main menu title', () => {
    const menuName = hamburgerComponent
      .find(menuTitleTextSelector)
      .first()
      .text()
    expect(menuName).toBe('Menu')
  })
})
