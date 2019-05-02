import * as React from 'react'
import { createTestComponent } from '../tests/util'
import { MobileHeader } from './MobileHeader'
import { Hamburger, SearchDark } from '@opencrvs/components/lib/icons'
import { createStore } from 'src/store'

describe('mobile header component', () => {
  const { store } = createStore()

  it('renders without crashing', () => {
    const component = createTestComponent(
      <MobileHeader
        id="register_mobile_header"
        leftIcon={() => <Hamburger />}
        title="Mobile header"
        rightIcon={() => <SearchDark />}
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

  it('renders hamburger and search icons if no icons passed as props', () => {
    const component = createTestComponent(
      <MobileHeader id="register_mobile_header" title="Mobile header" />,
      store
    ).component

    expect(component.find('#register_mobile_header').hostNodes()).toHaveLength(
      1
    )

    expect(component.find('#mobile_header_left').find(Hamburger)).toHaveLength(
      1
    )

    expect(
      component.find('#mobile_header_right').find(SearchDark)
    ).toHaveLength(1)
  })
})
