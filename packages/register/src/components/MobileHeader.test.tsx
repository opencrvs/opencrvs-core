import * as React from 'react'
import { createTestComponent } from '../tests/util'
import { MobileHeader } from './MobileHeader'
import { Hamburger, SearchDark } from '@opencrvs/components/lib/icons'
import { Button } from '@opencrvs/components/lib/buttons'
import { createStore } from 'src/store'

describe('mobile header component', () => {
  const { store } = createStore()

  it('renders without crashing', () => {
    const component = createTestComponent(
      <MobileHeader
        id="register_mobile_header"
        left={
          <Button>
            <Hamburger />
          </Button>
        }
        title="Mobile header"
        right={
          <Button>
            <SearchDark />
          </Button>
        }
      />,
      store
    ).component
    expect(component.find('#register_mobile_header').hostNodes()).toHaveLength(
      1
    )

    expect(
      component
        .find('#header_title')
        .hostNodes()
        .text()
    ).toBe('Mobile header')
  })
})
