import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { HamburgerMenu } from '@opencrvs/components/lib/interface'
import { ReactWrapper } from 'enzyme'
import { createStore } from '../store'

describe('when user is in the menu page', () => {
  const { store } = createStore()
  let hamburgerComponent: ReactWrapper<{}, {}>
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

  const menuTitleSelector =
    '.rc-menu.rc-menu-root li.rc-menu-submenu div.rc-menu-submenu-title'
  const menuTitleTextSelector = `${menuTitleSelector} span`

  const subMenuSelector =
    'ul.rc-menu.rc-menu-sub.rc-menu-inline li.rc-menu-submenu.rc-menu-submenu-inline'

  const subMenuItemSelector = `${subMenuSelector} ul li.rc-menu-item`

  const wholeListItemsSelector =
    '.rc-menu.rc-menu-root ul.rc-menu.rc-menu-sub.rc-menu-inline li'

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <HamburgerMenu menuItems={menuItems} />,
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
  it('Simulate menu open', () => {
    hamburgerComponent.find(menuTitleSelector).simulate('click')

    const subMenu = hamburgerComponent.find(
      '.rc-menu.rc-menu-root li.rc-menu-submenu.rc-menu-submenu-inline.rc-menu-submenu-open'
    )
    expect(subMenu.length).toBe(1)
  })
  describe('When user opens menu items', () => {
    // Applies only to tests in this describe block
    beforeEach(() => {
      hamburgerComponent.find(menuTitleSelector).simulate('click')
    })

    it('hides main menu title', () => {
      const menuName = hamburgerComponent
        .find(menuTitleTextSelector)
        .first()
        .text()
      expect(menuName).toBe('')
    })

    it('Renders whole list items', () => {
      const items = hamburgerComponent.find(wholeListItemsSelector)
      expect(items.length).toBe(6)
    })

    it('Renders nested submenu', () => {
      const items = hamburgerComponent.find(subMenuSelector)
      expect(items.length).toBe(1)
    })

    describe('When user opens menu language submenu items', () => {
      // Applies only to tests in this describe block
      beforeEach(() => {
        hamburgerComponent
          .find(`${subMenuSelector} div.rc-menu-submenu-title`)
          .simulate('click')
      })
      it('Renders nested submenu language items', () => {
        const items = hamburgerComponent.find(subMenuItemSelector)
        expect(items.length).toBe(2)
      })

      it('Check first submenu item text', () => {
        const item = hamburgerComponent.find(subMenuItemSelector).first()

        expect(item.text()).toBe('Bengali')
      })

      it('Check last submenu item text', () => {
        const item = hamburgerComponent.find(subMenuItemSelector).last()

        expect(item.text()).toBe('English')
      })
    })

    it('Check last list item text', () => {
      const item = hamburgerComponent.find(wholeListItemsSelector).last()
      expect(item.text()).toBe('Log out')
    })
  })
})
