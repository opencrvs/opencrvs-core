import * as React from 'react'
import { createTestComponent } from '@register/tests/util'
import { HamburgerMenu } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@register/store'

describe('when user is in the menu page', () => {
  const { store } = createStore()
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
    const testComponent = createTestComponent(
      <HamburgerMenu menuTitle={menuTitle} menuItems={menuItems} />,
      store
    )
    hamburgerComponent = testComponent.component
  })
  it('renders main menu title', () => {
    const menuName = hamburgerComponent
      .find(menuTitleTextSelector)
      .first()
      .text()
    expect(menuName).toBe('Menu')
  })
})
