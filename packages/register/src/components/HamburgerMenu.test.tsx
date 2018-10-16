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

  const menuTitleElement =
    '.rc-menu.rc-menu-root li.rc-menu-submenu div.rc-menu-submenu-title span.submenu-title-wrapper'

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <HamburgerMenu menuItems={menuItems} />,
      store
    )
    hamburgerComponent = testComponent.component
  })
  it('renders main menu title', () => {
    const menuName = hamburgerComponent.find(menuTitleElement).text()
    expect(menuName).toBe('Menu')
  })
  it('Simulate menu open', () => {
    hamburgerComponent
      .find(
        '.rc-menu.rc-menu-root li.rc-menu-submenu div.rc-menu-submenu-title'
      )
      .simulate('click')

    const subMenu = hamburgerComponent.find(
      '.rc-menu.rc-menu-root li.rc-menu-submenu.rc-menu-submenu-inline.main-menu.rc-menu-submenu-open'
    )
    expect(subMenu.length).toBe(1)
  })
  describe('When user opens menu items', () => {
    // Applies only to tests in this describe block
    beforeEach(() => {
      hamburgerComponent
        .find(
          '.rc-menu.rc-menu-root li.rc-menu-submenu div.rc-menu-submenu-title'
        )
        .simulate('click')
    })

    it('hides main menu title', () => {
      const menuName = hamburgerComponent
        .find(menuTitleElement)
        .first()
        .text()
      expect(menuName).toBe('')
    })

    it('Renders whole list items', () => {
      const items = hamburgerComponent.find(
        '.rc-menu.rc-menu-root ul.rc-menu.rc-menu-sub.rc-menu-inline li'
      )
      expect(items.length).toBe(6)
    })

    it('Renders nested submenu', () => {
      const items = hamburgerComponent.find(
        'ul.rc-menu.rc-menu-sub.rc-menu-inline li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu'
      )
      expect(items.length).toBe(1)
    })

    describe('When user opens menu language submenu items', () => {
      // Applies only to tests in this describe block
      beforeEach(() => {
        hamburgerComponent
          .find(
            'ul.rc-menu.rc-menu-sub.rc-menu-inline li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu div.rc-menu-submenu-title'
          )
          .simulate('click')
      })
      it('Renders nested submenu language items', () => {
        const items = hamburgerComponent.find(
          'ul.rc-menu.rc-menu-sub.rc-menu-inline li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu ul li.rc-menu-item.nested-menu-item'
        )
        expect(items.length).toBe(2)
      })

      it('Check first submenu item text', () => {
        const item = hamburgerComponent
          .find(
            'ul.rc-menu.rc-menu-sub.rc-menu-inline li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu ul li.rc-menu-item.nested-menu-item'
          )
          .first()

        expect(item.text()).toBe('Bengali')
      })

      it('Check last submenu item text', () => {
        const item = hamburgerComponent
          .find(
            'ul.rc-menu.rc-menu-sub.rc-menu-inline li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu ul li.rc-menu-item.nested-menu-item'
          )
          .last()

        expect(item.text()).toBe('English')
      })
    })

    it('Check last list item text', () => {
      const item = hamburgerComponent
        .find('.rc-menu.rc-menu-root ul.rc-menu.rc-menu-sub.rc-menu-inline li')
        .last()
      expect(item.text()).toBe('Log out')
    })
  })
})
